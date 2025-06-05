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

// Helper function to generate a secure filename
const generateSecureFilename = (originalFilename: string): string => {
  const ext = path.extname(originalFilename);
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
};

// Get verification status for current user
const getVerificationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      // Create a new verification record if none exists
      verification = new Verification({ user: userId });
      await verification.save();
    }

    res.status(200).json({
      success: true,
      data: {
        overallStatus: verification.overallStatus,
        verificationLevel: verification.verificationLevel,
        verificationTypes: {
          identity: {
            status: verification.verificationTypes.identity.status,
            submittedDate: verification.verificationTypes.identity.submittedDate,
            approvedDate: verification.verificationTypes.identity.approvedDate,
            rejectedDate: verification.verificationTypes.identity.rejectedDate,
            rejectionReason: verification.verificationTypes.identity.rejectionReason,
            documentType: verification.verificationTypes.identity.documentType,
          },
          photo: {
            status: verification.verificationTypes.photo.status,
            submittedDate: verification.verificationTypes.photo.submittedDate,
            approvedDate: verification.verificationTypes.photo.approvedDate,
            rejectedDate: verification.verificationTypes.photo.rejectedDate,
            rejectionReason: verification.verificationTypes.photo.rejectionReason,
          },
          phone: {
            status: verification.verificationTypes.phone.status,
            submittedDate: verification.verificationTypes.phone.submittedDate,
            approvedDate: verification.verificationTypes.phone.approvedDate,
            rejectedDate: verification.verificationTypes.phone.rejectedDate,
            rejectionReason: verification.verificationTypes.phone.rejectionReason,
            phoneNumber: verification.verificationTypes.phone.phoneNumber,
            verified: verification.verificationTypes.phone.verified,
          },
          email: {
            status: verification.verificationTypes.email.status,
            submittedDate: verification.verificationTypes.email.submittedDate,
            approvedDate: verification.verificationTypes.email.approvedDate,
            rejectedDate: verification.verificationTypes.email.rejectedDate,
            rejectionReason: verification.verificationTypes.email.rejectionReason,
            email: verification.verificationTypes.email.email,
            verified: verification.verificationTypes.email.verified,
          },
          address: {
            status: verification.verificationTypes.address.status,
            submittedDate: verification.verificationTypes.address.submittedDate,
            approvedDate: verification.verificationTypes.address.approvedDate,
            rejectedDate: verification.verificationTypes.address.rejectedDate,
            rejectionReason: verification.verificationTypes.address.rejectionReason,
            city: verification.verificationTypes.address.city,
            county: verification.verificationTypes.address.county,
            country: verification.verificationTypes.address.country,
          },
        },
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification status',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Submit identity verification
const submitIdentityVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { documentType, documentNumber, expiryDate, notes } = req.body as {
      documentType: DocumentType; // Use Enum
      documentNumber: string;
      expiryDate?: Date;
      notes?: string;
    };

    if (!req.files || !req.files.documentImages) {
      return res.status(400).json({
        success: false,
        message: 'Document images are required',
      });
    }

    // Handle multiple files or single file
    const documentImages = Array.isArray(req.files.documentImages)
      ? req.files.documentImages
      : [req.files.documentImages];

    // Save files to secure location
    const uploadDir = ensureUploadsDirectory();
    const savedFilePaths: string[] = [];

    for (const file of documentImages) {
      const secureFilename = generateSecureFilename(file.name);
      const filePath = path.join(uploadDir, secureFilename);

      await file.mv(filePath);
      savedFilePaths.push(`/uploads/verification/${secureFilename}`);
    }

    // Find or create verification record
    let verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId }) as IVerificationDocument;
    }

    // Submit identity verification
    await verification.submitIdentityVerification({
      documentType,
      documentNumber,
      expiryDate,
      documentImages: savedFilePaths,
      notes,
    });

    res.status(200).json({
      success: true,
      message: 'Identity verification submitted successfully',
      data: {
        status: verification.verificationTypes.identity.status,
        submittedDate: verification.verificationTypes.identity.submittedDate,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error submitting identity verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Submit photo verification
const submitPhotoVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { notes } = req.body as { notes?: string };

    if (!req.files || !req.files.verificationImage) {
      return res.status(400).json({
        success: false,
        message: 'Verification image is required',
      });
    }

    // Save file to secure location
    const uploadDir = ensureUploadsDirectory();
    const file = req.files.verificationImage;
    const secureFilename = generateSecureFilename(file.name);
    const filePath = path.join(uploadDir, secureFilename);

    await file.mv(filePath);
    const savedFilePath = `/uploads/verification/${secureFilename}`;

    // Find or create verification record
    let verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId }) as IVerificationDocument;
    }

    // Submit photo verification
    await verification.submitPhotoVerification({
      verificationImage: savedFilePath,
      notes,
    });

    res.status(200).json({
      success: true,
      message: 'Photo verification submitted successfully',
      data: {
        status: verification.verificationTypes.photo.status,
        submittedDate: verification.verificationTypes.photo.submittedDate,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error submitting photo verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Submit phone verification
const submitPhoneVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { phoneNumber } = req.body as { phoneNumber: string };

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Find or create verification record
    let verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId }) as IVerificationDocument;
    }

    // Submit phone verification
    const { verification: updatedVerification, verificationCode } =
      await verification.submitPhoneVerification(phoneNumber);

    // In a real application, you would send this code via SMS
    // For development, we'll just return it in the response

    res.status(200).json({
      success: true,
      message: 'Phone verification code sent successfully',
      data: {
        status: updatedVerification.verificationTypes.phone.status,
        submittedDate: updatedVerification.verificationTypes.phone.submittedDate,
        phoneNumber: updatedVerification.verificationTypes.phone.phoneNumber,
        // Only include this in development
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error submitting phone verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Verify phone with code
const verifyPhoneWithCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { code } = req.body as { code: string };

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    // Find verification record
    const verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'No verification record found',
      });
    }

    // Verify phone with code
    await verification.verifyPhoneWithCode(code);

    // Update user's verification badges
    await User.findByIdAndUpdate(userId, {
      'verificationBadges.phone': true,
      $inc: { verificationLevel: 1 },
    });

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      data: {
        status: verification.verificationTypes.phone.status,
        verified: verification.verificationTypes.phone.verified,
        approvedDate: verification.verificationTypes.phone.approvedDate,
      },
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message: 'Error verifying phone',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Submit email verification
const submitEmailVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find or create verification record
    let verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId }) as IVerificationDocument;
    }

    // Submit email verification
    const { verification: updatedVerification, verificationCode } =
      await verification.submitEmailVerification(email);

    // In a real application, you would send this code via email
    // For development, we'll just return it in the response

    res.status(200).json({
      success: true,
      message: 'Email verification code sent successfully',
      data: {
        status: updatedVerification.verificationTypes.email.status,
        submittedDate: updatedVerification.verificationTypes.email.submittedDate,
        email: updatedVerification.verificationTypes.email.email,
        // Only include this in development
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error submitting email verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Verify email with code
const verifyEmailWithCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { code } = req.body as { code: string };

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    // Find verification record
    const verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'No verification record found',
      });
    }

    // Verify email with code
    await verification.verifyEmailWithCode(code);

    // Update user's verification badges
    await User.findByIdAndUpdate(userId, {
      'verificationBadges.email': true,
      verified: true,
      $inc: { verificationLevel: 1 },
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        status: verification.verificationTypes.email.status,
        verified: verification.verificationTypes.email.verified,
        approvedDate: verification.verificationTypes.email.approvedDate,
      },
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message: 'Error verifying email',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Submit address verification
const submitAddressVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { street, city, postalCode, county, country, notes } = req.body as {
      street: string;
      city: string;
      postalCode: string;
      county: string;
      country: string;
      notes?: string;
    };

    if (!req.files || !req.files.documentImage) {
      return res.status(400).json({
        success: false,
        message: 'Document image is required',
      });
    }

    // Save file to secure location
    const uploadDir = ensureUploadsDirectory();
    const file = req.files.documentImage;
    const secureFilename = generateSecureFilename(file.name);
    const filePath = path.join(uploadDir, secureFilename);

    await file.mv(filePath);
    const savedFilePath = `/uploads/verification/${secureFilename}`;

    // Find or create verification record
    let verification: IVerificationDocument | null = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId }) as IVerificationDocument;
    }

    // Submit address verification
    await verification.submitAddressVerification({
      street,
      city,
      postalCode,
      county,
      country,
      documentImage: savedFilePath,
      notes,
    });

    res.status(200).json({
      success: true,
      message: 'Address verification submitted successfully',
      data: {
        status: verification.verificationTypes.address.status,
        submittedDate: verification.verificationTypes.address.submittedDate,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error submitting address verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Admin: Get pending verifications
const getPendingVerifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const pendingVerifications: IVerificationDocument[] = await (
      Verification as IVerificationModel
    ).findPendingVerifications();

    res.status(200).json({
      success: true,
      count: pendingVerifications.length,
      data: pendingVerifications,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending verifications',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Admin: Approve verification
const approveVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { verificationId, type, notes } = req.body as {
      verificationId: string;
      type: keyof IVerificationTypes;
      notes?: string;
    };

    if (!verificationId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID and type are required',
      });
    }

    const verification: IVerificationDocument | null = await Verification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found',
      });
    }

    // Approve verification
    await verification.approveVerification(type, notes);

    // Update user's verification badges and level
    await User.findByIdAndUpdate(verification.user, {
      [`verificationBadges.${String(type)}`]: true, // Explicitly cast type to string
      $inc: { verificationLevel: 1 },
    });

    res.status(200).json({
      success: true,
      message: `${String(type)} verification approved successfully`, // Explicitly cast type to string
      data: verification,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error approving verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Admin: Reject verification
const rejectVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { verificationId, type, reason, notes } = req.body as {
      verificationId: string;
      type: keyof IVerificationTypes;
      reason: string;
      notes?: string;
    };

    if (!verificationId || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID, type, and reason are required',
      });
    }

    const verification = await Verification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found',
      });
    }

    // Reject verification
    await verification.rejectVerification(type, reason, notes);

    res.status(200).json({
      success: true,
      message: `${String(type)} verification rejected successfully`, // Explicitly cast type to string
      data: verification,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting verification',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Get verification status for a specific user (public)
const getUserVerificationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find user
    const user: Pick<
      IUserDocument,
      'username' | 'verificationLevel' | 'verificationBadges'
    > | null = await User.findById(userId, 'username verificationLevel verificationBadges');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        verificationLevel: user.verificationLevel,
        verificationBadges: user.verificationBadges,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user verification status',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export async function someHandler(req: Request, res: Response) {
  // TODO: Implement verification handler
  return sendError(res, new Error('NOT_IMPLEMENTED'), 501);
}

// Export the controller as a named export
export const verificationController = {
  getVerificationStatus,
  submitIdentityVerification,
  submitPhotoVerification,
  submitPhoneVerification,
  verifyPhoneWithCode,
  submitEmailVerification,
  verifyEmailWithCode,
  submitAddressVerification,
  getUserVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  someHandler,
};
