const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.id);
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async authenticate(username, password) {
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Invalid password');

    return this.generateTokens(user);
  }
}

module.exports = new AuthService();
