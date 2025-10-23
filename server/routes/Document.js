const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const { protect } = require('../middlewares/authMiddleware');
const { uploadFromBuffer } = require('../config/cloudinaryConfig');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const  { GoogleGenAI } =require("@google/genai");

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// --- @route   POST /api/documents/upload ---
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    const { type } = req.body;
    if (!type || !['resume', 'jd'].includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const uploadResult = await uploadFromBuffer(req.file.buffer);
    const { secure_url } = uploadResult;

    const doc = new Document({
      user: req.user.id,
      type,
      filename: req.file.originalname,
      fileUrl: secure_url,
    });
    await doc.save();

    const dataBuffer = new Uint8Array(req.file.buffer);

    const parser = new PDFParse(dataBuffer); 
	  const rawText = await parser.getText();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.createDocuments([rawText.text]);

    const chunksToSave = splitDocs.map((splitDoc) => ({
      user: req.user.id,
      document: doc._id, 
      type: type,
      text: splitDoc.pageContent,
    }));

    const ai = new GoogleGenAI({});
    
    const texts = chunksToSave.map(chunk => chunk.text);
    
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: texts,
    });
    const embeddings = response.embeddings;

    const chunksWithEmbeddings = chunksToSave.map((chunk, i) => {
      if (!embeddings[i] || embeddings[i].length === 0) {
        throw new Error(`Failed to get embedding for chunk ${i}`);
      }
      return {
        ...chunk,
        embedding: embeddings[i].values,
      };
    });

    await Chunk.insertMany(chunksWithEmbeddings);
    
    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: doc,
    });

  } catch (err) {
    console.error(err); 
    res.status(500).send('Server Error');
  }
});

// --- @route   GET /api/documents/list ---
router.get('/list', protect, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- @route   DELETE /api/documents/:id ---
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Chunk.deleteMany({ document: document._id });

    await document.deleteOne();

    res.status(200).json({ message: 'Document and all chunks removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;