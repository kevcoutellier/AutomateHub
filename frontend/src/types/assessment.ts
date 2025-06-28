export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: number;
}

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
  id: number;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  projectsCompleted: number;
  compatibilityScore: number;
  specialties: string[];
  approach: string;
  availability: string;
  estimatedCost: string;
}