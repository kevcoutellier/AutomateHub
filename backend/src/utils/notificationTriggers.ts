import { Server } from 'socket.io';
import { NotificationService } from '../services/NotificationService';

let notificationService: NotificationService;

export const initializeNotificationService = (io: Server) => {
  notificationService = new NotificationService(io);
  return notificationService;
};

export const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    throw new Error('NotificationService not initialized. Call initializeNotificationService first.');
  }
  return notificationService;
};

// Project-related notification triggers
export const triggerProjectNotifications = {
  // When a project status changes
  onStatusChange: async (projectId: string, clientId: string, expertId: string, newStatus: string, details: string) => {
    const service = getNotificationService();
    
    // Notify client
    await service.sendProjectUpdateNotification(clientId, projectId, 'status_change', `Statut changé vers: ${newStatus}. ${details}`);
    
    // Notify expert if different from client
    if (expertId !== clientId) {
      await service.sendProjectUpdateNotification(expertId, projectId, 'status_change', `Statut changé vers: ${newStatus}. ${details}`);
    }
  },

  // When a milestone is completed
  onMilestoneCompleted: async (projectId: string, clientId: string, expertId: string, milestoneTitle: string) => {
    const service = getNotificationService();
    
    // Notify client
    await service.sendMilestoneUpdateNotification(clientId, projectId, milestoneTitle, 'completed');
    
    // Notify expert if different
    if (expertId !== clientId) {
      await service.sendMilestoneUpdateNotification(expertId, projectId, milestoneTitle, 'completed');
    }
  },

  // When a new milestone is added
  onMilestoneAdded: async (projectId: string, clientId: string, expertId: string, milestoneTitle: string) => {
    const service = getNotificationService();
    
    // Notify both parties
    await service.sendProjectUpdateNotification(clientId, projectId, 'new_milestone', `Nouveau jalon ajouté: ${milestoneTitle}`);
    
    if (expertId !== clientId) {
      await service.sendProjectUpdateNotification(expertId, projectId, 'new_milestone', `Nouveau jalon ajouté: ${milestoneTitle}`);
    }
  },

  // When a deadline is approaching
  onDeadlineApproaching: async (projectId: string, clientId: string, expertId: string, milestoneTitle: string, daysLeft: number) => {
    const service = getNotificationService();
    const message = `Échéance dans ${daysLeft} jour(s) pour: ${milestoneTitle}`;
    
    // Notify both parties with high priority
    await service.sendProjectUpdateNotification(clientId, projectId, 'deadline_approaching', message);
    
    if (expertId !== clientId) {
      await service.sendProjectUpdateNotification(expertId, projectId, 'deadline_approaching', message);
    }
  },

  // When a project is completed
  onProjectCompleted: async (projectId: string, clientId: string, expertId: string) => {
    const service = getNotificationService();
    
    // Notify client
    await service.sendProjectUpdateNotification(clientId, projectId, 'project_completed', 'Projet terminé avec succès!');
    
    // Notify expert
    if (expertId !== clientId) {
      await service.sendProjectUpdateNotification(expertId, projectId, 'project_completed', 'Projet terminé avec succès!');
    }
  }
};

// Expert matching notification triggers
export const triggerExpertMatchNotifications = {
  // When a new expert matches a project
  onExpertMatch: async (clientId: string, projectId: string, expertId: string) => {
    const service = getNotificationService();
    await service.sendExpertMatchNotification(clientId, projectId, expertId);
  },

  // When an expert applies to a project
  onExpertApplication: async (clientId: string, projectId: string, expertId: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      clientId,
      'Nouvelle candidature d\'expert',
      'Un expert a postulé pour votre projet',
      'medium'
    );
  },

  // When a client accepts an expert
  onExpertAccepted: async (expertId: string, projectId: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      expertId,
      'Candidature acceptée',
      'Votre candidature a été acceptée pour un projet',
      'high'
    );
  },

  // When a client rejects an expert
  onExpertRejected: async (expertId: string, projectId: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      expertId,
      'Candidature non retenue',
      'Votre candidature n\'a pas été retenue pour ce projet',
      'low'
    );
  }
};

// Payment notification triggers
export const triggerPaymentNotifications = {
  // When a payment is successful
  onPaymentSuccess: async (userId: string, amount: number, invoiceId?: string) => {
    const service = getNotificationService();
    await service.sendPaymentNotification(userId, amount, 'success', invoiceId);
  },

  // When a payment fails
  onPaymentFailed: async (userId: string, amount: number, invoiceId?: string) => {
    const service = getNotificationService();
    await service.sendPaymentNotification(userId, amount, 'failed', invoiceId);
  },

  // When a payment is pending
  onPaymentPending: async (userId: string, amount: number, invoiceId?: string) => {
    const service = getNotificationService();
    await service.sendPaymentNotification(userId, amount, 'pending', invoiceId);
  },

  // When a refund is processed
  onRefundProcessed: async (userId: string, amount: number, invoiceId?: string) => {
    const service = getNotificationService();
    await service.sendPaymentNotification(userId, amount, 'refunded', invoiceId);
  }
};

// System notification triggers
export const triggerSystemNotifications = {
  // Welcome message for new users
  onUserRegistration: async (userId: string, userName: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      userId,
      'Bienvenue sur AutomateHub!',
      `Bonjour ${userName}, bienvenue dans notre communauté d'experts n8n. Explorez les projets disponibles et commencez votre parcours.`,
      'medium'
    );
  },

  // Profile completion reminder
  onProfileIncomplete: async (userId: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      userId,
      'Complétez votre profil',
      'Complétez votre profil pour augmenter vos chances d\'être sélectionné pour des projets.',
      'low'
    );
  },

  // Account verification reminder
  onEmailVerificationPending: async (userId: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      userId,
      'Vérifiez votre email',
      'Vérifiez votre adresse email pour activer toutes les fonctionnalités de votre compte.',
      'medium'
    );
  },

  // Maintenance notifications
  onMaintenanceScheduled: async (userId: string, maintenanceDate: Date) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      userId,
      'Maintenance programmée',
      `Une maintenance est programmée le ${maintenanceDate.toLocaleDateString('fr-FR')}. Certains services pourraient être temporairement indisponibles.`,
      'medium'
    );
  },

  // Security notifications
  onSecurityAlert: async (userId: string, alertType: string, details: string) => {
    const service = getNotificationService();
    await service.sendSystemNotification(
      userId,
      'Alerte de sécurité',
      `${alertType}: ${details}`,
      'urgent'
    );
  }
};

// Batch notification triggers for admin operations
export const triggerBatchNotifications = {
  // Send notification to multiple users
  sendToMultipleUsers: async (userIds: string[], title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    const service = getNotificationService();
    
    const promises = userIds.map(userId => 
      service.sendSystemNotification(userId, title, message, priority)
    );
    
    await Promise.all(promises);
  },

  // Send notification to all users with a specific role
  sendToRole: async (role: 'client' | 'expert' | 'admin', title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    // This would require a user service to get users by role
    // Implementation depends on your user management system
    console.log(`Batch notification to ${role}: ${title}`);
  }
};
