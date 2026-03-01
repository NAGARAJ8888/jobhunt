import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['job_seeker', 'employer'], default: 'job_seeker' },
  activeResume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume"
  },
  forgotPasswordOtpHash: { type: String, default: null },
  forgotPasswordOtpExpiresAt: { type: Date, default: null },
  forgotPasswordOtpAttempts: { type: Number, default: 0 },
  forgotPasswordResetToken: { type: String, default: null },
  forgotPasswordResetTokenExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);
