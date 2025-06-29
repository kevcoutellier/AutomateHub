// Key change: Import both the express function AND the type definitions
import express, { Request, Response } from 'express';
import { ExpertModel } from '../models/Expert';
import { UserModel } from '../models/User';
import { ReviewModel } from '../models/Review';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validateExpertProfile, validateExpertQuery, validateObjectId } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest, ExpertQuery } from '../types';

const router = express.Router();

// Get all experts with filtering and pagination - OPTIMIZED
// Using AuthenticatedRequest because optionalAuth might populate req.user
// Adding explicit Response type for consistency and type safety
router.get('/', validateExpertQuery, optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = 1,
    limit = 12,
    sort = 'averageRating',
    order = 'desc',
    specialties,
    industries,
    availability,
    minRating,
    maxRate,
    location,
    search
  } = req.query as any;

  // Build query object for database filtering
  const query: any = {};

  // Apply specialty filtering - handle both single values and arrays
  // Use $all for AND logic when multiple specialties are provided
  if (specialties) {
    const specialtiesArray = Array.isArray(specialties) ? specialties : [specialties];
    if (specialtiesArray.length > 1) {
      query.specialties = { $all: specialtiesArray };
    } else {
      query.specialties = { $in: specialtiesArray };
    }
  }

  // Apply industry filtering with the same pattern
  if (industries) {
    const industriesArray = Array.isArray(industries) ? industries : [industries];
    query.industries = { $in: industriesArray };
  }

  // Simple availability filter
  if (availability) {
    query.availability = availability;
  }

  // Rating filter - ensure we preserve existing rating conditions if any
  if (minRating) {
    query.averageRating = { $gte: parseFloat(minRating) };
  }

  // Maximum hourly rate filter
  if (maxRate) {
    query['hourlyRate.max'] = { $lte: parseFloat(maxRate) };
  }

  // Location search with case-insensitive regex
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Full-text search capability
  if (search) {
    query.$text = { $search: search };
  }

  // Build sorting configuration
  const sortObj: any = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  // Use optimized database service
  const { DatabaseOptimizationService } = await import('../services/DatabaseOptimizationService');
  const result = await DatabaseOptimizationService.findExpertsOptimized(
    query,
    { page: parseInt(page), limit: parseInt(limit) },
    sortObj
  );

  const response: any = {
    success: true,
    data: {
      experts: result.experts,
      pagination: result.pagination
    }
  };

  if (result.experts.length === 0) {
    response.message = 'No experts found matching the specified criteria';
  }

  // Add performance metrics for monitoring
  response.meta = {
    cached: false,
    queryTime: Date.now() - ((req as any).startTime || Date.now()),
    optimized: true
  };

  res.json(response);
}));

// Get current user's expert profile - protected endpoint
router.get('/me/profile', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  
  const expert = await ExpertModel.findOne({ userId: user._id });
  if (!expert) {
    throw createError('Expert profile not found', 404);
  }
  
  res.json({
    success: true,
    data: { expert }
  });
}));

// Get expert by ID - public endpoint so using base Request type
// Using Response type for consistent error handling and response formatting
router.get('/:id', validateObjectId, optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const expert = await ExpertModel.findById(req.params.id);

  if (!expert) {
    throw createError('Expert not found', 404);
  }

  // Calculate expert statistics for the response
  const allReviews = await ReviewModel.find({ expertId: req.params.id });
  const totalReviews = allReviews.length;
  const averageRating = totalReviews > 0 
    ? allReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
    : 0;

  const stats = {
    totalProjects: expert.projectsCompleted,
    completionRate: expert.successRate,
    avgResponseTime: expert.responseTime,
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10
  };

  // Get recent reviews for display
  const recentReviews = await ReviewModel.find({ expertId: req.params.id })
    .populate('clientId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      expert: {
        ...expert.toObject(),
        stats
      },
      reviews: recentReviews
    }
  });
}));

// Create expert profile - requires authentication and expert authorization
// Using AuthenticatedRequest because we need guaranteed access to req.user
router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  
  // Check if user has expert role
  if (user.role !== 'expert') {
    throw createError('Only users with expert role can create expert profiles', 403);
  }

  // Validate required fields
  const { name, title, bio, location, timezone, hourlyRate, experience, specialties, industries } = req.body;
  
  // Make title optional, use a default if not provided
  const expertTitle = title || 'Senior n8n Automation Expert';
  
  if (!bio || !location || !timezone || !hourlyRate || !experience || !specialties || !industries) {
    throw createError('Required fields: bio, location, timezone, hourlyRate, experience, specialties, industries', 400);
  }
  
  // Handle both hourlyRate formats: { min, max } or { amount, currency }
  let processedHourlyRate;
  if (hourlyRate.min !== undefined && hourlyRate.max !== undefined) {
    processedHourlyRate = { min: hourlyRate.min, max: hourlyRate.max };
  } else if (hourlyRate.amount !== undefined) {
    // Convert single amount to min/max range (assume ±20% flexibility)
    const amount = hourlyRate.amount;
    processedHourlyRate = { 
      min: Math.max(1, Math.floor(amount * 0.8)), 
      max: Math.ceil(amount * 1.2) 
    };
  } else {
    throw createError('Hourly rate must include either {min, max} or {amount}', 400);
  }
  
  // Prevent duplicate expert profiles for the same user
  const existingExpert = await ExpertModel.findOne({ userId: user._id });
  if (existingExpert) {
    throw createError('User already has an expert profile', 400);
  }

  // Merge request data with user information
  const expertData = {
    ...req.body,
    userId: user._id,
    name: `${user.firstName} ${user.lastName}`,
    title: expertTitle,
    hourlyRate: processedHourlyRate
  };

  const expert = new ExpertModel(expertData);
  await expert.save();

  res.status(201).json({
    success: true,
    message: 'Expert profile created successfully',
    data: { expert }
  });
}));

// Update expert profile - protected endpoint requiring ownership verification
// AuthenticatedRequest needed for user identification and authorization
router.put('/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  
  // Check if user has expert role
  if (user.role !== 'expert') {
    throw createError('Only experts can update expert profiles', 403);
  }
  const expertId = req.params.id;

  // Verify ownership - users can only update their own expert profiles
  const expert = await ExpertModel.findOne({ _id: expertId, userId: user._id });
  if (!expert) {
    throw createError('You can only update this expert profile if you own it', 403);
  }

  // Update with validation and return the updated document
  const updatedExpert = await ExpertModel.findByIdAndUpdate(
    expertId,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Expert profile updated successfully',
    data: { expert: updatedExpert }
  });
}));



// Add portfolio item - allows experts to showcase their work
// Requires authentication and ownership verification
router.post('/:id/portfolio', authenticate, authorize('expert'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const expertId = req.params.id;

  // Verify expert exists and belongs to authenticated user
  const expert = await ExpertModel.findOne({ _id: expertId, userId: user._id });
  if (!expert) {
    throw createError('Expert profile not found or access denied', 404);
  }

  // Create portfolio item with simple ID generation
  const portfolioItem = {
    ...req.body,
    id: Date.now().toString() // Consider using a more robust ID generation strategy
  };

  expert.portfolio.push(portfolioItem);
  await expert.save();

  res.status(201).json({
    success: true,
    message: 'Portfolio item added successfully',
    data: { portfolioItem }
  });
}));

// Update portfolio item - modify existing portfolio entries
// Requires authentication and uses array manipulation to update specific items
router.put('/:id/portfolio/:itemId', authenticate, authorize('expert'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id: expertId, itemId } = req.params;

  // Verify expert ownership
  const expert = await ExpertModel.findOne({ _id: expertId, userId: user._id });
  if (!expert) {
    throw createError('Expert profile not found or access denied', 404);
  }

  // Find specific portfolio item within the expert's portfolio
  const portfolioItem = expert.portfolio.find(item => item.id === itemId);
  if (!portfolioItem) {
    throw createError('Portfolio item not found', 404);
  }

  // Update portfolio item and save the parent document
  Object.assign(portfolioItem, req.body);
  await expert.save();

  res.json({
    success: true,
    message: 'Portfolio item updated successfully',
    data: { portfolioItem }
  });
}));

// Delete portfolio item - remove portfolio entries
// Uses array filtering to remove the specified item
router.delete('/:id/portfolio/:itemId', authenticate, authorize('expert'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id: expertId, itemId } = req.params;

  // Verify expert ownership
  const expert = await ExpertModel.findOne({ _id: expertId, userId: user._id });
  if (!expert) {
    throw createError('Expert profile not found or access denied', 404);
  }

  // Remove portfolio item from array and save
  expert.portfolio = expert.portfolio.filter(item => item.id !== itemId);
  await expert.save();

  res.json({
    success: true,
    message: 'Portfolio item deleted successfully'
  });
}));

// Get expert statistics - public endpoint for displaying performance metrics
// Using base Request type since this is a public, read-only endpoint
router.get('/:id/stats', validateObjectId, asyncHandler(async (req: Request, res: Response) => {
  const expertId = req.params.id;

  const expert = await ExpertModel.findById(expertId);
  if (!expert) {
    throw createError('Expert not found', 404);
  }

  // Calculate comprehensive statistics from review data
  const reviews = await ReviewModel.find({ expertId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  // Initialize aspect ratings for detailed feedback analysis
  const aspectRatings = {
    communication: 0,
    quality: 0,
    timeliness: 0,
    expertise: 0
  };

  // Calculate average aspect ratings across all reviews
  if (totalReviews > 0) {
    reviews.forEach(review => {
      aspectRatings.communication += review.aspects.communication;
      aspectRatings.quality += review.aspects.quality;
      aspectRatings.timeliness += review.aspects.timeliness;
      aspectRatings.expertise += review.aspects.expertise;
    });

    // Convert totals to averages
    Object.keys(aspectRatings).forEach(key => {
      aspectRatings[key as keyof typeof aspectRatings] = 
        aspectRatings[key as keyof typeof aspectRatings] / totalReviews;
    });
  }

  res.json({
    success: true,
    data: {
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to one decimal place
        aspectRatings,
        projectsCompleted: expert.projectsCompleted,
        successRate: expert.successRate,
        responseTime: expert.responseTime
      }
    }
  });
}));

export default router;