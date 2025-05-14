const express = require('express');
const User = require('../models/User');
const Content = require('../models/Content');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'userId name email role');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    const user = await User.findOneAndDelete({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (userId === req.user.userId) {
      return res.status(403).json({ error: 'Cannot update your own role' });
    }
    if (!['educator', 'student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all content
router.get('/content', adminAuth, async (req, res) => {
  try {
    const content = await Content.find().populate('createdBy', 'name email');
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/content/:contentId', adminAuth, async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({ contentId: req.params.contentId });
    if (!content) return res.status(404).json({ error: 'Content not found' });
    res.status(200).json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;