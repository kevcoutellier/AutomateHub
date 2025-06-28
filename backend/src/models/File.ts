import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFile extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  s3Key?: string;
  uploadedBy: Types.ObjectId;
  associatedWith: {
    type: 'message' | 'expert_portfolio' | 'project_document' | 'user_avatar';
    id: Types.ObjectId;
  };
  isPublic: boolean;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnailUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  url: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    index: { sparse: true } // Allows null values but ensures uniqueness when present
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  associatedWith: {
    type: {
      type: String,
      enum: ['message', 'expert_portfolio', 'project_document', 'user_avatar'],
      required: true
    },
    id: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    thumbnailUrl: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ 'associatedWith.type': 1, 'associatedWith.id': 1 });
fileSchema.index({ createdAt: -1 });

export const File = mongoose.model<IFile>('File', fileSchema);
