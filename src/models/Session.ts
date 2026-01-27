import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic cleanup of expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default Session;
