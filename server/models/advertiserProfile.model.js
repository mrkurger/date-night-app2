// advertiserProfile.model.js
// Schema for extended advertiser (supplier) profiles
import mongoose from 'mongoose';

const advertiserProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String },
    location: { type: String },
    hourlyRate: { type: Number, min: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

advertiserProfileSchema.index({ user: 1 }, { unique: true });

export default mongoose.model('AdvertiserProfile', advertiserProfileSchema);
