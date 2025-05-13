const express = require('express');
const Analytics = require('../models/Analytics');
const router = express.Router();

// Generate analytics report
router.get('/analytics/report', async (req, res) => {
  try {
    const { contentId, startDate, endDate } = req.query;
    const pipeline = [
      {
        $match: {
          contentId,
          timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: '$contentId',
          avgEngagement: { $avg: '$engagementScore' },
          totalTime: { $sum: '$timeSpent' },
        },
      },
    ];

    const report = await Analytics.aggregate(pipeline);
    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;