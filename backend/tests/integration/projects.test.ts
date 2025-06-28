import request from 'supertest';
import express from 'express';
import { createTestUser, createTestExpert, createTestProject, generateTestToken } from '../setup';
import projectRoutes from '../../src/routes/projects';
import { authenticate } from '../../src/middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use(authenticate);
app.use('/projects', projectRoutes);

describe('Projects Integration Tests', () => {
  let client: any;
  let expert: any;
  let expertUser: any;
  let clientToken: string;
  let expertToken: string;

  beforeEach(async () => {
    client = await createTestUser({
      email: 'client@example.com',
      role: 'client'
    });
    
    const expertData = await createTestExpert({
      email: 'expert@example.com',
      role: 'expert'
    });
    expertUser = expertData.user;
    expert = expertData.expert;

    clientToken = generateTestToken(client._id.toString());
    expertToken = generateTestToken(expertUser._id.toString());
  });

  describe('POST /projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        title: 'Test Automation Project',
        description: 'Need help with n8n automation setup',
        budget: { total: 2000, currency: 'USD' },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        expertId: expert._id.toString()
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(projectData.title);
      expect(response.body.data.project.clientId).toBe(client._id.toString());
      expect(response.body.data.project.expertId).toBe(expert._id.toString());
      expect(response.body.data.project.status).toBe('planning');
    });

    it('should reject project creation with invalid expert ID', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test description',
        budget: { total: 1000, currency: 'USD' },
        startDate: new Date().toISOString(),
        expertId: '507f1f77bcf86cd799439011' // Non-existent expert ID
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(projectData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Expert not found');
    });

    it('should reject project creation with missing required fields', async () => {
      const projectData = {
        title: 'Test Project',
        // Missing description, budget, startDate, expertId
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject project creation by expert role', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test description',
        budget: { total: 1000, currency: 'USD' },
        startDate: new Date().toISOString(),
        expertId: expert._id.toString()
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(projectData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only clients can create projects');
    });
  });

  describe('GET /projects', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await createTestProject(
        client._id.toString(),
        expert._id.toString(),
        { title: 'Test Project for Listing' }
      );
    });

    it('should get projects for client', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.projects[0].title).toBe('Test Project for Listing');
      expect(response.body.data.projects[0].clientId).toBe(client._id.toString());
    });

    it('should get projects for expert', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.projects[0].expertId).toBe(expert._id.toString());
    });

    it('should filter projects by status', async () => {
      await createTestProject(
        client._id.toString(),
        expert._id.toString(),
        { title: 'Completed Project', status: 'completed' }
      );

      const response = await request(app)
        .get('/projects?status=completed')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.projects[0].status).toBe('completed');
    });

    it('should support pagination', async () => {
      // Create multiple projects
      for (let i = 0; i < 5; i++) {
        await createTestProject(
          client._id.toString(),
          expert._id.toString(),
          { title: `Project ${i}` }
        );
      }

      const response = await request(app)
        .get('/projects?page=1&limit=3')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects.length).toBeLessThanOrEqual(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(3);
    });
  });

  describe('GET /projects/:id', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await createTestProject(
        client._id.toString(),
        expert._id.toString()
      );
    });

    it('should get project details for client', async () => {
      const response = await request(app)
        .get(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project._id).toBe(testProject._id.toString());
      expect(response.body.data.project.clientId).toBe(client._id.toString());
    });

    it('should get project details for expert', async () => {
      const response = await request(app)
        .get(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project._id).toBe(testProject._id.toString());
      expect(response.body.data.project.expertId).toBe(expert._id.toString());
    });

    it('should reject access to project by unauthorized user', async () => {
      const otherUser = await createTestUser({
        email: 'other@example.com',
        role: 'client'
      });
      const otherToken = generateTestToken(otherUser._id.toString());

      const response = await request(app)
        .get(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/projects/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /projects/:id', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await createTestProject(
        client._id.toString(),
        expert._id.toString()
      );
    });

    it('should update project by client', async () => {
      const updateData = {
        title: 'Updated Project Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(updateData.title);
      expect(response.body.data.project.description).toBe(updateData.description);
    });

    it('should update project status by expert', async () => {
      const updateData = {
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.status).toBe('in-progress');
    });

    it('should reject update by unauthorized user', async () => {
      const otherUser = await createTestUser({
        email: 'other@example.com',
        role: 'client'
      });
      const otherToken = generateTestToken(otherUser._id.toString());

      const response = await request(app)
        .put(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /projects/:id/progress', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await createTestProject(
        client._id.toString(),
        expert._id.toString(),
        { status: 'in_progress' }
      );
    });

    it('should update project progress by expert', async () => {
      const response = await request(app)
        .put(`/projects/${testProject._id}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ progress: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.progress).toBe(50);
    });

    it('should reject progress update by client', async () => {
      const response = await request(app)
        .put(`/projects/${testProject._id}/progress`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ progress: 50 })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only experts can update progress');
    });

    it('should validate progress value range', async () => {
      const response = await request(app)
        .put(`/projects/${testProject._id}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ progress: 150 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('between 0 and 100');
    });
  });

  describe('Project Lifecycle Integration', () => {
    it('should complete full project creation -> acceptance -> progress -> completion flow', async () => {
      // 1. Client creates project
      const projectData = {
        title: 'Full Lifecycle Project',
        description: 'Testing complete project flow',
        budget: { total: 3000, currency: 'USD' },
        startDate: new Date().toISOString(),
        expertId: expert._id.toString()
      };

      const createResponse = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(projectData)
        .expect(201);

      const projectId = createResponse.body.data.project._id;

      // 2. Expert accepts project
      await request(app)
        .put(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ status: 'in-progress' })
        .expect(200);

      // 3. Expert updates progress
      await request(app)
        .put(`/projects/${projectId}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ progress: 25 })
        .expect(200);

      await request(app)
        .put(`/projects/${projectId}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ progress: 75 })
        .expect(200);

      // 4. Expert completes project
      await request(app)
        .put(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ status: 'completed', progress: 100 })
        .expect(200);

      // 5. Verify final state
      const finalResponse = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(finalResponse.body.data.project.status).toBe('completed');
      expect(finalResponse.body.data.project.progress).toBe(100);
    });
  });
});
