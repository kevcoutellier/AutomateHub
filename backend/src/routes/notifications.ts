import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * Get user's notifications with pagination and filtering
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const isRead = req.query.isRead as string;
    const priority = req.query.priority as string;

    // Build filter
    const filter: any = { userId };
    
    if (type) {
      filter.type = type;
    }
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (priority) {
      filter.priority = priority;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
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
