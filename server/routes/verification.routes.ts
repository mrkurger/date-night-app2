import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/roles';
import { ValidationUtils } from '../utils/validation-utils';
import { verificationSchemas } from './components/verification/verification.schema';
import { zodSchemas } from '../utils/validation-utils';

const router = Router();

// Protected routes requiring authentication
router.use(authenticateToken);

// Get verification status for current user
router.get('/status', verificationController.getVerificationStatus);

// Submit identity verification
router.post(
  '/identity',
  ValidationUtils.validateWithZod(verificationSchemas.identityVerification),
  verificationController.submitIdentityVerification
);

// Submit photo verification
router.post(
  '/photo',
  ValidationUtils.validateWithZod(verificationSchemas.photoVerification),
  verificationController.submitPhotoVerification
);

// Submit phone verification
router.post(
  '/phone',
  ValidationUtils.validateWithZod(verificationSchemas.phoneVerification),
  verificationController.submitPhoneVerification
);

// Verify phone with code
router.post(
  '/phone/verify',
  ValidationUtils.validateWithZod(verificationSchemas.phoneVerificationCode),
  verificationController.verifyPhoneWithCode
);

// Submit email verification
router.post(
  '/email',
  ValidationUtils.validateWithZod(verificationSchemas.emailVerification),
  verificationController.submitEmailVerification
);

// Verify email with code
router.post(
  '/email/verify',
  ValidationUtils.validateWithZod(verificationSchemas.emailVerificationCode),
  verificationController.verifyEmailWithCode
);

// Submit address verification
router.post(
  '/address',
  ValidationUtils.validateWithZod(
    z.object({
      address: zodSchemas.address,
      postalCode: zodSchemas.norwegianPostalCode,
    })
  ),
  verificationController.submitAddressVerification
);

// Get verification status for a specific user (public)
router.get(
  '/user/:userId',
  ValidationUtils.validateWithZod(
    z.object({
      userId: zodSchemas.objectId,
    }),
    'params'
  ),
  verificationController.getUserVerificationStatus
);

// Admin routes
router.use(isAdmin);

router.get('/admin/pending', verificationController.getPendingVerifications);

router.post(
  '/admin/approve',
  ValidationUtils.validateWithZod(
    z.object({
      verificationId: zodSchemas.objectId,
      type: z.enum(['IDENTITY', 'PHOTO', 'PHONE', 'EMAIL', 'ADDRESS']),
    })
  ),
  verificationController.approveVerification
);

router.post(
  '/admin/reject',
  ValidationUtils.validateWithZod(
    z.object({
      verificationId: zodSchemas.objectId,
      type: z.enum(['IDENTITY', 'PHOTO', 'PHONE', 'EMAIL', 'ADDRESS']),
      reason: z.string().min(1).max(500),
    })
  ),
  verificationController.rejectVerification
);

export default router;
