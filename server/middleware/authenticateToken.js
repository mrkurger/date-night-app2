const jwt = require('jsonwebtoken');
const { User } = require('../components/users');

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      // Check if user exists
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: 'Authentication error' });
  }
};
