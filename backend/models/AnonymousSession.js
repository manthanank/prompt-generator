import mongoose from 'mongoose';

const anonymousSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  prompt: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  deviceFingerprint: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for better query performance
anonymousSessionSchema.index({ sessionId: 1 });
anonymousSessionSchema.index({ timestamp: 1 });
anonymousSessionSchema.index({ ipAddress: 1, timestamp: 1 }); // For IP-based session checks
anonymousSessionSchema.index({ deviceFingerprint: 1, timestamp: 1 }); // For device fingerprint checks

// TTL index to automatically delete old sessions after 24 hours (matches the device limit)
anonymousSessionSchema.index({ timestamp: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export default mongoose.model('AnonymousSession', anonymousSessionSchema);
