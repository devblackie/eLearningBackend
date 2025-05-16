const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Content = require('../models/Content');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, MP4, PDF'), false);
    }
  },
});

// Get all content
router.get('/content', authMiddleware, async (req, res) => {
  try {
    // Validate req.user
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Authentication failed: User not found' });
    }

    // Fetch content
    const contents = await Content.find().select('contentId title description type fileUrl createdBy version lastUpdated');
    res.status(200).json(contents);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch content' });
  }
});

// Upload content (POST /api/content)
router.post('/content', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Authentication failed: User not found' });
    }

    const title = req.body.title?.trim() || '';
    const description = req.body.description?.trim() || '';
    const type = req.body.type?.trim() || 'text';

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const validTypes = ['text', 'image', 'video', 'quiz'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid content type. Allowed: text, image, video, quiz' });
    }

    if (req.file) {
      if (type === 'video' && !req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ error: 'File must be a video (e.g., MP4) for type "video"' });
      }
      if (type === 'image' && !req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image (e.g., JPEG, PNG) for type "image"' });
      }
    }

    const contentId = uuidv4();
    let fileUrl = '';

    if (req.file) {
      const resourceType = type === 'video' ? 'video' : 'image';
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'elearning-content',
              public_id: `${contentId}_${Date.now()}`,
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        fileUrl = uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(400).json({ error: cloudinaryError.message || 'Failed to upload file to Cloudinary' });
      }
    }

    const content = new Content({
      contentId,
      title,
      description,
      type,
      fileUrl,
      createdBy: req.user._id,
    });

    try {
      await content.save();
    } catch (mongoError) {
      console.error('MongoDB save error:', mongoError);
      return res.status(400).json({ error: `Failed to save content: ${mongoError.message || 'Database error'}` });
    }

    res.status(201).json({ message: 'Content uploaded', content });
  } catch (error) {
    console.error('Content upload error:', error);
    if (error.message.includes('File too large')) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit. Please upload a smaller file.' });
    }
    res.status(500).json({ error: error.message || 'Failed to upload content' });
  }
});

// Update content (PUT /api/content/:contentId)
router.put('/content/:contentId', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Authentication failed: User not found' });
    }

    const title = req.body.title?.trim() || '';
    const description = req.body.description?.trim() || '';
    const type = req.body.type?.trim() || '';

    const content = await Content.findOne({ contentId: req.params.contentId });
    if (!content) return res.status(404).json({ error: 'Content not found' });

    if (type && !['text', 'image', 'video', 'quiz'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type. Allowed: text, image, video, quiz' });
    }

    if (req.file) {
      const resourceType = type === 'video' ? 'video' : 'image';
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'elearning-content',
              public_id: `${content.contentId}_${Date.now()}`,
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        content.fileUrl = uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(400).json({ error: cloudinaryError.message || 'Failed to update file in Cloudinary' });
      }
    }

    content.title = title || content.title;
    content.description = description || content.description;
    content.type = type || content.type;
    content.version += 0.1;
    content.lastUpdated = new Date();
    await content.save();

    res.status(200).json({ message: 'Content updated', content });
  } catch (error) {
    console.error('Content update error:', error);
    if (error.message.includes('File too large')) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit. Please upload a smaller file.' });
    }
    res.status(500).json({ error: error.message || 'Failed to update content' });
  }
});

module.exports = router;