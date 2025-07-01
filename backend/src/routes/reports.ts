import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { Report } from '../models/Report';
import { ProjectModel } from '../models/Project';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../types';
import ApiResponseHelper from '../utils/apiResponse';
import { adminRateLimit } from '../middleware/rateLimiting';
import { requireVersion } from '../middleware/versioning';

const router = Router();

// Create a new report
router.post('/', authenticate, [
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('reportType').isIn(['inappropriate_behavior', 'spam', 'fraud', 'quality_issues', 'other'])
    .withMessage('Valid report type is required'),
  body('description').isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('reportedUserId').optional().isMongoId().withMessage('Valid user ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponseHelper.validationError(
        res,
        errors.array(),
        'Validation failed'
      );
    }

    const { projectId, reportType, description, reportedUserId } = req.body;

    // Verify project exists and user has access
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return ApiResponseHelper.notFound(res, 'Project not found');
    }

    // Check if user is involved in the project
    if (project.clientId.toString() !== req.user!._id && 
        project.expertId?.toString() !== req.user!._id) {
      return ApiResponseHelper.forbidden(res, 'Access denied - you must be involved in this project to report it');
    }

    // Determine severity based on report type
    let severity = 'medium';
    if (reportType === 'fraud') severity = 'high';
    if (reportType === 'spam') severity = 'low';
    if (reportType === 'inappropriate_behavior') severity = 'high';

    const report = new Report({
      projectId,
      reportedBy: req.user!._id,
      reportedUserId,
      reportType,
      description,
      severity
    });

    await report.save();

    // Populate the report with related data
    const populatedReport = await Report.findById(report._id)
      .populate('projectId', 'title')
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email');

    return ApiResponseHelper.created(
      res,
      { report: populatedReport },
      'Report created successfully'
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return ApiResponseHelper.serverError(res, 'Failed to create report');
  }
});

/**
 * Get reports with advanced filtering and analytics
 * Admin only endpoint with comprehensive filtering
 */
router.get('/', authenticate, adminRateLimit, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Only admins can view all reports
    if (user.role !== 'admin') {
      return ApiResponseHelper.forbidden(res, 'Admin access required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const reportType = req.query.reportType as string;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Build filter
    const filter: any = {};
    
    if (status) {
      filter.status = { $in: status.split(',') };
    }
    
    if (severity) {
      filter.severity = { $in: severity.split(',') };
    }
    
    if (reportType) {
      filter.reportType = { $in: reportType.split(',') };
    }

    // Text search in description
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get reports with pagination
    const reports = await Report.find(filter)
      .populate('projectId', 'title status')
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const totalCount = await Report.countDocuments(filter);

    // Get statistics
    const stats = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          pendingReports: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          resolvedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          highSeverityReports: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          }
        }
      }
    ]);

    const reportStats = stats[0] || {
      totalReports: 0,
      pendingReports: 0,
      resolvedReports: 0,
      highSeverityReports: 0
    };

    return ApiResponseHelper.success(
      res,
      {
        reports,
        stats: reportStats,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      },
      'Reports retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching reports:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch reports');
  }
});

/**
 * Get user's own reports
 */
router.get('/my-reports', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const status = req.query.status as string;

    const filter: any = { reportedBy: req.user!._id };
    
    if (status) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate('projectId', 'title')
      .populate('reportedUserId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalCount = await Report.countDocuments(filter);

    return ApiResponseHelper.paginated(
      res,
      reports,
      { page, limit, total: totalCount },
      'User reports retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch user reports');
  }
});

/**
 * Get a specific report by ID
 * Only accessible by report creator or admin
 */
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email');

    if (!report) {
      return ApiResponseHelper.notFound(res, 'Report not found');
    }

    // Check if user has access to this report
    const user = await UserModel.findById(req.user!._id);
    if (report.reportedBy.toString() !== req.user!._id && user?.role !== 'admin') {
      return ApiResponseHelper.forbidden(res, 'Access denied - you can only view your own reports');
    }

    return ApiResponseHelper.success(res, { report }, 'Report retrieved successfully');
  } catch (error) {
    console.error('Error fetching report:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch report');
  }
});

/**
 * Update report status (admin only)
 */
router.put('/:id/status', authenticate, adminRateLimit, requireVersion('v1'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return ApiResponseHelper.forbidden(res, 'Admin access required');
    }

    const { status, adminNotes } = req.body;
    
    if (!['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
      return ApiResponseHelper.validationError(
        res,
        { status: 'Status must be one of: pending, under_review, resolved, dismissed' },
        'Invalid status'
      );
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        reviewedBy: user._id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('projectId', 'title')
     .populate('reportedBy', 'firstName lastName email')
     .populate('reportedUserId', 'firstName lastName email');

    if (!report) {
      return ApiResponseHelper.notFound(res, 'Report not found');
    }

    return ApiResponseHelper.updated(res, { report }, 'Report status updated successfully');
  } catch (error) {
    console.error('Error updating report status:', error);
    return ApiResponseHelper.serverError(res, 'Failed to update report status');
  }
});

/**
 * Get reports analytics (admin only)
 */
router.get('/analytics/overview', authenticate, adminRateLimit, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return ApiResponseHelper.forbidden(res, 'Admin access required');
    }

    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall statistics
    const totalReports = await Report.countDocuments({});
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: startDate }
    });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    // Get reports by type
    const reportsByType = await Report.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get reports by severity
    const reportsBySeverity = await Report.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get daily report count for the last 30 days
    const dailyReports = await Report.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const analytics = {
      overview: {
        total: totalReports,
        recent: recentReports,
        pending: pendingReports,
        resolved: resolvedReports,
        resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0'
      },
      byType: reportsByType,
      bySeverity: reportsBySeverity,
      daily: dailyReports
    };

    return ApiResponseHelper.success(res, analytics, 'Reports analytics retrieved successfully');
  } catch (error) {
    console.error('Error fetching reports analytics:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch reports analytics');
  }
});

export default router;
