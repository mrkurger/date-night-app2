// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for verification.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import Verification from '../models/verification.model';
import User from '../models/user.model';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Helper function to ensure uploads directory exists
const ensureUploadsDirectory = () => {
  const dir = path.join(__dirname, '../uploads/verification');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Helper function to generate a secure filename
const generateSecureFilename = originalFilename => {
  const ext = path.extname(originalFilename);
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
};

// Get verification status for current user
exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    let verification = await Verification.findOne({ user: userId });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification status',
      error: error.message,
    });
  }
};

// Submit identity verification
exports.submitIdentityVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { documentType, documentNumber, expiryDate, notes } = req.body;

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
    const savedFilePaths = [];

    for (const file of documentImages) {
      const secureFilename = generateSecureFilename(file.name);
      const filePath = path.join(uploadDir, secureFilename);

      await file.mv(filePath);
      savedFilePaths.push(`/uploads/verification/${secureFilename}`);
    }

    // Find or create verification record
    let verification = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting identity verification',
      error: error.message,
    });
  }
};

// Submit photo verification
exports.submitPhotoVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notes } = req.body;

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
    let verification = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting photo verification',
      error: error.message,
    });
  }
};

// Submit phone verification
exports.submitPhoneVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Find or create verification record
    let verification = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting phone verification',
      error: error.message,
    });
  }
};

// Verify phone with code
exports.verifyPhoneWithCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    // Find verification record
    const verification = await Verification.findOne({ user: userId });

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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error verifying phone',
      error: error.message,
    });
  }
};

// Submit email verification
exports.submitEmailVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find or create verification record
    let verification = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting email verification',
      error: error.message,
    });
  }
};

// Verify email with code
exports.verifyEmailWithCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    // Find verification record
    const verification = await Verification.findOne({ user: userId });

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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error verifying email',
      error: error.message,
    });
  }
};

// Submit address verification
exports.submitAddressVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { street, city, postalCode, county, country, notes } = req.body;

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
    let verification = await Verification.findOne({ user: userId });

    if (!verification) {
      verification = new Verification({ user: userId });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting address verification',
      error: error.message,
    });
  }
};

// Admin: Get pending verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const pendingVerifications = await Verification.findPendingVerifications();

    res.status(200).json({
      success: true,
      count: pendingVerifications.length,
      data: pendingVerifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending verifications',
      error: error.message,
    });
  }
};

// Admin: Approve verification
exports.approveVerification = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { verificationId, type, notes } = req.body;

    if (!verificationId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID and type are required',
      });
    }

    const verification = await Verification.findById(verificationId);

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
      [`verificationBadges.${type}`]: true,
      $inc: { verificationLevel: 1 },
    });

    res.status(200).json({
      success: true,
      message: `${type} verification approved successfully`,
      data: verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving verification',
      error: error.message,
    });
  }
};

// Admin: Reject verification
exports.rejectVerification = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { verificationId, type, reason, notes } = req.body;

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
      message: `${type} verification rejected successfully`,
      data: verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting verification',
      error: error.message,
    });
  }
};

// Get verification status for a specific user (public)
exports.getUserVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find user
    const user = await User.findById(userId, 'username verificationLevel verificationBadges');

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user verification status',
      error: error.message,
    });
  }
};
