const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middlewares/authMiddleware');
const Chunk = require('../models/Chunk');
const Chat = require('../models/Chat');
const { getEmbedding, genAI } = require('../utils/ragUtils'); 

// --- @route   POST /api/chat/start ---
router.post('/start', protect, async (req, res) => {
  const { resumeId, jdId } = req.body;
  if (!resumeId || !jdId) {
    return res.status(400).json({ message: 'Resume ID and JD ID are required.' });
  }

  try {
    const jdChunks = await Chunk.find({ user: req.user.id, document: jdId });
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

module.exports = router;