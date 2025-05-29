const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  contentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['text', 'image', 'video', 'document'] },
  fileUrl: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1.0 },
  lastUpdated: { type: Date, default: Date.now },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Content', contentSchema);

