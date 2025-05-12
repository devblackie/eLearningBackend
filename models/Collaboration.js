const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  collaborationId: { type: String, unique: true, required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now },
  }],
  editHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    change: String,
    timestamp: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('Collaboration', collaborationSchema);