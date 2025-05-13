const express = require('express');
const Collaboration = require('../models/Collaboration');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Add comment
router.post('/collaboration/comment', async (req, res) => {
  try {
    const { contentId, text } = req.body;
    let collaboration = await Collaboration.findOne({ contentId });
    if (!collaboration) {
      collaboration = new Collaboration({
        collaborationId: uuidv4(),
        contentId,
        userIds: [req.user._id],
        comments: [],
        editHistory: [],
      });
    }

    collaboration.comments.push({
      userId: req.user._id,
      text,
      timestamp: new Date(),
    });

    await collaboration.save();
    res.status(201).json({ message: 'Comment added', collaboration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;