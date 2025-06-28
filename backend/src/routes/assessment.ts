import express from 'express';
import { AssessmentModel } from '../models/Assessment';
import { ExpertModel } from '../models/Expert';
import { authenticate, authorize } from '../middleware/auth';
import { validatePagination, validateObjectId } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest, AssessmentData, OpportunityRecommendation, ExpertRecommendation } from '../types';

const router = express.Router();

// Submit assessment
router.post('/', authenticate, authorize('client'), asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const { assessmentData } = req.body;

  if (!assessmentData) {
    throw createError('Assessment data is required', 400);
  }

  // Calculate readiness score
  const readinessScore = calculateReadinessScore(assessmentData);

  // Generate recommendations
  const recommendations = generateRecommendations(assessmentData, readinessScore);

  // Get expert recommendations
  const expertRecommendations = await getExpertRecommendations(assessmentData, readinessScore);

  const assessment = new AssessmentModel({
    clientId: user._id,
    assessmentData,
    readinessScore,
    recommendations,
    expertRecommendations
  });

  await assessment.save();

  res.status(201).json({
    success: true,
    message: 'Assessment completed successfully',
    data: { assessment }
  });
}));

// Get user's assessments
router.get('/my-assessments', authenticate, authorize('client'), validatePagination, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc'
  } = req.query as any;

  const sortObj: any = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const assessments = await AssessmentModel.find({ clientId: user._id })
    .populate('expertRecommendations.expertId', 'name title avatar rating')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AssessmentModel.countDocuments({ clientId: user._id });

  res.json({
    success: true,
    data: {
      assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get assessment by ID
router.get('/:id', authenticate, authorize('client'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const assessmentId = req.params.id;

  const assessment = await AssessmentModel.findOne({
    _id: assessmentId,
    clientId: user._id
  }).populate('expertRecommendations.expertId', 'name title avatar rating hourlyRate specialties');

  if (!assessment) {
    throw createError('Assessment not found', 404);
  }

  res.json({
    success: true,
    data: { assessment }
  });
}));

// Get assessment results with detailed expert info
router.get('/:id/results', authenticate, authorize('client'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const assessmentId = req.params.id;

  const assessment = await AssessmentModel.findOne({
    _id: assessmentId,
    clientId: user._id
  });

  if (!assessment) {
    throw createError('Assessment not found', 404);
  }

  // Get detailed expert information
  const expertIds = assessment.expertRecommendations.map(rec => rec.expertId);
  const experts = await ExpertModel.find({ _id: { $in: expertIds } });

  // Combine expert data with recommendations
  const detailedExpertRecommendations = assessment.expertRecommendations.map(rec => {
    const expert = experts.find(exp => (exp._id as string).toString() === rec.expertId);
    return {
      ...rec,
      expert
    };
  });

  res.json({
    success: true,
    data: {
      assessment: {
        ...assessment.toObject(),
        expertRecommendations: detailedExpertRecommendations
      }
    }
  });
}));

// Delete assessment
router.delete('/:id', authenticate, authorize('client'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const assessmentId = req.params.id;

  const assessment = await AssessmentModel.findOneAndDelete({
    _id: assessmentId,
    clientId: user._id
  });

  if (!assessment) {
    throw createError('Assessment not found', 404);
  }

  res.json({
    success: true,
    message: 'Assessment deleted successfully'
  });
}));

// Helper function to calculate readiness score
function calculateReadinessScore(assessmentData: AssessmentData): number {
  let score = 0;
  let maxScore = 100;

  // Business Context (25%)
  const businessContext = assessmentData['business-context'] || {};
  if (businessContext.companySize) score += 6;
  if (businessContext.industry) score += 6;
  if (businessContext.currentTools?.length && businessContext.currentTools.length > 0) score += 8;
  if (businessContext.growthStage) score += 5;

  // Pain Points (30%)
  const painPoints = assessmentData['pain-points'] || {};
  if (painPoints.timeSpent && painPoints.timeSpent > 5) score += 10;
  if (painPoints.errorFrequency && painPoints.errorFrequency > 3) score += 8;
  if (painPoints.processBottlenecks?.length && painPoints.processBottlenecks.length > 0) score += 7;
  if (painPoints.teamFrustration && painPoints.teamFrustration > 6) score += 5;

  // Goals (25%)
  const goals = assessmentData['goals'] || {};
  if (goals.primaryGoal) score += 8;
  if (goals.successMetrics?.length && goals.successMetrics.length > 0) score += 7;
  if (goals.timeline) score += 5;
  if (goals.budget) score += 5;

  // Technical (20%)
  const technical = assessmentData['technical'] || {};
  if (technical.technicalResources) score += 7;
  if (technical.dataQuality && technical.dataQuality > 6) score += 6;
  if (technical.changeReadiness && technical.changeReadiness > 6) score += 7;

  return Math.min(score, maxScore);
}

// Helper function to generate recommendations
function generateRecommendations(assessmentData: AssessmentData, readinessScore: number): OpportunityRecommendation[] {
  const recommendations: OpportunityRecommendation[] = [];
  
  const businessContext = assessmentData['business-context'] || {};
  const painPoints = assessmentData['pain-points'] || {};
  const goals = assessmentData['goals'] || {};

  // E-commerce recommendations
  if (businessContext.industry === 'E-commerce' || businessContext.currentTools?.includes('Shopify')) {
    recommendations.push({
      title: 'Order Processing Automation',
      description: 'Automate order fulfillment from payment to shipping notification',
      currentState: 'Manual order processing taking 2-3 hours per batch',
      futureState: 'Fully automated order processing in under 5 minutes',
      timeSavings: 15,
      costSavings: 25000,
      complexity: 'Medium',
      timeline: '2-3 weeks',
      priority: 'High'
    });
  }

  // CRM automation for service businesses
  if (businessContext.currentTools?.includes('HubSpot') || businessContext.currentTools?.includes('Salesforce')) {
    recommendations.push({
      title: 'Lead Nurturing Automation',
      description: 'Automated lead scoring and nurturing workflows',
      currentState: 'Manual lead follow-up with inconsistent timing',
      futureState: 'Intelligent lead nurturing with personalized touchpoints',
      timeSavings: 20,
      costSavings: 35000,
      complexity: 'Medium',
      timeline: '3-4 weeks',
      priority: 'High'
    });
  }

  // Data processing for high error frequency
  if (painPoints.errorFrequency && painPoints.errorFrequency > 5) {
    recommendations.push({
      title: 'Data Validation & Processing',
      description: 'Automated data validation and error handling workflows',
      currentState: 'High error rates causing rework and delays',
      futureState: 'Automated validation preventing 95% of data errors',
      timeSavings: 12,
      costSavings: 18000,
      complexity: 'Low',
      timeline: '1-2 weeks',
      priority: 'High'
    });
  }

  // Customer support automation
  if (painPoints.processBottlenecks?.includes('Customer Support')) {
    recommendations.push({
      title: 'Customer Support Automation',
      description: 'Intelligent ticket routing and automated responses',
      currentState: 'Manual ticket handling with long response times',
      futureState: 'Automated ticket classification and instant responses',
      timeSavings: 25,
      costSavings: 40000,
      complexity: 'Medium',
      timeline: '2-3 weeks',
      priority: 'Medium'
    });
  }

  // Default recommendation for high readiness score
  if (readinessScore > 70 && recommendations.length === 0) {
    recommendations.push({
      title: 'Workflow Optimization Assessment',
      description: 'Comprehensive analysis of your current processes for automation opportunities',
      currentState: 'Multiple manual processes with optimization potential',
      futureState: 'Streamlined automated workflows across key business functions',
      timeSavings: 30,
      costSavings: 50000,
      complexity: 'Medium',
      timeline: '4-6 weeks',
      priority: 'High'
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
} // Changed closing parenthesis to closing brace

// Helper function to get expert recommendations
async function getExpertRecommendations(assessmentData: AssessmentData, readinessScore: number): Promise<ExpertRecommendation[]> {
  const businessContext = assessmentData['business-context'] || {};
  const goals = assessmentData['goals'] || {};
  
  // Build query for matching experts
  const query: any = { featured: true }; // Start with featured experts
  
  // Match by industry
  if (businessContext.industry) {
    query.industries = businessContext.industry;
  }

  // Match by current tools/specialties
  if (businessContext.currentTools?.length) {
    const toolSpecialties = businessContext.currentTools.map(tool => {
      switch (tool) {
        case 'Shopify': return 'E-commerce Integration';
        case 'HubSpot': case 'Salesforce': return 'CRM Automation';
        case 'QuickBooks': return 'Financial Workflows';
        default: return 'API Development';
      }
    });
    query.specialties = { $in: toolSpecialties };
  }

  // Get top experts
  const experts = await ExpertModel.find(query)
    .sort({ rating: -1, reviewCount: -1 })
    .limit(5);

  // If no specific matches, get top-rated experts
  if (experts.length === 0) {
    const fallbackExperts = await ExpertModel.find({ rating: { $gte: 4.5 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(3);
    experts.push(...fallbackExperts);
  }

  // Generate recommendations for each expert
  return experts.map(expert => {
    const compatibilityScore = calculateCompatibilityScore(expert, assessmentData, readinessScore);
    
    return {
      expertId: (expert._id as string).toString(),
      compatibilityScore,
      approach: generateApproach(expert, assessmentData),
      estimatedCost: generateCostEstimate(expert, goals.budget),
      availability: expert.availability === 'available' ? 'Available this week' : (expert as any).nextAvailable || 'Contact for availability'
    };
  });
}

// Helper function to calculate compatibility score
function calculateCompatibilityScore(expert: any, assessmentData: AssessmentData, readinessScore: number): number {
  let score = 50; // Base score
  
  const businessContext = assessmentData['business-context'] || {};
  
  // Industry match
  if (businessContext.industry && expert.industries.includes(businessContext.industry)) {
    score += 20;
  }
  
  // Tool/specialty match
  if (businessContext.currentTools?.length) {
    const matches = businessContext.currentTools.filter((tool: string) => 
      expert.specialties.some((specialty: string) => 
        specialty.toLowerCase().includes(tool.toLowerCase())
      )
    );
    score += matches.length * 5;
  }
  
  // Expert rating bonus
  score += (expert.rating - 3) * 5;
  
  // Readiness score alignment
  if (readinessScore > 70) score += 10;
  
  return Math.min(score, 100);
}

// Helper function to generate approach
function generateApproach(expert: any, assessmentData: AssessmentData): string {
  const approaches = [
    'Focus on high-impact workflows first, then expand systematically',
    'Start with data integration, then build automation layers',
    'Implement quick wins while planning comprehensive solution',
    'Begin with process mapping and optimization before automation',
    'Prioritize error reduction and quality improvements'
  ];
  
  // Simple approach selection based on expert specialties
  if (expert.specialties.includes('E-commerce Integration')) {
    return 'Focus on order processing and inventory automation first';
  } else if (expert.specialties.includes('CRM Automation')) {
    return 'Start with lead management, then expand to customer lifecycle';
  } else if (expert.specialties.includes('Data Processing')) {
    return 'Begin with data validation and cleaning workflows';
  }
  
  return approaches[Math.floor(Math.random() * approaches.length)];
}

// Helper function to generate cost estimate
function generateCostEstimate(expert: any, budget?: string): string {
  const minRate = expert.hourlyRate?.min || 50;
  const maxRate = expert.hourlyRate?.max || 150;
  
  // Estimate 20-40 hours for typical project
  const minCost = minRate * 20;
  const maxCost = maxRate * 40;
  
  return `$${minCost.toLocaleString()} - $${maxCost.toLocaleString()}`;
}

export default router;
