import { Request, Response } from 'express';
// import { ValidationError } from '../../utils/validation-utils.js'; // Unused
import { VerificationService } from './verification.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Verification controller with input validation using Zod schemas
 */
export class VerificationController {
  constructor(private _verificationService: VerificationService) {}

  /**
   * Get verification status for current user
   */
  async getVerificationStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const status = await this.verificationService.getVerificationStatus(userId);
      return res.json(status);
    } catch (error) {
      logger.error('Error getting verification status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting verification status',
      });
    }
  }

  /**
   * Submit identity verification with document
   */
  async submitIdentityVerification(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.verificationService.submitIdentityVerification(userId, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error submitting identity verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error submitting identity verification',
      });
    }
  }

  /**
   * Submit photo verification with selfie
   */
  async submitPhotoVerification(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.verificationService.submitPhotoVerification(userId, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error submitting photo verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error submitting photo verification',
      });
    }
  }

  /**
   * Submit phone number for verification
   */
  async submitPhoneVerification(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.verificationService.submitPhoneVerification(userId, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error submitting phone verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error submitting phone verification',
      });
    }
  }

  /**
   * Verify phone number with code
   */
  async verifyPhoneWithCode(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.verificationService.verifyPhoneWithCode(userId, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error verifying phone with code:', error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying phone with code',
      });
    }
  }

  /**
   * Submit email for verification
   */
  async submitEmailVerification(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.verificationService.submitEmailVerification(userId, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error submitting email verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error submitting email verification',
      });
    }
  }

  /**
   * Verify email with code
   */
  async verifyEmailWithCode(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.verificationService.verifyEmailWithCode(userId, req.body);
      return res.json(result);
    } catch (error) {
      logger.error('Error verifying email with code:', error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying email with code',
      });
    }
  }
}
