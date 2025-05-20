import express from 'express';
import { protect } from '../middleware/auth.js';
import advertiserProfileController from '../controllers/advertiserProfile.controller.js';
import { ValidationUtils, zodSchemas } from '../utils/validation-utils.js';
import AdvertiserProfileSchemas from '../middleware/validators/advertiserProfile.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD for advertiser profiles
router.get('/', advertiserProfileController.getAllProfiles);

router.get(
  '/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  advertiserProfileController.getProfileById
);

router.post(
  '/',
  ValidationUtils.validateWithZod(AdvertiserProfileSchemas.createProfile),
  advertiserProfileController.createProfile
);

router.put(
  '/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  ValidationUtils.validateWithZod(AdvertiserProfileSchemas.updateProfile),
  advertiserProfileController.updateProfile
);

router.delete(
  '/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  advertiserProfileController.deleteProfile
);

export default router;
