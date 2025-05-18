import mongoose from './db.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'advertiser', 'admin'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
