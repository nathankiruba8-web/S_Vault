import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, trim: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorMethod: { type: String, enum: ['authenticator', 'whatsapp', 'both'], default: 'authenticator' },
    whatsapp2FAEnabled: { type: Boolean, default: false },
    backupCodes: [{ type: String, select: false }],
    refreshToken: { type: String, select: false },
    whatsappOtp: { type: String, select: false },
    whatsappOtpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
