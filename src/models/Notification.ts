import mongoose, { Schema, Model } from 'mongoose';

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  data?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: String,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Delete existing model to avoid caching issues
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
