import mongoose, { Schema, Document } from 'mongoose';
import { Project as IProject, Milestone, Message, ProjectFile } from '../types';

// Fix the _id type conflict by omitting _id from IProject and letting Document handle it
export interface ProjectDocument extends Omit<IProject, '_id'>, Document {}

const milestoneSchema = new Schema<Milestone>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date },
  deliverables: [{ type: String }]
});

const messageSchema = new Schema<Message>({
  id: { type: String, required: true },
  senderId: { type: String, required: true },
  senderRole: {
    type: String,
    enum: ['client', 'expert'],
    required: true
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachments: [{ type: String }],
  messageType: {
    type: String,
    enum: ['text', 'file', 'milestone', 'system'],
    default: 'text'
  }
});

const projectFileSchema = new Schema<ProjectFile>({
  id: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  description: { type: String }
});

const projectSchema = new Schema<ProjectDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  budget: {
    total: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  expertId: {
    type: String,
    required: true,
    ref: 'Expert'
  },
  clientId: {
    type: String,
    required: true,
    ref: 'User'
  },
  milestones: [milestoneSchema],
  messages: [messageSchema],
  files: [projectFileSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ expertId: 1 });
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: -1 });
projectSchema.index({ createdAt: -1 });

// Text search index
projectSchema.index({
  title: 'text',
  description: 'text'
});

export const ProjectModel = mongoose.model<ProjectDocument>('Project', projectSchema);
