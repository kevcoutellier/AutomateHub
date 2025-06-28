import { Router, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { UserModel } from '../models/User';
import { ProjectModel } from '../models/Project';
import { ExpertModel } from '../models/Expert';
import { ReviewModel } from '../models/Review';
import { Report } from '../models/Report';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Middleware to check admin role
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User Management Routes
router.get('/users', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(filter)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        users,
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

router.get('/users/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's projects
    const projects = await ProjectModel.find({
      $or: [{ clientId: user._id }, { expertId: user._id }]
    }).populate('clientId expertId', 'firstName lastName email');

    // Get user stats
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in-progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      joinedDate: user.createdAt
    };

    return res.json({
      success: true,
      data: {
        user,
        projects,
        stats
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/suspend', authenticate, requireAdmin, [
  body('reason').notEmpty().withMessage('Suspension reason is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'suspended',
        suspensionReason: req.body.reason,
        suspendedAt: new Date(),
        suspendedBy: req.user!._id
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/activate', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        suspensionReason: undefined,
        suspendedAt: undefined,
        suspendedBy: undefined
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/role', authenticate, requireAdmin, [
  body('role').isIn(['client', 'expert', 'admin']).withMessage('Invalid role')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Project Management Routes
router.get('/projects', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, flagged, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (flagged === 'true') filter.flagged = true;

    const projects = await ProjectModel.find(filter)
      .populate('clientId expertId', 'firstName lastName email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await ProjectModel.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        projects,
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

router.put('/projects/:id/suspend', authenticate, requireAdmin, [
  body('reason').notEmpty().withMessage('Suspension reason is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const project = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'suspended',
        suspensionReason: req.body.reason,
        suspendedAt: new Date(),
        suspendedBy: req.user!._id
      },
      { new: true }
    ).populate('clientId expertId', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/projects/:id/moderation-history', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // For now, return empty history - this would typically come from an audit log collection
    return res.json({
      success: true,
      data: {
        history: []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Report Management Routes
router.get('/reports', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const reports = await Report.find(filter)
      .populate('projectId', 'title')
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(filter);

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

router.get('/reports/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.json({
      success: true,
      data: {
        report,
        project: report.projectId,
        reportedBy: report.reportedBy
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/reports/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, adminNotes, resolution } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (resolution) updateData.resolution = resolution;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('projectId', 'title')
     .populate('reportedBy', 'firstName lastName email')
     .populate('reportedUserId', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/reports/:id/escalate', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { severity, escalationReason } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        severity: severity || 'critical',
        escalationReason,
        status: 'investigating'
      },
      { new: true }
    ).populate('projectId', 'title')
     .populate('reportedBy', 'firstName lastName email')
     .populate('reportedUserId', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard and Analytics Routes
router.get('/dashboard/stats', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const activeProjects = await ProjectModel.countDocuments({ status: 'in-progress' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeProjects,
          pendingReports,
          systemHealth: 'healthy'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/analytics/user-growth', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const days = parseInt(timeRange.toString().replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.json({
      success: true,
      data: {
        userGrowth
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/analytics/revenue', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const days = parseInt(timeRange.toString().replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await ProjectModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$budget' },
          projectCount: { $sum: 1 }
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        revenue: revenue[0] || { totalRevenue: 0, projectCount: 0 }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/analytics/projects', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const days = parseInt(timeRange.toString().replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const projects = await ProjectModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        projects
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/analytics/export', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, timeRange, format } = req.body;
    
    // Generate a mock export ID
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return res.json({
      success: true,
      data: {
        exportId,
        status: 'processing',
        estimatedTime: '2-3 minutes'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// System Settings Routes
router.get('/settings', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Mock system settings
    const settings = {
      general: {
        siteName: 'AutomateHub',
        maintenanceMode: false,
        registrationEnabled: true
      },
      email: {
        provider: 'smtp',
        fromAddress: 'noreply@automatehub.com'
      },
      security: {
        passwordMinLength: 8,
        requireTwoFactor: false,
        sessionTimeout: 24
      }
    };

    return res.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Mock settings update
    return res.json({
      success: true,
      data: {
        settings: req.body
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/settings/test-email', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipient, subject } = req.body;
    
    // Mock email test
    return res.json({
      success: true,
      message: `Test email sent to ${recipient}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/system/backup', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupId = `backup_${Date.now()}`;
    
    return res.json({
      success: true,
      data: {
        backupId,
        status: 'initiated',
        estimatedTime: '5-10 minutes'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/system/health', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        health: {
          database: 'healthy',
          server: 'healthy',
          storage: 'healthy'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Audit Logs Routes
router.get('/audit-logs', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, userId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    // Mock audit logs - would need AuditLog model
    return res.json({
      success: true,
      data: {
        logs: []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
