const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const getEmbedding = async (text) => {
  try {
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-001", 
      contents: [text] ,
    });
    
    const embedding = result.embeddings;
    return embedding;

  } catch (error) {
    console.error("Error getting Gemini embedding:", error);
    throw error;
  }
};

module.exports = { getEmbedding, genAI }; 