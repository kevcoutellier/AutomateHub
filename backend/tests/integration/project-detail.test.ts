import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDB, teardownTestDB, createTestUser, createTestProject } from '../setup';

describe('Project Detail Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let expertId: string;
  let projectId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create test users
    const client = await createTestUser({ role: 'client' });
    const expert = await createTestUser({ role: 'expert' });
    
    userId = client.userId;
    expertId = expert.userId;
    authToken = client.token;

    // Create test project
    const project = await createTestProject({
      clientId: userId,
      expertId: expertId,
      title: 'Test Project for Detail View',
      description: 'Detailed project description',
      budget: { total: 5000, currency: 'EUR' }
    });
    projectId = project.id;
  });

  describe('Project Detail Page', () => {
    it('should load project details successfully', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toMatchObject({
        id: projectId,
        title: 'Test Project for Detail View',
        description: 'Detailed project description',
        budget: { total: 5000, currency: 'EUR' }
      });
    });

    it('should load project milestones', async () => {
      // Create test milestone
      await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Phase 1: Planning',
          description: 'Initial planning phase',
          dueDate: '2024-03-01',
          deliverables: ['Project plan', 'Requirements document']
        })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.milestones).toHaveLength(1);
      expect(response.body.data.milestones[0]).toMatchObject({
        title: 'Phase 1: Planning',
        description: 'Initial planning phase',
        deliverables: ['Project plan', 'Requirements document']
      });
    });

    it('should load project messages', async () => {
      // Send test message
      await request(app)
        .post(`/api/projects/${projectId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Hello, this is a test message',
          messageType: 'text'
        })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${projectId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0]).toMatchObject({
        content: 'Hello, this is a test message',
        messageType: 'text'
      });
    });

    it('should update project progress', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 25 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.progress).toBe(25);
    });

    it('should handle milestone creation', async () => {
      const milestoneData = {
        title: 'Development Phase',
        description: 'Core development work',
        dueDate: '2024-04-15',
        deliverables: ['MVP', 'Testing suite']
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(milestoneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.milestone).toMatchObject(milestoneData);
    });

    it('should handle milestone updates', async () => {
      // Create milestone first
      const createResponse = await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Milestone',
          description: 'Test description',
          dueDate: '2024-03-01'
        })
        .expect(201);

      const milestoneId = createResponse.body.data.milestone.id;

      // Update milestone status
      const response = await request(app)
        .put(`/api/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.milestone.status).toBe('completed');
    });

    it('should handle file attachments in messages', async () => {
      // TODO: Implement file upload test
      const messageData = {
        content: 'Here is the document you requested',
        attachments: ['file-id-123']
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message.attachments).toEqual(['file-id-123']);
    });
  });

  describe('Project Actions', () => {
    it('should update project status', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in-progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.status).toBe('in-progress');
    });

    it('should update project details', async () => {
      const updateData = {
        title: 'Updated Project Title',
        description: 'Updated description',
        budget: { total: 6000, currency: 'EUR' }
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toMatchObject(updateData);
    });

    it('should handle project deletion', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Real-time Messaging', () => {
    it('should handle real-time message delivery', async () => {
      // TODO: Implement Socket.IO testing
      // This would test real-time message delivery between users
    });

    it('should handle typing indicators', async () => {
      // TODO: Implement typing indicator tests
    });

    it('should handle message read receipts', async () => {
      // TODO: Implement read receipt tests
    });
  });

  describe('Access Control', () => {
    it('should restrict access to project members only', async () => {
      // Create another user not involved in the project
      const outsider = await createTestUser({ role: 'client' });

      await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .expect(403);
    });

    it('should allow experts to update progress', async () => {
      // Login as expert
      const expertResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'expert@test.com',
          password: 'password123'
        });

      const expertToken = expertResponse.body.data.token;

      const response = await request(app)
        .put(`/api/projects/${projectId}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ progress: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should restrict milestone creation to project members', async () => {
      const outsider = await createTestUser({ role: 'expert' });

      await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({
          title: 'Unauthorized Milestone',
          dueDate: '2024-03-01'
        })
        .expect(403);
    });
  });
});
