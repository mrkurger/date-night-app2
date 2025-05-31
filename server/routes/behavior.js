const express = require('express');
const router = express.Router();
const BehaviorModel = require('../models/Behavior');

// Endpoint to receive behavior data
router.post('/behavior', async (req, res) => {
  try {
    const { deviceFingerprint, behaviorData } = req.body;

    // Save data to database
    const behaviorRecord = new BehaviorModel({
      deviceFingerprint,
      behaviorData,
      timestamp: new Date(),
    });

    await behaviorRecord.save();
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving behavior data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
