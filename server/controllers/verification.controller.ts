// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for verification.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { Request, Response } from 'express';
import Verification, {
  IVerificationDocument,
  IVerificationModel,
  DocumentType,
  IVerificationTypes,
} from '../models/verification.model.js'; // Reverted to .js extension
import User, { IUserDocument } from '../models/user.model.js'; // Reverted to .js extension
import * as fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sendError } from '../utils/response.js';

import { fileURLToPath } from 'url';

// ES Module equivalents for __filename and __dirname
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// Define a more specific type for req.user and req.files
interface AuthenticatedRequest extends Request {
  user?: IUserDocument; // Use IUserDocument for req.user
  files?: any; // Consider using a library like multer and its types, e.g., req.file or req.files
  body: any; // Add body explicitly
  params: any; // Add params explicitly
}

// Helper function to ensure uploads directory exists
const ensureUploadsDirectory = (): string => {
  const dir = path.join(currentDirPath, '../uploads/verification');
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Utility function to generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export class VerificationController {
  constructor(_verificationService) {
    this._verificationService = _verificationService;
  }

  async getVerificationStatus(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const status = await this._verificationService.getVerificationStatus(userId);
      return res.json(status);
    } catch (error) {
      console.error('Error getting verification status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get verification status',
        error: error.message,
      });
    }
  }

  async submitIdentityVerification(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const result = await this._verificationService.submitIdentityVerification(userId, req.body);
      return res.json(result);
    } catch (error) {
      console.error('Error submitting identity verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit identity verification',
        error: error.message,
      });
    }
  }
}

export default {
  getVerificationStatus: async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Get verification status for the user
      const verification = await Verification.findOne({ userId: req.user.id });

      res.status(200).json({
        success: true,
        data: verification || {
          userId: req.user.id,
          identityVerified: false,
          photoVerified: false,
          phoneVerified: false,
          emailVerified: false,
        },
      });
    } catch (error) {
      console.error('Error getting verification status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get verification status',
        error: error.message,
      });
    }
  },
};
