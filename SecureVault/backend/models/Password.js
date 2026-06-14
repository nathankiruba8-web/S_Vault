import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    websiteName: { type: String, required: true, trim: true },
    websiteUrl: { type: String, trim: true },
    username: { type: String, required: true, trim: true },
    encryptedPassword: { type: String, required: true },
    notes: { type: String, trim: true },
    category: {
      type: String,
      enum: ['social', 'finance', 'work', 'shopping', 'entertainment', 'other'],
      default: 'other',
    },
    expiryDate: { type: Date },
    strength: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

passwordSchema.index({ user: 1, websiteName: 1 });
passwordSchema.index({ user: 1, category: 1 });

export default mongoose.model('Password', passwordSchema);
