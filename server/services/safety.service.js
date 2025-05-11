// eslint-disable no-unused-vars
import SafetyCheckin from '../models/safety-checkin.model.js';
import User from '../models/user.model.js';
import { AppError } from '../middleware/errorHandler.js';

export default class SafetyService {
  // Safety plan methods (not implemented)
  async createSafetyPlan() {
    throw new AppError('createSafetyPlan not implemented', 501);
  }

  async updateSafetyPlan() {
    throw new AppError('updateSafetyPlan not implemented', 501);
  }

  async deleteSafetyPlan() {
    throw new AppError('deleteSafetyPlan not implemented', 501);
  }

  async getSafetyPlans() {
    // No safety plans implemented yet
    return [];
  }

  // Check-in methods
  async createCheckin(data, userId) {
    const checkin = new SafetyCheckin({ ...data, user: userId });
    return await checkin.save();
  }

  async updateCheckin(id, data, userId) {
    const checkin = await SafetyCheckin.findOne({ _id: id, user: userId });
    if (!checkin) throw new AppError('Checkin not found', 404);
    Object.assign(checkin, data);
    return await checkin.save();
  }

  async deleteCheckin(id, userId) {
    const result = await SafetyCheckin.findOneAndDelete({ _id: id, user: userId });
    if (!result) throw new AppError('Checkin not found', 404);
  }

  async getCheckins(userId) {
    return await SafetyCheckin.find({ user: userId });
  }

  async getTrustedContacts(userId) {
    const user = await User.findById(userId).select('safetySettings.emergencyContacts');
    return user?.safetySettings?.emergencyContacts || [];
  }

  async handleMissedCheckin(id) {
    const checkin = await SafetyCheckin.findById(id);
    if (!checkin) throw new AppError('Checkin not found', 404);
    await checkin.markAsMissed();
  }
}
