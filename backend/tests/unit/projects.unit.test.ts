import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import projectsRoutes from '../../src/routes/projects';
import { UserModel } from '../../src/models/User';
import { ProjectModel } from '../../src/models/Project';
import { ExpertModel } from '../../src/models/Expert';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/config';

describe('Projects Routes Unit Tests', () => {
  let app: express.Application;
  let mongoServer: MongoMemoryServer;
  let clientToken: string;
  let expertToken: string;
  let clientUser: any;
  let expertUser: any;
  let expertProfile: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/projects', projectsRoutes);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Create test users
    clientUser = new UserModel({
      email: 'client@example.com',
      password: 'password123',
      firstName: 'Client',
      lastName: 'User',
      role: 'client'
    });
    await clientUser.save();

    expertUser = new UserModel({
      email: 'expert@example.com',
      password: 'password123',
      firstName: 'Expert',
      lastName: 'User',
      role: 'expert'
    });
    await expertUser.save();

    // Create expert profile
    expertProfile = new ExpertModel({
      user: expertUser._id,
      title: 'Test Expert',
      bio: 'Test bio',
      specialties: ['Testing'],
      hourlyRate: 100,
      location: 'Test City',
      skills: ['Jest'],
      experience: 2,
      portfolio: [],
      testimonials: [],
      averageRating: 4.0,
      totalReviews: 5
    });
    await expertProfile.save();

    // Generate tokens
    clientToken = jwt.sign(
      { userId: clientUser._id, role: clientUser.role },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn as string }
    );

    expertToken = jwt.sign(
      { userId: expertUser._id, role: expertUser.role },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn as string }
    );
  });

  describe('POST /projects', () => {
    it('should create a new project for client', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project description',
        category: 'E-commerce',
        budget: 5000,
        timeline: 'Within 1 month',
        requirements: ['Requirement 1', 'Requirement 2']
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(projectData.title);
      expect(response.body.data.project.client).toBe(clientUser._id.toString());
      expect(response.body.data.project.status).toBe('planning');
    });

    it('should reject project creation for expert user', async () => {
      const projectData = {
        title: 'Should Not Work',
        description: 'This should fail',
        category: 'Testing',
        budget: 1000,
        timeline: 'Never',
        requirements: ['Should fail']
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(projectData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only clients can create projects');
    });

    it('should reject project creation without authentication', async () => {
      const projectData = {
        title: 'Unauthorized Project',
        description: 'No token provided',
        category: 'Testing',
        budget: 1000,
        timeline: 'Never',
        requirements: ['Should fail']
      };

      const response = await request(app)
        .post('/projects')
        .send(projectData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should validate required fields', async () => {
      const projectData = {
        // Missing required fields
        description: 'Missing title and other fields'
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /projects', () => {
    let clientProject: any;
    let expertProject: any;

    beforeEach(async () => {
      // Create projects
      clientProject = new ProjectModel({
        title: 'Client Project',
        description: 'Project created by client',
        category: 'E-commerce',
        budget: 5000,
        timeline: 'Within 1 month',
        requirements: ['Req 1'],
        client: clientUser._id,
        status: 'planning'
      });
      await clientProject.save();

      expertProject = new ProjectModel({
        title: 'Expert Project',
        description: 'Project assigned to expert',
        category: 'Marketing',
        budget: 3000,
        timeline: 'Within 2 weeks',
        requirements: ['Req 2'],
        client: clientUser._id,
        expert: expertUser._id,
        status: 'in-progress'
      });
      await expertProject.save();
    });

    it('should return client projects for client user', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(2);
      expect(response.body.data.projects.every((p: any) => p.client === clientUser._id.toString())).toBe(true);
    });

    it('should return expert projects for expert user', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.projects[0].expert).toBe(expertUser._id.toString());
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/projects?status=planning')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.projects[0].status).toBe('planning');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/projects')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('GET /projects/:id', () => {
    let project: any;

    beforeEach(async () => {
      project = new ProjectModel({
        title: 'Test Project Detail',
        description: 'Project for detail testing',
        category: 'Testing',
        budget: 2000,
        timeline: 'Within 1 week',
        requirements: ['Detail req'],
        client: clientUser._id,
        status: 'planning'
      });
      await project.save();
    });

    it('should return project details for client', async () => {
      const response = await request(app)
        .get(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe('Test Project Detail');
      expect(response.body.data.project.client.email).toBe('client@example.com');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Project not found');
    });

    it('should return 403 for unauthorized access', async () => {
      // Create another user who shouldn't have access
      const otherUser = new UserModel({
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User',
        role: 'client'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id, role: otherUser.role },
        config.jwt.secret as string,
        { expiresIn: config.jwt.expiresIn }
      );

      const response = await request(app)
        .get(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('PUT /projects/:id/accept', () => {
    let project: any;

    beforeEach(async () => {
      project = new ProjectModel({
        title: 'Project to Accept',
        description: 'Project for acceptance testing',
        category: 'Testing',
        budget: 2000,
        timeline: 'Within 1 week',
        requirements: ['Accept req'],
        client: clientUser._id,
        status: 'planning'
      });
      await project.save();
    });

    it('should allow expert to accept project', async () => {
      const response = await request(app)
        .put(`/projects/${project._id}/accept`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.expert).toBe(expertUser._id.toString());
      expect(response.body.data.project.status).toBe('in-progress');
    });

    it('should reject client trying to accept project', async () => {
      const response = await request(app)
        .put(`/projects/${project._id}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only experts can accept projects');
    });

    it('should reject accepting already accepted project', async () => {
      // First acceptance
      await request(app)
        .put(`/projects/${project._id}/accept`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      // Second acceptance attempt
      const response = await request(app)
        .put(`/projects/${project._id}/accept`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Project is not available for acceptance');
    });
  });

  describe('PUT /projects/:id/progress', () => {
    let project: any;

    beforeEach(async () => {
      project = new ProjectModel({
        title: 'Project for Progress Update',
        description: 'Project for progress testing',
        category: 'Testing',
        budget: 2000,
        timeline: 'Within 1 week',
        requirements: ['Progress req'],
        client: clientUser._id,
        expert: expertUser._id,
        status: 'in-progress'
      });
      await project.save();
    });

    it('should allow expert to update progress', async () => {
      const progressData = {
        progress: 50,
        statusUpdate: 'Half way done'
      };

      const response = await request(app)
        .put(`/projects/${project._id}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(progressData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.progress).toBe(50);
    });

    it('should reject client trying to update progress', async () => {
      const progressData = {
        progress: 25,
        statusUpdate: 'Should not work'
      };

      const response = await request(app)
        .put(`/projects/${project._id}/progress`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(progressData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only experts can update progress');
    });

    it('should validate progress value range', async () => {
      const progressData = {
        progress: 150, // Invalid: > 100
        statusUpdate: 'Invalid progress'
      };

      const response = await request(app)
        .put(`/projects/${project._id}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(progressData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
