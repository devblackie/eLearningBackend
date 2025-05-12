const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  analyticsId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  timeSpent: Number,
  engagementScore: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analytics', analyticsSchema);