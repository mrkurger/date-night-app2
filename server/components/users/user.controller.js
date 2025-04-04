const { User } = require('../');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTravelPlan = async (req, res) => {
  try {
    const { travelPlan } = req.body;
    
    // Ensure user is an advertiser
    const user = await User.findById(req.user._id);
    if (user.role !== 'advertiser') {
      return res.status(403).json({ message: 'Only advertisers can set travel plans' });
    }
    
    user.travelPlan = travelPlan;
    await user.save();
    
    res.json({ travelPlan: user.travelPlan });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('online lastActive');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      online: user.online,
      lastActive: user.lastActive
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
