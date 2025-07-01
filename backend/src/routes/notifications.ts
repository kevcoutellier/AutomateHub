import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../types';
import ApiResponseHelper from '../utils/apiResponse';
import { notificationsRateLimit } from '../middleware/rateLimiting';
import { requireVersion } from '../middleware/versioning';

const router = Router();

// Apply rate limiting to all notification routes
router.use(notificationsRateLimit);

/**
 * Get user's notifications with advanced filtering and pagination
 * Supports: type, priority, isRead, dateRange, search
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100
    const type = req.query.type as string;
    const isRead = req.query.isRead as string;
    const priority = req.query.priority as string;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Build filter
    const filter: any = { userId };
    
    if (type) {
      filter.type = { $in: type.split(',') };
    }
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (priority) {
      filter.priority = { $in: priority.split(',') };
    }

    // Text search in title and message
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
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

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    // Get statistics by type and priority
    const stats = await Notification.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { type: '$type', priority: '$priority' },
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    return ApiResponseHelper.paginated(
      res,
      notifications,
      { page, limit, total: totalCount },
      'Notifications retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch notifications');
  }
});

/**
 * Get notification statistics and analytics
 */
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall statistics
    const totalNotifications = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    const todayCount = await Notification.countDocuments({
      userId,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Get statistics by type
    const typeStats = await Notification.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get statistics by priority
    const priorityStats = await Notification.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get daily notification count for the last 30 days
    const dailyStats = await Notification.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
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

    const stats = {
      overview: {
        total: totalNotifications,
        unread: unreadCount,
        today: todayCount,
        readRate: totalNotifications > 0 ? ((totalNotifications - unreadCount) / totalNotifications * 100).toFixed(1) : '0'
      },
      byType: typeStats,
      byPriority: priorityStats,
      daily: dailyStats
    };

    return ApiResponseHelper.success(res, stats, 'Notification statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch notification statistics');
  }
});

/**
 * Get a specific notification by ID
 */
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return ApiResponseHelper.notFound(res, 'Notification not found');
    }

    return ApiResponseHelper.success(res, notification, 'Notification retrieved successfully');
  } catch (error) {
    console.error('Error fetching notification:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch notification');
  }
});

/**
 * Mark specific notifications as read
 */
router.put('/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return ApiResponseHelper.validationError(
        res,
        { notificationIds: 'Must provide an array of notification IDs' },
        'Invalid notification IDs'
      );
    }

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    return ApiResponseHelper.success(
      res,
      { modifiedCount: result.modifiedCount },
      `${result.modifiedCount} notifications marked as read`
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return ApiResponseHelper.serverError(res, 'Failed to mark notifications as read');
  }
});

/**
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { type, priority } = req.query;

    // Build filter for marking as read
    const filter: any = { userId, isRead: false };
    
    if (type) {
      filter.type = type;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    const result = await Notification.updateMany(
      filter,
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    return ApiResponseHelper.success(
      res,
      { modifiedCount: result.modifiedCount },
      `${result.modifiedCount} notifications marked as read`
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return ApiResponseHelper.serverError(res, 'Failed to mark all notifications as read');
  }
});

/**
 * Delete specific notifications
 */
router.delete('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return ApiResponseHelper.validationError(
        res,
        { notificationIds: 'Must provide an array of notification IDs' },
        'Invalid notification IDs'
      );
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId
    });

    return ApiResponseHelper.success(
      res,
      { deletedCount: result.deletedCount },
      `${result.deletedCount} notifications deleted`
    );
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return ApiResponseHelper.serverError(res, 'Failed to delete notifications');
  }
});

/**
 * Delete all read notifications
 */
router.delete('/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { olderThanDays } = req.query;

    const filter: any = { userId, isRead: true };
    
    // Optionally delete only notifications older than X days
    if (olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays as string));
      filter.readAt = { $lt: cutoffDate };
    }

    const result = await Notification.deleteMany(filter);

    return ApiResponseHelper.success(
      res,
      { deletedCount: result.deletedCount },
      `${result.deletedCount} read notifications deleted`
    );
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    return ApiResponseHelper.serverError(res, 'Failed to delete read notifications');
  }
});

/**
 * Update notification preferences
 */
router.put('/preferences', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { emailNotifications, pushNotifications, notificationTypes } = req.body;

    // This would typically update user preferences in the User model
    // For now, we'll return a success response
    const preferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
      notificationTypes: notificationTypes || ['message', 'project_update', 'milestone_update']
    };

    return ApiResponseHelper.success(
      res,
      preferences,
      'Notification preferences updated successfully'
    );
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return ApiResponseHelper.serverError(res, 'Failed to update notification preferences');
  }
});

/**
 * Get notification templates (admin only)
 */
router.get('/templates', authenticate, requireVersion('v1'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return ApiResponseHelper.forbidden(res, 'Admin access required');
    }

    // Get distinct notification types and their templates
    const templates = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          sampleTitle: { $first: '$title' },
          sampleMessage: { $first: '$message' },
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return ApiResponseHelper.success(res, templates, 'Notification templates retrieved successfully');
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return ApiResponseHelper.serverError(res, 'Failed to fetch notification templates');
  }
});

/**
 * Bulk operations on notifications
 */
router.post('/bulk', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { action, notificationIds, filters } = req.body;

    if (!action || !['read', 'unread', 'delete'].includes(action)) {
      return ApiResponseHelper.validationError(
        res,
        { action: 'Action must be one of: read, unread, delete' },
        'Invalid action'
      );
    }

    let filter: any = { userId };

    // Use specific IDs or filters
    if (notificationIds && Array.isArray(notificationIds)) {
      filter._id = { $in: notificationIds };
    } else if (filters) {
      if (filters.type) filter.type = { $in: filters.type };
      if (filters.priority) filter.priority = { $in: filters.priority };
      if (filters.isRead !== undefined) filter.isRead = filters.isRead;
    }

    let result: any;
    let count = 0;
    
    switch (action) {
      case 'read':
        result = await Notification.updateMany(filter, {
          $set: { isRead: true, readAt: new Date() }
        });
        count = result.modifiedCount || 0;
        break;
      case 'unread':
        result = await Notification.updateMany(filter, {
          $set: { isRead: false },
          $unset: { readAt: 1 }
        });
        count = result.modifiedCount || 0;
        break;
      case 'delete':
        result = await Notification.deleteMany(filter);
        count = result.deletedCount || 0;
        break;
    }
    return ApiResponseHelper.success(
      res,
      { count, action },
      `Bulk ${action} operation completed on ${count} notifications`
    );
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return ApiResponseHelper.serverError(res, 'Failed to perform bulk operation');
  }
});



/**
 * Get notification statistics
 */
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    const stats = await Notification.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isRead'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          unread: 1,
          read: { $subtract: ['$total', '$unread'] },
          typeStats: {
            $reduce: {
              input: '$byType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this.type',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this.type', input: '$$value' } }, 0] },
                              1
                            ]
                          }
                        }
                      ]
                    ]
                  }
                ]
              }
            }
          },
          priorityStats: {
            $reduce: {
              input: '$byPriority',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this.priority',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this.priority', input: '$$value' } }, 0] },
                              1
                            ]
                          }
                        }
                      ]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      typeStats: {},
      priorityStats: {}
    };

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * Mark specific notifications as read
 */
router.put('/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'IDs de notifications requis'
      });
    }

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return res.json({
      success: true,
      data: {
        updatedCount: result.modifiedCount,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notifications'
    });
  }
});

/**
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    const result = await Notification.updateMany(
      {
        userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return res.json({
      success: true,
      data: {
        updatedCount: result.modifiedCount,
        unreadCount: 0
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notifications'
    });
  }
});

/**
 * Delete specific notifications
 */
router.delete('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'IDs de notifications requis'
      });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId
    });

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression des notifications'
    });
  }
});

/**
 * Delete all read notifications
 */
router.delete('/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    const result = await Notification.deleteMany({
      userId,
      isRead: true
    });

    return res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression des notifications lues'
    });
  }
});

/**
 * Get notification by ID
 */
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    // Mark as read if not already read
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la notification'
    });
  }
});

export default router;
