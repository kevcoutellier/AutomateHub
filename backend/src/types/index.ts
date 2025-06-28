import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'expert' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: User & Document;
}

// Expert Types
export interface Expert {
  _id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  timezone: string;
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
  successRate: number;
  responseTime: string;
  hourlyRate: {
    min: number;
    max: number;
    currency: string;
  };
  availability: 'available' | 'busy' | 'unavailable';
  nextAvailable: string;
  specialties: string[];
  industries: string[];
  certifications: string[];
  languages: string[];
  experience: string;
  completionTime: string;
  recentProject: string;
  featured: boolean;
  bio: string;
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  timeline: string;
  technologies: string[];
  images?: string[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  rating: number;
  comment: string;
  projectTitle: string;
  date: Date;
  verified: boolean;
}

// Project Types
export interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: Date;
  endDate?: Date;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  expertId: string;
  clientId: string;
  milestones: Milestone[];
  messages: Message[];
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: Date;
  completedDate?: Date;
  deliverables: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderRole: 'client' | 'expert';
  content: string;
  timestamp: Date;
  attachments?: string[];
  messageType: 'text' | 'file' | 'milestone' | 'system';
}

export interface ProjectFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

// Review Types
export interface Review {
  _id: string;
  expertId: string;
  clientId: string;
  projectId: string;
  rating: number;
  comment: string;
  aspects: {
    communication: number;
    quality: number;
    timeliness: number;
    expertise: number;
  };
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Types
export interface AssessmentData {
  'business-context'?: {
    companySize?: string;
    industry?: string;
    currentTools?: string[];
    growthStage?: string;
  };
  'pain-points'?: {
    timeSpent?: number;
    errorFrequency?: number;
    processBottlenecks?: string[];
    growthBarrier?: string;
    teamFrustration?: number;
  };
  'goals'?: {
    primaryGoal?: string;
    successMetrics?: string[];
    timeline?: string;
    budget?: string;
  };
  'technical'?: {
    technicalResources?: string;
    dataQuality?: number;
    changeReadiness?: number;
  };
}

export interface AssessmentResult {
  _id: string;
  clientId: string;
  assessmentData: AssessmentData;
  readinessScore: number;
  recommendations: OpportunityRecommendation[];
  expertRecommendations: ExpertRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OpportunityRecommendation {
  title: string;
  description: string;
  currentState: string;
  futureState: string;
  timeSavings: number;
  costSavings: number;
  complexity: 'Low' | 'Medium' | 'High';
  timeline: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ExpertRecommendation {
  expertId: string;
  compatibilityScore: number;
  approach: string;
  estimatedCost: string;
  availability: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ExpertQuery extends PaginationQuery {
  specialties?: string[];
  industries?: string[];
  availability?: string;
  minRating?: number;
  maxRate?: number;
  location?: string;
  search?: string;
}

export interface ProjectQuery extends PaginationQuery {
  status?: string;
  expertId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}
