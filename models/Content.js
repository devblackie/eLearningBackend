const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  contentId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: String,
  version: { type: Number, default: 1.0 },
  lastUpdated: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['text', 'video', 'quiz'], required: true },
  fileUrl: String,
});

module.exports = mongoose.model('Content', contentSchema);