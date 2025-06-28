// Common types for the application

export interface CaseStudy {
  title: string;
  industry: string;
  timeline: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
}

export interface Expert {
  _id: string;
  id?: number; // Keep for backward compatibility
  name: string;
  title: string;
  avatar: string;
  location: string;
  timezone?: string;
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
  memberSince?: string;
  completedProjects?: number;
  clientRetention?: number;
  bio?: string;
  competencies?: any[];
  integrationExpertise?: {
    tools: any[];
  };
  caseStudies?: CaseStudy[];
  testimonials?: any[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate?: string;
  budget: number;
  expertId: number;
  clientId: number;
}

export interface Review {
  id: number;
  expertId: number;
  clientName: string;
  clientRole: string;
  rating: number;
  comment: string;
  date: string;
  projectTitle: string;
  verified: boolean;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  verified: boolean;
  credentialUrl?: string;
}

export interface AssessmentResult {
  id: string;
  businessType: string;
  currentProcesses: string[];
  painPoints: string[];
  goals: string[];
  budget: string;
  timeline: string;
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedSavings: string;
    complexity: string;
    tools: string[];
  }[];
  matchedExperts: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}