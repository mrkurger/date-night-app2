const { User } = require('./');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // Don't allow role or password updates through this endpoint
    const { password, role, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateTravelPlan = async (req, res, next) => {
  try {
    // Only for advertisers
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'advertiser') {
      return res.status(403).json({ message: 'Only advertisers can update travel plans' });
    }
    
    user.travelPlan = req.body.travelPlan || [];
    await user.save();
    
    res.json({ travelPlan: user.travelPlan });
  } catch (err) {
    next(err);
  }
};
