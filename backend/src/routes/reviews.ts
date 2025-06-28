import express from 'express';
import { ReviewModel } from '../models/Review';
import { ProjectModel } from '../models/Project';
import { ExpertModel } from '../models/Expert';
import { authenticate, authorize } from '../middleware/auth';
import { validateReview, validatePagination, validateObjectId } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get reviews with filtering and pagination
router.get('/', validatePagination, asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    expertId,
    minRating
  } = req.query as any;

  const query: any = {};
  
  if (expertId) {
    query.expertId = expertId;
  }

  if (minRating) {
    query.rating = { $gte: parseInt(minRating) };
  }

  const sortObj: any = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const reviews = await ReviewModel.find(query)
    .populate('clientId', 'firstName lastName avatar')
    .populate('expertId', 'name title avatar')
    .populate('projectId', 'title')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ReviewModel.countDocuments(query);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get review by ID
router.get('/:id', validateObjectId, asyncHandler(async (req: express.Request, res: express.Response) => {
  const review = await ReviewModel.findById(req.params.id)
    .populate('clientId', 'firstName lastName avatar')
    .populate('expertId', 'name title avatar')
    .populate('projectId', 'title');

  if (!review) {
    throw createError('Review not found', 404);
  }

  res.json({
    success: true,
    data: { review }
  });
}));

// Create review (client only, for completed projects)
router.post('/', authenticate, authorize('client'), validateReview, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const { projectId, rating, comment, aspects } = req.body;

  // Verify project exists and belongs to the client
  const project = await ProjectModel.findOne({
    _id: projectId,
    clientId: user._id,
    status: 'completed'
  });

  if (!project) {
    throw createError('Project not found or not completed', 404);
  }

  // Check if review already exists for this project
  const existingReview = await ReviewModel.findOne({
    projectId,
    clientId: user._id
  });

  if (existingReview) {
    throw createError('Review already exists for this project', 400);
  }

  // Create review
  const review = new ReviewModel({
    expertId: project.expertId,
    clientId: user._id,
    projectId,
    rating,
    comment,
    aspects,
    verified: true // Auto-verify since it's from a completed project
  });

  await review.save();

  // Update expert's rating statistics
  await updateExpertRating(project.expertId.toString());

  // Populate the created review
  const populatedReview = await ReviewModel.findById(review._id)
    .populate('clientId', 'firstName lastName avatar')
    .populate('expertId', 'name title avatar')
    .populate('projectId', 'title');

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review: populatedReview }
  });
}));

// Update review (client only, within 30 days)
router.put('/:id', authenticate, authorize('client'), validateObjectId, validateReview, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const reviewId = req.params.id;
  const { rating, comment, aspects } = req.body;

  const review = await ReviewModel.findOne({
    _id: reviewId,
    clientId: user._id
  });

  if (!review) {
    throw createError('Review not found or access denied', 404);
  }

  // Check if review is within 30 days (editable period)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if ((review as any).createdAt < thirtyDaysAgo) {
    throw createError('Review can only be edited within 30 days of creation', 400);
  }

  // Update review
  review.rating = rating;
  review.comment = comment;
  review.aspects = aspects;
  await review.save();

  // Update expert's rating statistics
  await updateExpertRating(review.expertId.toString());

  const updatedReview = await ReviewModel.findById(reviewId)
    .populate('clientId', 'firstName lastName avatar')
    .populate('expertId', 'name title avatar')
    .populate('projectId', 'title');

  res.json({
    success: true,
    message: 'Review updated successfully',
    data: { review: updatedReview }
  });
}));

// Delete review (client only, within 7 days)
router.delete('/:id', authenticate, authorize('client'), validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const reviewId = req.params.id;

  const review = await ReviewModel.findOne({
    _id: reviewId,
    clientId: user._id
  });

  if (!review) {
    throw createError('Review not found or access denied', 404);
  }

  // Check if review is within 7 days (deletable period)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if ((review as any).createdAt < sevenDaysAgo) {
    throw createError('Review can only be deleted within 7 days of creation', 400);
  }

  const expertId = review.expertId.toString();
  await ReviewModel.findByIdAndDelete(reviewId);

  // Update expert's rating statistics
  await updateExpertRating(expertId);

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
}));

// Get expert's reviews
router.get('/expert/:expertId', validateObjectId, validatePagination, asyncHandler(async (req: express.Request, res: express.Response) => {
  const expertId = req.params.expertId;
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc'
  } = req.query as any;

  // Verify expert exists
  const expert = await ExpertModel.findById(expertId);
  if (!expert) {
    throw createError('Expert not found', 404);
  }

  const sortObj: any = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const reviews = await ReviewModel.find({ expertId })
    .populate('clientId', 'firstName lastName avatar')
    .populate('projectId', 'title')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ReviewModel.countDocuments({ expertId });

  // Calculate review statistics
  const allReviews = await ReviewModel.find({ expertId });
  const stats = calculateReviewStats(allReviews);

  res.json({
    success: true,
    data: {
      reviews,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get client's reviews
router.get('/client/my-reviews', authenticate, authorize('client'), validatePagination, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
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
  const reviews = await ReviewModel.find({ clientId: user._id })
    .populate('expertId', 'name title avatar')
    .populate('projectId', 'title')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ReviewModel.countDocuments({ clientId: user._id });

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Helper function to update expert rating
async function updateExpertRating(expertId: string) {
  const reviews = await ReviewModel.find({ expertId });
  
  if (reviews.length === 0) {
    await ExpertModel.findByIdAndUpdate(expertId, {
      rating: 0,
      reviewCount: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await ExpertModel.findByIdAndUpdate(expertId, {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviewCount: reviews.length
  });
}

// Helper function to calculate review statistics
function calculateReviewStats(reviews: any[]) {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      aspectAverages: {
        communication: 0,
        quality: 0,
        timeliness: 0,
        expertise: 0
      }
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
  });

  const aspectTotals = {
    communication: 0,
    quality: 0,
    timeliness: 0,
    expertise: 0
  };

  reviews.forEach(review => {
    aspectTotals.communication += review.aspects.communication;
    aspectTotals.quality += review.aspects.quality;
    aspectTotals.timeliness += review.aspects.timeliness;
    aspectTotals.expertise += review.aspects.expertise;
  });

  const aspectAverages = {
    communication: Math.round((aspectTotals.communication / reviews.length) * 10) / 10,
    quality: Math.round((aspectTotals.quality / reviews.length) * 10) / 10,
    timeliness: Math.round((aspectTotals.timeliness / reviews.length) * 10) / 10,
    expertise: Math.round((aspectTotals.expertise / reviews.length) * 10) / 10
  };

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution,
    aspectAverages
  };
}

export default router;
