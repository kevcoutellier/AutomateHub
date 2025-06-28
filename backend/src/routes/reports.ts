import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { Report } from '../models/Report';
import { ProjectModel } from '../models/Project';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../types';

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
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { projectId, reportType, description, reportedUserId } = req.body;

    // Verify project exists and user has access
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is involved in the project
    if (project.clientId.toString() !== req.user!._id && 
        project.expertId?.toString() !== req.user!._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Determine severity based on report type
    let severity = 'medium';
    if (reportType === 'fraud') severity = 'high';
    if (reportType === 'spam') severity = 'low';

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

    return res.status(201).json({
      success: true,
      data: { report: populatedReport }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's reports
router.get('/my-reports', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reports = await Report.find({ reportedBy: req.user!._id })
      .populate('projectId', 'title')
      .populate('reportedUserId', 'firstName lastName')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments({ reportedBy: req.user!._id });

    return res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a specific report (only if user created it or is admin)
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check if user has access to this report
    const user = await UserModel.findById(req.user!._id);
    if (report.reportedBy.toString() !== req.user!._id && user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
