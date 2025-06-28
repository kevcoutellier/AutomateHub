import mongoose, { Schema, Document } from 'mongoose';
import { AssessmentResult as IAssessmentResult, AssessmentData, OpportunityRecommendation, ExpertRecommendation } from '../types';

// Fix the _id type conflict by omitting _id from IAssessmentResult and letting Document handle it
export interface AssessmentDocument extends Omit<IAssessmentResult, '_id'>, Document {}

const opportunityRecommendationSchema = new Schema<OpportunityRecommendation>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  currentState: { type: String, required: true },
  futureState: { type: String, required: true },
  timeSavings: { type: Number, required: true },
  costSavings: { type: Number, required: true },
  complexity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  timeline: { type: String, required: true },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  }
});

const expertRecommendationSchema = new Schema<ExpertRecommendation>({
  expertId: { type: String, required: true, ref: 'Expert' },
  compatibilityScore: { type: Number, required: true, min: 0, max: 100 },
  approach: { type: String, required: true },
  estimatedCost: { type: String, required: true },
  availability: { type: String, required: true }
});

const assessmentSchema = new Schema<AssessmentDocument>({
  clientId: {
    type: String,
    required: true,
    ref: 'User'
  },
  assessmentData: {
    'business-context': {
      companySize: { type: String },
      industry: { type: String },
      currentTools: [{ type: String }],
      growthStage: { type: String }
    },
    'pain-points': {
      timeSpent: { type: Number },
      errorFrequency: { type: Number },
      processBottlenecks: [{ type: String }],
      growthBarrier: { type: String },
      teamFrustration: { type: Number }
    },
    'goals': {
      primaryGoal: { type: String },
      successMetrics: [{ type: String }],
      timeline: { type: String },
      budget: { type: String }
    },
    'technical': {
      technicalResources: { type: String },
      dataQuality: { type: Number },
      changeReadiness: { type: Number }
    }
  },
  readinessScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  recommendations: [opportunityRecommendationSchema],
  expertRecommendations: [expertRecommendationSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
assessmentSchema.index({ clientId: 1 });
assessmentSchema.index({ readinessScore: -1 });
assessmentSchema.index({ createdAt: -1 });

export const AssessmentModel = mongoose.model<AssessmentDocument>('Assessment', assessmentSchema);
