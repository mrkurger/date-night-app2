import SafetyService from '../services/safety.service.js';
import User from '../models/user.model.js';
import SafetyCheckin from '../models/safety-checkin.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

const safetyService = new SafetyService();

// Create safety controller methods
export const createSafetyPlan = async (req, res, next) => {
  try {
    const plan = await safetyService.createSafetyPlan(req.body, req.user.id);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

export const updateSafetyPlan = async (req, res, next) => {
  try {
    const plan = await safetyService.updateSafetyPlan(req.params.id, req.body, req.user.id);
    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
};

export const deleteSafetyPlan = async (req, res, next) => {
  try {
    await safetyService.deleteSafetyPlan(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getSafetyPlans = async (req, res, next) => {
  try {
    const plans = await safetyService.getSafetyPlans(req.user.id);
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const checkin = await safetyService.createCheckin(req.body, req.user.id);
    res.status(201).json(checkin);
  } catch (error) {
    next(error);
  }
};

export const updateCheckin = async (req, res, next) => {
  try {
    const checkin = await safetyService.updateCheckin(req.params.id, req.body, req.user.id);
    res.status(200).json(checkin);
  } catch (error) {
    next(error);
  }
};

export const deleteCheckin = async (req, res, next) => {
  try {
    await safetyService.deleteCheckin(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getCheckins = async (req, res, next) => {
  try {
    const checkins = await safetyService.getCheckins(req.user.id);
    res.status(200).json(checkins);
  } catch (error) {
    next(error);
  }
};

export const getTrustedContacts = async (req, res, next) => {
  try {
    const contacts = await safetyService.getTrustedContacts(req.user.id);
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const handleMissedCheckin = async (req, res, next) => {
  try {
    await safetyService.handleMissedCheckin(req.params.id);
    res.status(200).json({ message: 'Missed checkin handled successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user safety settings
export const getUserSafetySettings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with safety settings
    const user = await User.findById(userId).select('safetySettings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.safetySettings || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving safety settings',
      error: error.message,
    });
  }
};

// Update user safety settings
export const updateSafetySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update safety settings
    user.safetySettings = {
      ...user.safetySettings,
      ...updates,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Safety settings updated successfully',
      data: user.safetySettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating safety settings',
      error: error.message,
    });
  }
};

const safetyController = {
  createSafetyCheckin: checkIn,
  getUserSafetyCheckins: getCheckins,
  getSafetyCheckin: async (req, res, next) => {
    try {
      const checkin = await SafetyCheckin.findOne({ _id: req.params.checkinId, user: req.user.id });
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  },
  updateSafetyCheckin: updateCheckin,
  deleteSafetyCheckin: deleteCheckin,
  startSafetyCheckin: async (req, res, next) => {
    try {
      const checkin = await SafetyCheckin.findOne({ _id: req.params.checkinId, user: req.user.id });
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      await checkin.startCheckin();
      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  },
  completeSafetyCheckin: async (req, res, next) => {
    try {
      const checkin = await SafetyCheckin.findOne({ _id: req.params.checkinId, user: req.user.id });
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      await checkin.completeCheckin();
      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  },
  recordCheckInResponse: async (req, res, next) => {
    try {
      const { response, coordinates } = req.body;
      const checkin = await SafetyCheckin.findOne({ _id: req.params.checkinId, user: req.user.id });
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      await checkin.recordResponse(response, coordinates);
      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  },
  verifyWithSafetyCode: async (req, res, next) => {
    try {
      const { safetyCode } = req.body;
      const checkin = await SafetyCheckin.findOne({
        _id: req.params.checkinId,
        user: req.user.id,
      }).select('+safetyCode');
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      if (checkin.safetyCode !== safetyCode)
        return res.status(400).json({ message: 'Invalid code' });
      res.status(200).json({ valid: true });
    } catch (error) {
      next(error);
    }
  },
  addEmergencyContact: async (req, res, next) => {
    try {
      const checkin = await SafetyCheckin.findOne({ _id: req.params.checkinId, user: req.user.id });
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      await checkin.addEmergencyContact(req.body);
      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  },
  removeEmergencyContact: async (req, res, next) => {
    try {
      const checkin = await SafetyCheckin.findOne({ _id: req.params.checkinId, user: req.user.id });
      if (!checkin) return res.status(404).json({ message: 'Check-in not found' });
      await checkin.removeEmergencyContact(req.params.contactId);
      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  },
  getUserSafetySettings,
  updateSafetySettings,
  getCheckinsRequiringAttention: async (req, res, next) => {
    try {
      const list = await SafetyCheckin.findCheckinsRequiringAttention();
      res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  },
};

export async function someHandler(req, res) {
  // TODO: Implement safety handler
  return sendError(res, new Error('NOT_IMPLEMENTED'), 501);
}

export default safetyController;
