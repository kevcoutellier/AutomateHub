import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { StatisticsService } from '../../src/services/StatisticsService';
import { DatabaseOptimizationService } from '../../src/services/DatabaseOptimizationService';
import { NotificationService } from '../../src/services/NotificationService';
import { UserModel } from '../../src/models/User';
import { ProjectModel } from '../../src/models/Project';
import { ExpertModel } from '../../src/models/Expert';
import { ReviewModel } from '../../src/models/Review';
import { NotificationModel } from '../../src/models/Notification';

describe('Services Unit Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('StatisticsService', () => {
    beforeEach(async () => {
      // Create test data
      const user1 = new UserModel({
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One',
        role: 'client'
      });
      await user1.save();

      const user2 = new UserModel({
        email: 'user2@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Two',
        role: 'expert'
      });
      await user2.save();

      const expert = new ExpertModel({
        user: user2._id,
        title: 'Test Expert',
        bio: 'Test bio',
        specialties: ['Testing'],
        hourlyRate: 100,
        location: 'Test City',
        skills: ['Jest'],
        experience: 2,
        averageRating: 4.5,
        totalReviews: 10
      });
      await expert.save();

      const project = new ProjectModel({
        title: 'Test Project',
        description: 'Test description',
        category: 'Testing',
        budget: 5000,
        timeline: 'Within 1 month',
        requirements: ['Test req'],
        client: user1._id,
        expert: user2._id,
        status: 'completed'
      });
      await project.save();

      const review = new ReviewModel({
        project: project._id,
        reviewer: user1._id,
        reviewee: user2._id,
        rating: 5,
        comment: 'Great work!',
        type: 'expert'
      });
      await review.save();
    });

    it('should get platform statistics', async () => {
      const stats = await StatisticsService.getPlatformStatistics();

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalExperts');
      expect(stats).toHaveProperty('totalProjects');
      expect(stats).toHaveProperty('completedProjects');
      expect(stats.totalUsers).toBe(2);
      expect(stats.totalExperts).toBe(1);
      expect(stats.totalProjects).toBe(1);
      expect(stats.completedProjects).toBe(1);
    });

    it('should get project performance statistics', async () => {
      const stats = await StatisticsService.getProjectPerformance();

      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('averageBudget');
      expect(stats.byStatus).toHaveProperty('completed');
      expect(stats.byCategory).toHaveProperty('Testing');
    });

    it('should get expert performance statistics', async () => {
      const stats = await StatisticsService.getExpertPerformance();

      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('averageRating');
      expect(stats).toHaveProperty('topExperts');
      expect(Array.isArray(stats.topExperts)).toBe(true);
    });

    it('should get revenue analysis', async () => {
      const stats = await StatisticsService.getRevenueAnalysis();

      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('monthlyRevenue');
      expect(stats).toHaveProperty('topExperts');
      expect(Array.isArray(stats.monthlyRevenue)).toBe(true);
    });

    it('should get client satisfaction metrics', async () => {
      const stats = await StatisticsService.getClientSatisfaction();

      expect(stats).toHaveProperty('averageRating');
      expect(stats).toHaveProperty('totalReviews');
      expect(stats).toHaveProperty('ratingDistribution');
      expect(stats.averageRating).toBeGreaterThan(0);
    });
  });

  describe('DatabaseOptimizationService', () => {
    beforeEach(async () => {
      // Create test data for optimization tests
      const users = [];
      for (let i = 0; i < 5; i++) {
        const user = new UserModel({
          email: `user${i}@example.com`,
          password: 'password123',
          firstName: `User`,
          lastName: `${i}`,
          role: i % 2 === 0 ? 'client' : 'expert'
        });
        users.push(await user.save());
      }

      // Create experts
      for (let i = 1; i < 5; i += 2) {
        const expert = new ExpertModel({
          user: users[i]._id,
          title: `Expert ${i}`,
          bio: `Bio for expert ${i}`,
          specialties: ['Testing', 'Development'],
          hourlyRate: 100 + i * 10,
          location: `City ${i}`,
          skills: ['JavaScript', 'TypeScript'],
          experience: i,
          averageRating: 4.0 + (i * 0.1),
          totalReviews: i * 2
        });
        await expert.save();
      }
    });

    it('should find experts with optimization', async () => {
      const result = await DatabaseOptimizationService.findExpertsOptimized({
        page: 1,
        limit: 10
      });

      expect(result).toHaveProperty('experts');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('totalPages');
      expect(Array.isArray(result.experts)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter experts by specialties', async () => {
      const result = await DatabaseOptimizationService.findExpertsOptimized({
        specialties: ['Testing'],
        page: 1,
        limit: 10
      });

      expect(result.experts.length).toBeGreaterThan(0);
      result.experts.forEach((expert: any) => {
        expect(expert.specialties).toContain('Testing');
      });
    });

    it('should filter experts by hourly rate range', async () => {
      const result = await DatabaseOptimizationService.findExpertsOptimized({
        minRate: 100,
        maxRate: 120,
        page: 1,
        limit: 10
      });

      result.experts.forEach((expert: any) => {
        expect(expert.hourlyRate).toBeGreaterThanOrEqual(100);
        expect(expert.hourlyRate).toBeLessThanOrEqual(120);
      });
    });

    it('should search experts by text', async () => {
      const result = await DatabaseOptimizationService.findExpertsOptimized({
        search: 'Expert',
        page: 1,
        limit: 10
      });

      expect(result.experts.length).toBeGreaterThan(0);
    });
  });

  describe('NotificationService', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = new UserModel({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      });
      await testUser.save();
    });

    it('should create a notification', async () => {
      const notificationData = {
        recipient: testUser._id,
        type: 'message' as const,
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'medium' as const
      };

      const notification = await NotificationService.createNotification(notificationData);

      expect(notification).toHaveProperty('_id');
      expect(notification.recipient.toString()).toBe(testUser._id.toString());
      expect(notification.type).toBe('message');
      expect(notification.title).toBe('Test Notification');
      expect(notification.read).toBe(false);
    });

    it('should get user notifications', async () => {
      // Create test notifications
      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'Notification 1',
        message: 'Message 1',
        priority: 'high'
      });

      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'project_update',
        title: 'Notification 2',
        message: 'Message 2',
        priority: 'low'
      });

      const notifications = await NotificationService.getUserNotifications(testUser._id, {
        page: 1,
        limit: 10
      });

      expect(notifications).toHaveProperty('notifications');
      expect(notifications).toHaveProperty('total');
      expect(notifications.notifications).toHaveLength(2);
      expect(notifications.total).toBe(2);
    });

    it('should mark notifications as read', async () => {
      const notification = await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'Test Notification',
        message: 'Test message',
        priority: 'medium'
      });

      expect(notification.read).toBe(false);

      await NotificationService.markAsRead([notification._id.toString()], testUser._id);

      const updatedNotification = await NotificationModel.findById(notification._id);
      expect(updatedNotification?.read).toBe(true);
    });

    it('should get unread count', async () => {
      // Create multiple notifications
      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'Unread 1',
        message: 'Message 1',
        priority: 'medium'
      });

      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'Unread 2',
        message: 'Message 2',
        priority: 'medium'
      });

      const count = await NotificationService.getUnreadCount(testUser._id);
      expect(count).toBe(2);
    });

    it('should filter notifications by type', async () => {
      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'Message Notification',
        message: 'Message content',
        priority: 'medium'
      });

      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'project_update',
        title: 'Project Notification',
        message: 'Project content',
        priority: 'medium'
      });

      const messageNotifications = await NotificationService.getUserNotifications(testUser._id, {
        page: 1,
        limit: 10,
        type: 'message'
      });

      expect(messageNotifications.notifications).toHaveLength(1);
      expect(messageNotifications.notifications[0].type).toBe('message');
    });

    it('should filter notifications by priority', async () => {
      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'High Priority',
        message: 'High priority message',
        priority: 'high'
      });

      await NotificationService.createNotification({
        recipient: testUser._id,
        type: 'message',
        title: 'Low Priority',
        message: 'Low priority message',
        priority: 'low'
      });

      const highPriorityNotifications = await NotificationService.getUserNotifications(testUser._id, {
        page: 1,
        limit: 10,
        priority: 'high'
      });

      expect(highPriorityNotifications.notifications).toHaveLength(1);
      expect(highPriorityNotifications.notifications[0].priority).toBe('high');
    });
  });
});
