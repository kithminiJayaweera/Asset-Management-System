import mongoose, { Schema, Model } from 'mongoose';

export interface INotification {
  _id: string;
  userId: string;
  type: 'asset_request' | 'request_approved' | 'request_rejected' | 'asset_assigned' | 'asset_updated';
  title: string;
  message: string;
  read: boolean;
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
      enum: ['asset_request', 'request_approved', 'request_rejected', 'asset_assigned', 'asset_updated'],
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
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
