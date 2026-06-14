import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    browser: { type: String },
    device: { type: String },
    ipAddress: { type: String },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

loginHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('LoginHistory', loginHistorySchema);
