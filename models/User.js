const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: ['educator', 'student', 'admin'], required: true },
  passwordHash: { type: String, required: true },
  preferences: { type: Object, default: {} },
});

module.exports = mongoose.model('User', userSchema);