import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[]; // User IDs
  expertId: Types.ObjectId;
  clientId: Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  expertId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ expertId: 1, clientId: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
