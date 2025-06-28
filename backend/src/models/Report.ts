import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  projectId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reportedUserId?: mongoose.Types.ObjectId;
  reportType: 'inappropriate_behavior' | 'spam' | 'fraud' | 'quality_issues' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  resolution?: string;
  escalationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: mongoose.Types.ObjectId;
}

const reportSchema = new Schema<IReport>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reportType: {
    type: String,
    enum: ['inappropriate_behavior', 'spam', 'fraud', 'quality_issues', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  adminNotes: {
    type: String,
    maxlength: 2000
  },
  resolution: {
    type: String,
    maxlength: 1000
  },
  escalationReason: {
    type: String,
    maxlength: 500
  },
  resolvedAt: Date,
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ status: 1 });
reportSchema.index({ severity: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ projectId: 1 });
reportSchema.index({ reportedBy: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
