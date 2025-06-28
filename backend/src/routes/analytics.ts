import express, { Request, Response } from 'express';
import { ProjectModel } from '../models/Project';
import { ExpertModel } from '../models/Expert';
import { ReviewModel } from '../models/Review';
import { authenticate } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to parse time range
const getDateRange = (timeRange: string) => {
  const now = new Date();
  const ranges: { [key: string]: Date } = {
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  };
  return ranges[timeRange] || ranges['30d'];
};

// Helper function to get previous period for comparison
const getPreviousPeriodRange = (timeRange: string) => {
  const now = new Date();
  const current = getDateRange(timeRange);
  const periodLength = now.getTime() - current.getTime();
  
  return {
    start: new Date(current.getTime() - periodLength),
    end: current
  };
};

// GET /api/analytics - Platform analytics
router.get('/', authenticate, async (req: Request, res: Response): Promise<Response> => {
  try {
    const timeRange = (req.query.timeRange as string) || '30d';
    const startDate = getDateRange(timeRange);
    const previousPeriod = getPreviousPeriodRange(timeRange);

    // Platform Metrics
    const [
      totalProjects,
      previousTotalProjects,
      completedProjects,
      previousCompletedProjects,
      totalExperts,
      activeExperts,
      allReviews,
      recentProjects,
      projectsByCategory
    ] = await Promise.all([
      // Current period total projects
      ProjectModel.countDocuments({ createdAt: { $gte: startDate } }),
      // Previous period total projects for comparison
      ProjectModel.countDocuments({ 
        createdAt: { $gte: previousPeriod.start, $lt: previousPeriod.end } 
      }),
      // Current period completed projects
      ProjectModel.countDocuments({ 
        status: 'completed',
        createdAt: { $gte: startDate }
      }),
      // Previous period completed projects
      ProjectModel.countDocuments({ 
        status: 'completed',
        createdAt: { $gte: previousPeriod.start, $lt: previousPeriod.end }
      }),
      // Total experts count
      ExpertModel.countDocuments({ isApproved: true }),
      // Active experts (with projects in time range)
      ProjectModel.distinct('expertId', { createdAt: { $gte: startDate } }),
      // All reviews for satisfaction calculation
      ReviewModel.find({ isPublic: true, isVerified: true }),
      // Recent projects for revenue calculation
      ProjectModel.find({ 
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'in-progress'] }
      }).select('budget status createdAt'),
      // Projects by category/specialty
      ProjectModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $lookup: { from: 'experts', localField: 'expertId', foreignField: '_id', as: 'expert' } },
        { $unwind: '$expert' },
        { $unwind: '$expert.specialties' },
        { $group: { _id: '$expert.specialties', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate success rate
    const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    const previousSuccessRate = previousTotalProjects > 0 ? (previousCompletedProjects / previousTotalProjects) * 100 : 0;

    // Calculate average project value
    const totalBudget = recentProjects.reduce((sum, project) => sum + (project.budget?.total || 0), 0);
    const avgProjectValue = recentProjects.length > 0 ? totalBudget / recentProjects.length : 0;

    // Calculate client satisfaction from reviews
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const clientSatisfaction = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Calculate expert metrics
    const expertReviews = await ReviewModel.find({ 
      isPublic: true, 
      isVerified: true,
      createdAt: { $gte: startDate }
    });
    
    const avgRating = expertReviews.length > 0 
      ? expertReviews.reduce((sum, review) => sum + review.rating, 0) / expertReviews.length 
      : 0;

    // Generate revenue data (mock for now, can be replaced with real payment data)
    const revenueData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthProjects = await ProjectModel.find({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: 'completed'
      }).select('budget');
      
      const monthRevenue = monthProjects.reduce((sum, project) => sum + (project.budget?.total || 0), 0);
      
      revenueData.push({
        period: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(monthRevenue),
        target: Math.round(monthRevenue * 0.9) // Target is 90% of actual for demo
      });
    }

    // Generate project data by weeks
    const projectData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekProjects = await ProjectModel.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd }
      });
      
      projectData.push({
        period: `Week ${4 - i}`,
        value: weekProjects
      });
    }

    // Process category data
    const categoryData = projectsByCategory.map((cat, index) => ({
      category: cat._id || 'Other',
      count: cat.count,
      percentage: Math.round((cat.count / totalProjects) * 100) || 0
    }));

    // Calculate rating distribution
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(review => {
      ratingCounts[review.rating as keyof typeof ratingCounts]++;
    });

    const totalReviews = allReviews.length || 1;
    const ratingDistribution = {
      fiveStars: Math.round((ratingCounts[5] / totalReviews) * 100),
      fourStars: Math.round((ratingCounts[4] / totalReviews) * 100),
      threeStars: Math.round((ratingCounts[3] / totalReviews) * 100),
      twoStars: Math.round((ratingCounts[2] / totalReviews) * 100),
      oneStars: Math.round((ratingCounts[1] / totalReviews) * 100)
    };

    // Calculate percentage changes
    const projectsChange = previousTotalProjects > 0 
      ? ((totalProjects - previousTotalProjects) / previousTotalProjects) * 100 
      : 0;
    
    const successRateChange = previousSuccessRate > 0 
      ? successRate - previousSuccessRate 
      : 0;

    const response = {
      success: true,
      data: {
        platformMetrics: {
          totalProjects,
          successRate: Math.round(successRate * 10) / 10,
          avgProjectValue: Math.round(avgProjectValue),
          clientSatisfaction: Math.round(clientSatisfaction * 10) / 10
        },
        expertMetrics: {
          activeExperts: activeExperts.length,
          avgResponseTime: '2.3h', // This would need to be calculated from message timestamps
          expertRetention: 94, // This would need historical expert data
          avgRating: Math.round(avgRating * 10) / 10
        },
        revenueData,
        projectData,
        categoryData,
        ratingDistribution,
        changes: {
          totalProjects: Math.round(projectsChange * 10) / 10,
          successRate: Math.round(successRateChange * 10) / 10,
          avgProjectValue: 8.3, // Mock for now
          clientSatisfaction: 0.1 // Mock for now
        }
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/analytics/platform - Platform-specific analytics
router.get('/platform', authenticate, async (req: Request, res: Response): Promise<Response> => {
  try {
    const timeRange = (req.query.timeRange as string) || '30d';
    const startDate = getDateRange(timeRange);

    const [
      totalProjects,
      completedProjects,
      totalRevenue,
      avgSatisfaction
    ] = await Promise.all([
      ProjectModel.countDocuments({ createdAt: { $gte: startDate } }),
      ProjectModel.countDocuments({ 
        status: 'completed',
        createdAt: { $gte: startDate }
      }),
      ProjectModel.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$budget.total' } } }
      ]),
      ReviewModel.aggregate([
        { $match: { isPublic: true, isVerified: true, createdAt: { $gte: startDate } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    const revenue = totalRevenue[0]?.total || 0;
    const satisfaction = avgSatisfaction[0]?.avgRating || 0;

    return res.json({
      success: true,
      data: {
        totalProjects,
        successRate: Math.round(successRate * 10) / 10,
        totalRevenue: Math.round(revenue),
        clientSatisfaction: Math.round(satisfaction * 10) / 10,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch platform analytics'
    });
  }
});

// GET /api/analytics/expert/:id - Expert-specific analytics
router.get('/expert/:id?', authenticate, async (req: Request, res: Response): Promise<Response> => {
  try {
    const expertId = req.params.id;
    const timeRange = (req.query.timeRange as string) || '30d';
    const startDate = getDateRange(timeRange);

    if (expertId) {
      // Single expert analytics
      if (!mongoose.Types.ObjectId.isValid(expertId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expert ID'
        });
      }

      const [expert, projects, reviews, completedProjects] = await Promise.all([
        ExpertModel.findById(expertId),
        ProjectModel.find({ 
          expertId: new mongoose.Types.ObjectId(expertId),
          createdAt: { $gte: startDate }
        }),
        ReviewModel.find({ 
          expertId: new mongoose.Types.ObjectId(expertId),
          isPublic: true,
          isVerified: true,
          createdAt: { $gte: startDate }
        }),
        ProjectModel.countDocuments({
          expertId: new mongoose.Types.ObjectId(expertId),
          status: 'completed',
          createdAt: { $gte: startDate }
        })
      ]);

      if (!expert) {
        return res.status(404).json({
          success: false,
          message: 'Expert not found'
        });
      }

      const totalEarnings = projects
        .filter(p => p.status === 'completed')
        .reduce((sum, project) => sum + (project.budget?.total || 0), 0);

      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      const successRate = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

      return res.json({
        success: true,
        data: {
          expert: {
            id: expert._id,
            name: expert.name,
            title: expert.title,
            avatar: expert.portfolio[0]?.imageUrl || null
          },
          metrics: {
            totalProjects: projects.length,
            completedProjects,
            successRate: Math.round(successRate * 10) / 10,
            totalEarnings: Math.round(totalEarnings),
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
            responseTime: expert.responseTime || 'within 24 hours'
          },
          recentProjects: projects.slice(0, 5).map(project => ({
            id: project._id,
            title: project.title,
            status: project.status,
            budget: project.budget?.total || 0,
            startDate: project.startDate,
            progress: project.progress
          })),
          timeRange
        }
      });
    } else {
      // All experts overview analytics
      const [
        totalExperts,
        activeExperts,
        avgRating,
        topExperts
      ] = await Promise.all([
        ExpertModel.countDocuments({ isApproved: true, isActive: true }),
        ProjectModel.distinct('expertId', { createdAt: { $gte: startDate } }),
        ReviewModel.aggregate([
          { $match: { isPublic: true, isVerified: true, createdAt: { $gte: startDate } } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]),
        ExpertModel.find({ isApproved: true, isActive: true })
          .sort({ averageRating: -1, totalReviews: -1 })
          .limit(10)
          .select('name title averageRating totalReviews projectsCompleted')
      ]);

      return res.json({
        success: true,
        data: {
          totalExperts,
          activeExperts: activeExperts.length,
          avgRating: avgRating[0]?.avgRating ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
          expertRetention: 94, // This would need historical data calculation
          topExperts: topExperts.map(expert => ({
            id: expert._id,
            name: expert.name,
            title: expert.title,
            rating: expert.averageRating,
            reviews: expert.totalReviews,
            projects: expert.projectsCompleted
          })),
          timeRange
        }
      });
    }
  } catch (error) {
    console.error('Error fetching expert analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expert analytics'
    });
  }
});

export default router;
