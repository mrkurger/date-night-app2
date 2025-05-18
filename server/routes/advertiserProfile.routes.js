import express from 'express';
import { protect } from '../middleware/auth.js';
import advertiserProfileController from '../controllers/advertiserProfile.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD for advertiser profiles
router.get('/', advertiserProfileController.getAllProfiles);
router.get('/:id', advertiserProfileController.getProfileById);
router.post('/', advertiserProfileController.createProfile);
router.put('/:id', advertiserProfileController.updateProfile);
router.delete('/:id', advertiserProfileController.deleteProfile);

export default router;
