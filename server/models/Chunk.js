const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  type: {
    type: String,
    enum: ['resume', 'jd'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Chunk', ChunkSchema);