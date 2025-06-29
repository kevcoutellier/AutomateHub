import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: string;
  type: 'message' | 'project_update' | 'milestone_update' | 'expert_match' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any; // Additional data specific to notification type
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string; // URL to navigate when notification is clicked
  relatedId?: string; // ID of related entity (project, conversation, etc.)
  relatedType?: string; // Type of related entity
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['message', 'project_update', 'milestone_update', 'expert_match', 'payment', 'system'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  actionUrl: {
    type: String,
    maxlength: 500
  },
  relatedId: {
    type: String,
    index: true
  },
  relatedType: {
    type: String,
    enum: ['project', 'conversation', 'milestone', 'expert', 'payment']
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });

// Middleware to set readAt when isRead changes to true
NotificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
