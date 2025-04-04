const SafetyCheckin = require('../models/safety-checkin.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Create a new safety check-in
exports.createSafetyCheckin = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      meetingWith,
      clientName,
      clientContact,
      location,
      startTime,
      expectedEndTime,
      safetyNotes,
      checkInMethod,
      autoCheckInSettings,
      emergencyContacts
    } = req.body;
    
    // Validate required fields
    if (!location || !location.coordinates || !startTime || !expectedEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Location, start time, and expected end time are required'
      });
    }
    
    // Generate safety and distress codes
    const safetyCode = crypto.randomBytes(3).toString('hex');
    const distressCode = crypto.randomBytes(3).toString('hex');
    
    // Create the safety check-in
    const safetyCheckin = new SafetyCheckin({
      user: userId,
      meetingWith,
      clientName,
      clientContact,
      location,
      startTime: new Date(startTime),
      expectedEndTime: new Date(expectedEndTime),
      safetyNotes,
      safetyCode,
      distressCode,
      checkInMethod: checkInMethod || 'app',
      autoCheckInSettings,
      emergencyContacts
    });
    
    await safetyCheckin.save();
    
    res.status(201).json({
      success: true,
      message: 'Safety check-in created successfully',
      data: {
        ...safetyCheckin.toObject(),
        safetyCode,
        distressCode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating safety check-in',
      error: error.message
    });
  }
};

// Get all safety check-ins for the current user
exports.getUserSafetyCheckins = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { user: userId };
    
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get check-ins
    const checkins = await SafetyCheckin.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('meetingWith', 'username profileImage');
    
    // Get total count
    const totalCheckins = await SafetyCheckin.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: checkins.length,
      totalPages: Math.ceil(totalCheckins / parseInt(limit)),
      currentPage: parseInt(page),
      data: checkins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving safety check-ins',
      error: error.message
    });
  }
};

// Get a specific safety check-in
exports.getSafetyCheckin = async (req, res) => {
  try {
    const { checkinId } = req.params;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId)
      .populate('meetingWith', 'username profileImage');
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own safety check-ins'
      });
    }
    
    res.status(200).json({
      success: true,
      data: checkin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving safety check-in',
      error: error.message
    });
  }
};

// Update a safety check-in
exports.updateSafetyCheckin = async (req, res) => {
  try {
    const { checkinId } = req.params;
    const updates = req.body;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId);
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own safety check-ins'
      });
    }
    
    // Only scheduled check-ins can be updated
    if (checkin.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled check-ins can be updated'
      });
    }
    
    // Update check-in details
    await checkin.updateDetails(updates);
    
    res.status(200).json({
      success: true,
      message: 'Safety check-in updated successfully',
      data: checkin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating safety check-in',
      error: error.message
    });
  }
};

// Start a safety check-in
exports.startSafetyCheckin = async (req, res) => {
  try {
    const { checkinId } = req.params;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId);
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only start your own safety check-ins'
      });
    }
    
    // Start the check-in
    await checkin.startCheckin();
    
    res.status(200).json({
      success: true,
      message: 'Safety check-in started successfully',
      data: checkin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting safety check-in',
      error: error.message
    });
  }
};

// Complete a safety check-in
exports.completeSafetyCheckin = async (req, res) => {
  try {
    const { checkinId } = req.params;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId);
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only complete your own safety check-ins'
      });
    }
    
    // Complete the check-in
    await checkin.completeCheckin();
    
    res.status(200).json({
      success: true,
      message: 'Safety check-in completed successfully',
      data: checkin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing safety check-in',
      error: error.message
    });
  }
};

// Record a check-in response
exports.recordCheckInResponse = async (req, res) => {
  try {
    const { checkinId } = req.params;
    const { response, coordinates } = req.body;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    if (!response || !['safe', 'need_more_time', 'distress'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Valid response is required (safe, need_more_time, or distress)'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId);
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to your own safety check-ins'
      });
    }
    
    // Record the response
    await checkin.recordResponse(response, coordinates);
    
    // If distress signal, trigger emergency protocol
    if (response === 'distress') {
      // In a real application, you would send notifications to emergency contacts
      // and potentially alert platform administrators
      
      // For now, just update the status
      await checkin.triggerEmergency();
    }
    
    res.status(200).json({
      success: true,
      message: 'Check-in response recorded successfully',
      data: checkin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording check-in response',
      error: error.message
    });
  }
};

// Verify check-in with safety code
exports.verifyWithSafetyCode = async (req, res) => {
  try {
    const { checkinId } = req.params;
    const { code } = req.body;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Safety code is required'
      });
    }
    
    // Find check-in with safety code
    const checkin = await SafetyCheckin.findById(checkinId)
      .select('+safetyCode +distressCode');
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only verify your own safety check-ins'
      });
    }
    
    // Check if code matches safety code or distress code
    if (code === checkin.safetyCode) {
      // Record safe response
      await checkin.recordResponse('safe');
      
      res.status(200).json({
        success: true,
        message: 'Safety verified successfully',
        data: checkin
      });
    } else if (code === checkin.distressCode) {
      // Record distress response and trigger emergency
      await checkin.recordResponse('distress');
      await checkin.triggerEmergency();
      
      res.status(200).json({
        success: true,
        message: 'Distress signal received',
        data: checkin
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid safety code'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying safety code',
      error: error.message
    });
  }
};

// Add emergency contact to a check-in
exports.addEmergencyContact = async (req, res) => {
  try {
    const { checkinId } = req.params;
    const { name, phone, email, relationship } = req.body;
    
    if (!checkinId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID is required'
      });
    }
    
    if (!name || (!phone && !email)) {
      return res.status(400).json({
        success: false,
        message: 'Name and either phone or email are required'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId);
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only add emergency contacts to your own safety check-ins'
      });
    }
    
    // Add emergency contact
    await checkin.addEmergencyContact({
      name,
      phone,
      email,
      relationship
    });
    
    res.status(200).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: checkin.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding emergency contact',
      error: error.message
    });
  }
};

// Remove emergency contact from a check-in
exports.removeEmergencyContact = async (req, res) => {
  try {
    const { checkinId, contactId } = req.params;
    
    if (!checkinId || !contactId) {
      return res.status(400).json({
        success: false,
        message: 'Check-in ID and contact ID are required'
      });
    }
    
    const checkin = await SafetyCheckin.findById(checkinId);
    
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Safety check-in not found'
      });
    }
    
    // Check if the current user is the owner of the check-in
    if (checkin.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove emergency contacts from your own safety check-ins'
      });
    }
    
    // Remove emergency contact
    await checkin.removeEmergencyContact(contactId);
    
    res.status(200).json({
      success: true,
      message: 'Emergency contact removed successfully',
      data: checkin.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing emergency contact',
      error: error.message
    });
  }
};

// Get user's safety settings
exports.getUserSafetySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId, 'safetySettings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.safetySettings || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving safety settings',
      error: error.message
    });
  }
};

// Update user's safety settings
exports.updateSafetySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emergencyContacts, autoCheckIn } = req.body;
    
    // Generate new safety and distress codes if requested
    let safetyCode, distressCode;
    
    if (req.body.generateNewCodes) {
      safetyCode = crypto.randomBytes(3).toString('hex');
      distressCode = crypto.randomBytes(3).toString('hex');
    }
    
    // Build update object
    const updateObj = {};
    
    if (emergencyContacts) updateObj['safetySettings.emergencyContacts'] = emergencyContacts;
    if (autoCheckIn) updateObj['safetySettings.autoCheckIn'] = autoCheckIn;
    if (safetyCode) updateObj['safetySettings.safetyCode'] = safetyCode;
    if (distressCode) updateObj['safetySettings.distressCode'] = distressCode;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true, select: 'safetySettings' }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Safety settings updated successfully',
      data: {
        ...user.safetySettings.toObject(),
        safetyCode: safetyCode || undefined,
        distressCode: distressCode || undefined
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating safety settings',
      error: error.message
    });
  }
};

// Admin: Get check-ins requiring attention
exports.getCheckinsRequiringAttention = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const checkinsRequiringAttention = await SafetyCheckin.findCheckinsRequiringAttention();
    
    res.status(200).json({
      success: true,
      count: checkinsRequiringAttention.length,
      data: checkinsRequiringAttention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving check-ins requiring attention',
      error: error.message
    });
  }
};