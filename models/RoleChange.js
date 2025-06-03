const mongoose = require('mongoose');

const roleChangeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  oldRole: {
    type: String,
    required: true,
    enum: ['student', 'educator', 'admin'],
  },
  newRole: {
    type: String,
    required: true,
    enum: ['student', 'educator', 'admin'],
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RoleChange', roleChangeSchema);