import { Server } from 'socket.io';
import { Notification, INotification } from '../models/Notification';
import { UserModel } from '../models/User';
import { ProjectModel } from '../models/Project';
import { ExpertModel } from '../models/Expert';

export interface NotificationData {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  data?: any;
  priority?: INotification['priority'];
  actionUrl?: string;
  relatedId?: string;
  relatedType?: string;
  expiresAt?: Date;
}

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Create and send a notification
   */
  async createNotification(notificationData: NotificationData): Promise<INotification> {
    try {
      // Create notification in database
      const notification = new Notification(notificationData);
      await notification.save();

      // Send real-time notification via Socket.IO
      this.io.to(`user_${notificationData.userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
        isRead: notification.isRead
      });

      // Update user's unread notification count
      const unreadCount = await this.getUnreadCount(notificationData.userId);
      this.io.to(`user_${notificationData.userId}`).emit('notification_count_update', {
        unreadCount
      });

      console.log(`Notification sent to user ${notificationData.userId}: ${notification.title}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(receiverId: string, senderId: string, conversationId: string, messageContent: string) {
    try {
      const sender = await UserModel.findById(senderId).select('firstName lastName avatar');
      if (!sender) return;

      const senderName = `${sender.firstName} ${sender.lastName}`;
      await this.createNotification({
        userId: receiverId,
        type: 'message',
        title: `Nouveau message de ${senderName}`,
        message: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
        priority: 'medium',
        actionUrl: `/conversations/${conversationId}`,
        relatedId: conversationId,
        relatedType: 'conversation',
        data: {
          senderId,
          senderName,
          senderAvatar: sender.avatar,
          conversationId
        }
      });
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  /**
   * Send project update notification
   */
  async sendProjectUpdateNotification(userId: string, projectId: string, updateType: string, details: string) {
    try {
      const project = await ProjectModel.findById(projectId).select('title');
      if (!project) return;

      const titles = {
        'status_change': 'Mise à jour du statut du projet',
        'milestone_completed': 'Jalon complété',
        'new_milestone': 'Nouveau jalon ajouté',
        'deadline_approaching': 'Échéance approchante',
        'project_completed': 'Projet terminé'
      };

      await this.createNotification({
        userId,
        type: 'project_update',
        title: titles[updateType as keyof typeof titles] || 'Mise à jour du projet',
        message: `${project.title}: ${details}`,
        priority: updateType === 'deadline_approaching' ? 'high' : 'medium',
        actionUrl: `/projects/${projectId}`,
        relatedId: projectId,
        relatedType: 'project',
        data: {
          projectId,
          projectTitle: project.title,
          updateType,
          details
        }
      });
    } catch (error) {
      console.error('Error sending project update notification:', error);
    }
  }

  /**
   * Send milestone update notification
   */
  async sendMilestoneUpdateNotification(userId: string, projectId: string, milestoneTitle: string, status: string) {
    try {
      const project = await ProjectModel.findById(projectId).select('title');
      if (!project) return;

      const statusMessages = {
        'completed': 'complété',
        'in_progress': 'en cours',
        'pending': 'en attente',
        'overdue': 'en retard'
      };

      await this.createNotification({
        userId,
        type: 'milestone_update',
        title: 'Mise à jour de jalon',
        message: `${milestoneTitle} est maintenant ${statusMessages[status as keyof typeof statusMessages] || status} dans ${project.title}`,
        priority: status === 'overdue' ? 'high' : 'medium',
        actionUrl: `/projects/${projectId}`,
        relatedId: projectId,
        relatedType: 'milestone',
        data: {
          projectId,
          projectTitle: project.title,
          milestoneTitle,
          status
        }
      });
    } catch (error) {
      console.error('Error sending milestone update notification:', error);
    }
  }

  /**
   * Send expert match notification
   */
  async sendExpertMatchNotification(userId: string, projectId: string, expertId: string) {
    try {
      const [project, expert] = await Promise.all([
        ProjectModel.findById(projectId).select('title'),
        ExpertModel.findById(expertId).populate('userId', 'name avatar')
      ]);

      if (!project || !expert) return;

      await this.createNotification({
        userId,
        type: 'expert_match',
        title: 'Nouvel expert disponible',
        message: `${(expert.userId as any).name} correspond à votre projet "${project.title}"`,
        priority: 'medium',
        actionUrl: `/experts/${expertId}`,
        relatedId: expertId,
        relatedType: 'expert',
        data: {
          projectId,
          projectTitle: project.title,
          expertId,
          expertName: (expert.userId as any).name,
          expertAvatar: (expert.userId as any).avatar,
          specialties: expert.specialties
        }
      });
    } catch (error) {
      console.error('Error sending expert match notification:', error);
    }
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(userId: string, amount: number, status: string, invoiceId?: string) {
    try {
      const statusMessages = {
        'success': 'Paiement réussi',
        'failed': 'Échec du paiement',
        'pending': 'Paiement en attente',
        'refunded': 'Paiement remboursé'
      };

      await this.createNotification({
        userId,
        type: 'payment',
        title: statusMessages[status as keyof typeof statusMessages] || 'Notification de paiement',
        message: `Montant: ${amount}€`,
        priority: status === 'failed' ? 'high' : 'medium',
        actionUrl: '/billing',
        relatedId: invoiceId,
        relatedType: 'payment',
        data: {
          amount,
          status,
          invoiceId
        }
      });
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(userId: string, title: string, message: string, priority: INotification['priority'] = 'medium') {
    try {
      await this.createNotification({
        userId,
        type: 'system',
        title,
        message,
        priority,
        data: {}
      });
    } catch (error) {
      console.error('Error sending system notification:', error);
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.countDocuments({
        userId,
        isRead: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    try {
      await Notification.updateMany(
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

      // Update user's unread notification count
      const unreadCount = await this.getUnreadCount(userId);
      this.io.to(`user_${userId}`).emit('notification_count_update', {
        unreadCount
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        {
          userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Update user's unread notification count
      this.io.to(`user_${userId}`).emit('notification_count_update', {
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }
}
