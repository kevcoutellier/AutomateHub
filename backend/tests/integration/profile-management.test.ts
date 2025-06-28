import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDB, teardownTestDB, createTestUser } from '../setup';

describe('Profile Management Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    const user = await createTestUser({ role: 'client' });
    userId = user.userId;
    authToken = user.token;
  });

  describe('Profile Settings', () => {
    it('should update basic profile information', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Updated',
        phone: '+33123456789',
        location: 'Paris, France',
        bio: 'Updated bio information'
      };

      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject(updateData);
    });

    it('should update professional information', async () => {
      const professionalData = {
        company: 'Tech Corp',
        jobTitle: 'Senior Developer',
        website: 'https://johndoe.dev'
      };

      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(professionalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject(professionalData);
    });

    it('should handle avatar upload', async () => {
      // TODO: Implement file upload test
      const avatarData = {
        avatar: 'uploaded-file-id-123'
      };

      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(avatarData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.avatar).toBe('uploaded-file-id-123');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        firstName: '', // Empty required field
        email: 'invalid-email' // Invalid email format
      };

      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('Security Settings', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newSecurePassword123!'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password');
    });

    it('should reject incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newSecurePassword123!'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('current password');
    });

    it('should validate new password strength', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: '123' // Too weak
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should handle two-factor authentication toggle', async () => {
      // TODO: Implement 2FA API endpoints
      const response = await request(app)
        .put('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should list active sessions', async () => {
      // TODO: Implement session management API
      const response = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.sessions)).toBe(true);
    });
  });

  describe('Notification Settings', () => {
    it('should update notification preferences', async () => {
      const notificationSettings = {
        email: {
          projectUpdates: true,
          messages: false,
          marketing: false
        },
        push: {
          projectUpdates: true,
          messages: true,
          marketing: false
        },
        frequency: 'daily'
      };

      const response = await request(app)
        .put('/api/users/notification-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationSettings)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toMatchObject(notificationSettings);
    });

    it('should get current notification settings', async () => {
      const response = await request(app)
        .get('/api/users/notification-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toBeDefined();
    });
  });

  describe('Privacy Settings', () => {
    it('should update privacy preferences', async () => {
      const privacySettings = {
        profileVisibility: 'clients',
        showEmail: false,
        showPhone: false,
        allowMessages: true
      };

      const response = await request(app)
        .put('/api/users/privacy-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(privacySettings)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toMatchObject(privacySettings);
    });

    it('should handle data export request', async () => {
      const response = await request(app)
        .post('/api/users/export-data')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.exportId).toBeDefined();
    });

    it('should handle account deletion request', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ confirmPassword: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Profile Completeness', () => {
    it('should calculate profile completion percentage', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profileCompletion).toBeDefined();
      expect(typeof response.body.data.user.profileCompletion).toBe('number');
    });

    it('should suggest profile improvements', async () => {
      const response = await request(app)
        .get('/api/users/profile-suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    });
  });

  describe('Expert Profile Management', () => {
    it('should create expert profile for expert users', async () => {
      // Create expert user
      const expert = await createTestUser({ role: 'expert' });

      const expertProfileData = {
        title: 'Senior Full Stack Developer',
        specialties: ['React', 'Node.js', 'TypeScript'],
        industries: ['Technology', 'E-commerce'],
        experience: 5,
        hourlyRate: 75,
        availability: 'available',
        portfolio: ['project1', 'project2']
      };

      const response = await request(app)
        .post('/api/experts')
        .set('Authorization', `Bearer ${expert.token}`)
        .send(expertProfileData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert).toMatchObject(expertProfileData);
    });

    it('should update expert profile', async () => {
      const expert = await createTestUser({ role: 'expert' });

      // Create expert profile first
      await request(app)
        .post('/api/experts')
        .set('Authorization', `Bearer ${expert.token}`)
        .send({
          title: 'Developer',
          specialties: ['JavaScript'],
          hourlyRate: 50
        });

      const updateData = {
        title: 'Senior Developer',
        hourlyRate: 75,
        specialties: ['JavaScript', 'TypeScript', 'React']
      };

      const response = await request(app)
        .put('/api/experts/me/profile')
        .set('Authorization', `Bearer ${expert.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert).toMatchObject(updateData);
    });

    it('should prevent non-experts from creating expert profiles', async () => {
      const expertProfileData = {
        title: 'Developer',
        specialties: ['JavaScript'],
        hourlyRate: 50
      };

      const response = await request(app)
        .post('/api/experts')
        .set('Authorization', `Bearer ${authToken}`) // Client token
        .send(expertProfileData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expert role');
    });
  });
});
