
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (auth.service.test)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const AuthService = require('./auth.service');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

jest.mock('../models/user.model');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should generate tokens for valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'test',
        password: '$2b$10$hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      const bcryptCompare = jest.spyOn(require('bcrypt'), 'compare');
      bcryptCompare.mockResolvedValue(true);

      const result = await AuthService.authenticate('test', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
