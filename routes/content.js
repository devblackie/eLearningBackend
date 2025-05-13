const express = require('express');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const Content = require('../models/Content');
const router = express.Router();
const config = require('../config/config');

// Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

cloudinary.config((config.cloudinaryName, config.cloudinaryKey, config.cloudinarySecret));

// Upload content
router.post('/content', async (req, res) => {
  try {
    const { title, description, type, file } = req.body;
    const contentId = uuidv4();

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: 'elearning-content',
      public_id: `${contentId}_${Date.now()}`,
    });

    const content = new Content({
      contentId,
      title,
      description,
      type,
      fileUrl: uploadResult.secure_url,
      createdBy: req.user._id, // Assumes user is authenticated
    });

    await content.save();
    res.status(201).json({ message: 'Content uploaded', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update content
router.put('/content/:contentId', async (req, res) => {
  try {
    const { title, description, type, file } = req.body;
    const content = await Content.findOne({ contentId: req.params.contentId });
    if (!content) return res.status(404).json({ error: 'Content not found' });

    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: 'elearning-content',
        public_id: `${content.contentId}_${Date.now()}`,
      });
      content.fileUrl = uploadResult.secure_url;
    }

    content.title = title || content.title;
    content.description = description || content.description;
    content.type = type || content.type;
    content.version += 0.1;
    content.lastUpdated = new Date();
    await content.save();

    res.status(200).json({ message: 'Content updated', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;