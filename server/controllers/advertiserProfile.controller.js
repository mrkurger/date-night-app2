import AdvertiserProfile from '../models/advertiserProfile.model.js';
import { AppError } from '../middleware/errorHandler.js';

const advertiserProfileController = {
  async getAllProfiles(req, res, next) {
    try {
      const profiles = await AdvertiserProfile.find().populate('user', 'username email');
      res.status(200).json({ status: 'success', data: profiles });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async getProfileById(req, res, next) {
    try {
      const profile = await AdvertiserProfile.findById(req.params.id).populate(
        'user',
        'username email'
      );
      if (!profile) return next(new AppError('Profile not found', 404));
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async createProfile(req, res, next) {
    try {
      const exists = await AdvertiserProfile.findOne({ user: req.user.id });
      if (exists) return next(new AppError('Profile already exists', 400));
      const data = { user: req.user.id, ...req.body };
      const profile = await AdvertiserProfile.create(data);
      res.status(201).json({ status: 'success', data: profile });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async updateProfile(req, res, next) {
    try {
      const profile = await AdvertiserProfile.findOneAndUpdate({ user: req.user.id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!profile) return next(new AppError('Profile not found', 404));
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async deleteProfile(req, res, next) {
    try {
      const profile = await AdvertiserProfile.findOneAndDelete({ user: req.user.id });
      if (!profile) return next(new AppError('Profile not found', 404));
      res.status(204).send();
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },
};

export default advertiserProfileController;
