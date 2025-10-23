const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middlewares/authMiddleware');
const Chunk = require('../models/Chunk');
const Chat = require('../models/Chat');
const Document = require('../models/Document');
const { getEmbedding, genAI } = require('../utils/ragUtils'); 

// --- @route   POST /api/chat/start ---
router.post('/start', protect, async (req, res) => {
  const { resumeId, jdId } = req.body;
  if (!resumeId || !jdId) {
    return res.status(400).json({ message: 'Resume ID and JD ID are required.' });
  }

  try {
    const jdChunks = await Chunk.find({ user: req.user.id, document: jdId });
    const resumeDoc = await Document.findById(resumeId);
    const jdDoc = await Document.findById(jdId);

    if (!resumeDoc || !jdDoc) {
      return res.status(404).json({ message: 'Resume or Job Description not found.' });
    }
    if (!jdChunks || jdChunks.length === 0) {
      return res.status(404).json({ message: 'Selected Job Description not found.' });
    }
    const jdContext = jdChunks.map(chunk => chunk.text).join('\n\n');

    const prompt = `You are a technical interviewer. Generate ONE (and only one) opening interview question based on this job description: ${jdContext}`;
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001", 
      contents: [{ parts: [{ text: prompt }] }],
    });

    console.log('Gemini response for first question:', response.candidates);
    const firstQuestion = response.text;

    const newChat = new Chat({
      user: req.user.id,
      resume: resumeId,
      jd: jdId,
      resumeFilename: resumeDoc.filename, 
      jdFilename: jdDoc.filename,
      messages: [{ role: 'model', content: firstQuestion }],
    });
    await newChat.save();

    res.status(201).json({
      chatId: newChat._id,
      firstMessage: firstQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- @route   POST /api/chat/query ---
router.post('/query', protect, async (req, res) => {
  const { chatId, message } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat || chat.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const { resume: resumeId, jd: jdId } = chat;
    const lastQuestion = chat.messages[chat.messages.length - 1].content;
    const queryEmbedding = await getEmbedding(message); 

    const collection = mongoose.connection.collection('chunks');
    const contextChunks = await collection.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding[0].values,
          numCandidates: 100,
          limit: 2,
          filter: {
            document: { $in: [resumeId, jdId] }
          }
        }
      },
      { $project: { _id: 0, text: 1 } }
    ]).toArray();
    const contextText = contextChunks.map(c => c.text).join('\n\n');

    const ragPrompt = `
      **Role:** You are a senior technical interviewer.
      **Context:** ${contextText || "No specific resume context found."}
      **Task:** The candidate is answering your last question.
      **Your Last Question:** "${lastQuestion}"
      **Candidate's Answer:** "${message}"
      **Your Response (in two parts):**
      1.  **Feedback:** Score (1-10) and brief feedback.
      2.  **Next Question:** Ask ONE new follow-up question.

      PS: Keep both parts concise and to the point.Don't add any fillers.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001", 
      contents: [{ parts: [{ text: ragPrompt }] }],
    });
    const aiResponse = response.text;
    console.log('Gemini response for user message:', aiResponse);
    
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'model', content: aiResponse });
    await chat.save();

    res.status(200).json({
      response: aiResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- @route   GET /api/chat/history ---
router.get('/history', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id.toString() })
      .select('_id createdAt resumeFilename jdFilename') 
      .sort({ createdAt: -1 }); 

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- @route   GET /api/chat/:id ---
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    if (chat.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(chat); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;