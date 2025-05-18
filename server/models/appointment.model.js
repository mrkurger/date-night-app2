// Schema for booking appointments between customers and advertisers
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    advertiserProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdvertiserProfile',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ad',
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
