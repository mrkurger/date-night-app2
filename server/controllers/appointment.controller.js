import Appointment from '../models/appointment.model.js';
import AdvertiserProfile from '../models/advertiserProfile.model.js';
import { AppError } from '../middleware/errorHandler.js';

const appointmentController = {
  async getMyAppointments(req, res, next) {
    try {
      const userId = req.user.id;
      const advertProfile = await AdvertiserProfile.findOne({ user: userId });
      const query = advertProfile
        ? { $or: [{ customer: userId }, { advertiserProfile: advertProfile._id }] }
        : { customer: userId };
      const appts = await Appointment.find(query)
        .populate('customer', 'username email')
        .populate({
          path: 'advertiserProfile',
          populate: { path: 'user', select: 'username email' },
        })
        .populate('listing');
      res.status(200).json({ status: 'success', data: appts });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async getAppointmentById(req, res, next) {
    try {
      const appt = await Appointment.findById(req.params.id)
        .populate('customer', 'username email')
        .populate({
          path: 'advertiserProfile',
          populate: { path: 'user', select: 'username email' },
        })
        .populate('listing');
      if (!appt) return next(new AppError('Appointment not found', 404));
      const userId = req.user.id;
      if (
        appt.customer._id.toString() !== userId &&
        appt.advertiserProfile.user._id.toString() !== userId
      ) {
        return next(new AppError('Unauthorized', 403));
      }
      res.status(200).json({ status: 'success', data: appt });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async createAppointment(req, res, next) {
    try {
      const userId = req.user.id;
      const { advertiserProfile, listing, scheduledFor } = req.body;
      if (!advertiserProfile || !scheduledFor) {
        return next(new AppError('Required fields missing', 400));
      }
      const appt = await Appointment.create({
        customer: userId,
        advertiserProfile,
        listing,
        scheduledFor,
      });
      res.status(201).json({ status: 'success', data: appt });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async updateAppointment(req, res, next) {
    try {
      const appt = await Appointment.findById(req.params.id);
      if (!appt) return next(new AppError('Appointment not found', 404));
      const userId = req.user.id;
      const advertProfile = await AdvertiserProfile.findOne({ user: userId });
      if (
        appt.customer.toString() !== userId &&
        (!advertProfile || appt.advertiserProfile.toString() !== advertProfile._id.toString())
      ) {
        return next(new AppError('Unauthorized', 403));
      }
      Object.assign(appt, req.body);
      await appt.save();
      res.status(200).json({ status: 'success', data: appt });
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },

  async deleteAppointment(req, res, next) {
    try {
      const appt = await Appointment.findById(req.params.id);
      if (!appt) return next(new AppError('Appointment not found', 404));
      const userId = req.user.id;
      const advertProfile = await AdvertiserProfile.findOne({ user: userId });
      if (
        appt.customer.toString() !== userId &&
        (!advertProfile || appt.advertiserProfile.toString() !== advertProfile._id.toString())
      ) {
        return next(new AppError('Unauthorized', 403));
      }
      await Appointment.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(new AppError(err.message, 500));
    }
  },
};

export default appointmentController;
