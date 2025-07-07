import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import expertsRoutes from '../../src/routes/experts';
import { UserModel } from '../../src/models/User';
import { ExpertModel } from '../../src/models/Expert';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/config';

describe('Experts Routes Unit Tests', () => {
  let app: express.Application;
  let mongoServer: MongoMemoryServer;
  let expertToken: string;
  let clientToken: string;
  let expertUser: any;
  let clientUser: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/experts', expertsRoutes);
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
    expertUser = new UserModel({
      email: 'expert@example.com',
      password: 'password123',
      firstName: 'Expert',
      lastName: 'User',
      role: 'expert'
    });
    await expertUser.save();

    clientUser = new UserModel({
      email: 'client@example.com',
      password: 'password123',
      firstName: 'Client',
      lastName: 'User',
      role: 'client'
    });
    await clientUser.save();

    // Generate tokens
    expertToken = jwt.sign(
      { userId: expertUser._id, role: expertUser.role },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn }
    );

    clientToken = jwt.sign(
      { userId: clientUser._id, role: clientUser.role },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn }
    );
  });

  describe('GET /experts', () => {
    beforeEach(async () => {
      // Create test expert profiles
      const expert1 = new ExpertModel({
        user: expertUser._id,
        title: 'E-commerce Automation Expert',
        bio: 'Specializing in e-commerce automation',
        specialties: ['E-commerce', 'Automation'],
        hourlyRate: 100,
        location: 'San Francisco, CA',
        skills: ['Shopify', 'WooCommerce'],
        experience: 5,
        portfolio: [],
        testimonials: [],
        averageRating: 4.8,
        totalReviews: 10
      });
      await expert1.save();

      const expert2 = new ExpertModel({
        user: clientUser._id, // Different user
        title: 'Marketing Automation Specialist',
        bio: 'Expert in marketing automation',
        specialties: ['Marketing', 'CRM'],
        hourlyRate: 80,
        location: 'New York, NY',
        skills: ['HubSpot', 'Salesforce'],
        experience: 3,
        portfolio: [],
        testimonials: [],
        averageRating: 4.5,
        totalReviews: 8
      });
      await expert2.save();
    });

    it('should return all experts', async () => {
      const response = await request(app)
        .get('/experts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter experts by specialty', async () => {
      const response = await request(app)
        .get('/experts?specialties=E-commerce')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(1);
      expect(response.body.data.experts[0].specialties).toContain('E-commerce');
    });

    it('should filter experts by hourly rate range', async () => {
      const response = await request(app)
        .get('/experts?minRate=90&maxRate=120')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(1);
      expect(response.body.data.experts[0].hourlyRate).toBe(100);
    });

    it('should search experts by title', async () => {
      const response = await request(app)
        .get('/experts?search=E-commerce')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(1);
      expect(response.body.data.experts[0].title).toContain('E-commerce');
    });

    it('should return empty array when no experts match filters', async () => {
      const response = await request(app)
        .get('/experts?specialties=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(0);
      expect(response.body.message).toBe('No experts found matching your criteria');
    });
  });

  describe('GET /experts/:id', () => {
    let expertProfile: any;

    beforeEach(async () => {
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
    });

    it('should return expert profile by ID', async () => {
      const response = await request(app)
        .get(`/experts/${expertProfile._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert.title).toBe('Test Expert');
      expect(response.body.data.expert.user.email).toBe('expert@example.com');
    });

    it('should return 404 for non-existent expert', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/experts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Expert not found');
    });

    it('should return 400 for invalid expert ID', async () => {
      const response = await request(app)
        .get('/experts/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid expert ID');
    });
  });

  describe('POST /experts/profile', () => {
    it('should create expert profile for expert user', async () => {
      const profileData = {
        title: 'New Expert',
        bio: 'Expert in automation',
        specialties: ['Automation', 'Testing'],
        hourlyRate: 75,
        location: 'Remote',
        skills: ['JavaScript', 'Python'],
        experience: 3
      };

      const response = await request(app)
        .post('/experts/profile')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert.title).toBe(profileData.title);
      expect(response.body.data.expert.user).toBe(expertUser._id.toString());
    });

    it('should reject profile creation for client user', async () => {
      const profileData = {
        title: 'Should Not Work',
        bio: 'This should fail',
        specialties: ['Testing'],
        hourlyRate: 50,
        location: 'Nowhere',
        skills: ['None'],
        experience: 0
      };

      const response = await request(app)
        .post('/experts/profile')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(profileData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only users with expert role');
    });

    it('should reject profile creation without authentication', async () => {
      const profileData = {
        title: 'Unauthorized',
        bio: 'No token',
        specialties: ['Testing'],
        hourlyRate: 50,
        location: 'Nowhere',
        skills: ['None'],
        experience: 0
      };

      const response = await request(app)
        .post('/experts/profile')
        .send(profileData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should reject duplicate expert profile creation', async () => {
      const profileData = {
        title: 'First Profile',
        bio: 'First attempt',
        specialties: ['Testing'],
        hourlyRate: 50,
        location: 'Test City',
        skills: ['Jest'],
        experience: 1
      };

      // Create first profile
      await request(app)
        .post('/experts/profile')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(profileData)
        .expect(201);

      // Try to create second profile
      const response = await request(app)
        .post('/experts/profile')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(profileData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Expert profile already exists');
    });
  });

  describe('GET /experts/me/profile', () => {
    let expertProfile: any;

    beforeEach(async () => {
      expertProfile = new ExpertModel({
        user: expertUser._id,
        title: 'My Expert Profile',
        bio: 'My bio',
        specialties: ['Testing'],
        hourlyRate: 100,
        location: 'My City',
        skills: ['Jest'],
        experience: 2,
        portfolio: [],
        testimonials: [],
        averageRating: 4.0,
        totalReviews: 5
      });
      await expertProfile.save();
    });

    it('should return current user expert profile', async () => {
      const response = await request(app)
        .get('/experts/me/profile')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert.title).toBe('My Expert Profile');
      expect(response.body.data.expert.user).toBe(expertUser._id.toString());
    });

    it('should return 404 if expert profile does not exist', async () => {
      // Delete the expert profile
      await ExpertModel.deleteOne({ user: expertUser._id });

      const response = await request(app)
        .get('/experts/me/profile')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Expert profile not found');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/experts/me/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });
});
