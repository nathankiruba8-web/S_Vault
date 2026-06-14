import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'login',
        'logout',
        'password_created',
        'password_viewed',
        'password_updated',
        'password_deleted',
        'export',
        '2fa_enabled',
        '2fa_disabled',
        'login_failed',
      ],
      required: true,
    },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

securityLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('SecurityLog', securityLogSchema);
