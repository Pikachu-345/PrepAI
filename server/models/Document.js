const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['resume', 'jd'],
    required: true,
  },
  filename: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);