import request from 'supertest';
import express from 'express';
import { createTestUser, createTestExpert, generateTestToken } from '../setup';
import expertRoutes from '../../src/routes/experts';
import { authenticate } from '../../src/middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use(authenticate);
app.use('/experts', expertRoutes);

describe('Expert Matching & Recommendations Integration Tests', () => {
  let client: any;
  let expert1: any;
  let expert2: any;
  let expert3: any;
  let expertUser1: any;
  let expertUser2: any;
  let expertUser3: any;
  let clientToken: string;
  let expertToken1: string;

  beforeEach(async () => {
    client = await createTestUser({
      email: 'client@example.com',
      role: 'client'
    });

    // Create multiple experts with different specialties
    const expert1Data = await createTestExpert({
      email: 'expert1@example.com',
      role: 'expert',
      expertData: {
        specialties: ['n8n', 'automation', 'workflow'],
        industries: ['technology', 'finance'],
        hourlyRate: { min: 80, max: 120 },
        availability: 'available',
        experience: 'senior',
        bio: 'Senior n8n automation expert with 5+ years of experience in workflow automation and business process optimization.',
        location: 'New York, USA',
        timezone: 'America/New_York'
      }
    });
    expertUser1 = expert1Data.user;
    expert1 = expert1Data.expert;

    const expert2Data = await createTestExpert({
      email: 'expert2@example.com',
      role: 'expert',
      expertData: {
        specialties: ['n8n', 'api-integration', 'database'],
        industries: ['healthcare', 'technology'],
        hourlyRate: { min: 120, max: 180 },
        availability: 'available',
        experience: 'expert',
        bio: 'Expert in n8n API integrations and database connections with 8+ years of experience in healthcare and technology sectors.',
        location: 'San Francisco, USA',
        timezone: 'America/Los_Angeles'
      }
    });
    expertUser2 = expert2Data.user;
    expert2 = expert2Data.expert;

    const expert3Data = await createTestExpert({
      email: 'expert3@example.com',
      role: 'expert',
      expertData: {
        specialties: ['zapier', 'automation', 'crm'],
        industries: ['marketing', 'sales'],
        hourlyRate: { min: 60, max: 100 },
        availability: 'busy',
        experience: 'intermediate',
        bio: 'Zapier and CRM automation specialist with 3+ years of experience in marketing and sales automation solutions.',
        location: 'London, UK',
        timezone: 'Europe/London'
      }
    });
    expertUser3 = expert3Data.user;
    expert3 = expert3Data.expert;

    clientToken = generateTestToken(client._id.toString());
    expertToken1 = generateTestToken(expertUser1._id.toString());
  });

  describe('GET /experts', () => {
    it('should get all available experts', async () => {
      const response = await request(app)
        .get('/experts')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter experts by specialties', async () => {
      const response = await request(app)
        .get('/experts?specialties=n8n')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
      
      response.body.data.experts.forEach((expert: any) => {
        expect(expert.specialties).toContain('n8n');
      });
    });

    it('should filter experts by multiple specialties', async () => {
      const response = await request(app)
        .get('/experts?specialties=n8n&specialties=automation')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
    });

    it('should filter experts by industries', async () => {
      const response = await request(app)
        .get('/experts?industries=technology')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
      
      response.body.data.experts.forEach((expert: any) => {
        expect(expert.industries).toContain('technology');
      });
    });

    it('should filter experts by availability', async () => {
      const response = await request(app)
        .get('/experts?availability=available')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
      
      response.body.data.experts.forEach((expert: any) => {
        expect(expert.availability).toBe('available');
      });
    });

    it('should filter experts by hourly rate range', async () => {
      const response = await request(app)
        .get('/experts?maxRate=120')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
      
      response.body.data.experts.forEach((expert: any) => {
        expect(expert.hourlyRate.min).toBeLessThanOrEqual(120);
      });
    });

    it('should filter experts by minimum rating', async () => {
      // First, let's add some ratings to experts
      const { ExpertModel } = require('../../src/models/Expert');
      await ExpertModel.findByIdAndUpdate(expert1._id, { 
        averageRating: 4.8,
        totalReviews: 10
      });
      await ExpertModel.findByIdAndUpdate(expert2._id, { 
        averageRating: 4.2,
        totalReviews: 5
      });
      await ExpertModel.findByIdAndUpdate(expert3._id, { 
        averageRating: 3.8,
        totalReviews: 3
      });

      const response = await request(app)
        .get('/experts?minRating=4.5')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(1);
      expect(response.body.data.experts[0].averageRating).toBeGreaterThanOrEqual(4.5);
    });

    it('should search experts by text query', async () => {
      const response = await request(app)
        .get('/experts?search=API integration')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts.length).toBeGreaterThan(0);
      
      // Should find expert2 who has "API integrations" in bio
      const foundExpert = response.body.data.experts.find(
        (expert: any) => expert._id === expert2._id.toString()
      );
      expect(foundExpert).toBeDefined();
    });

    it('should filter experts by location', async () => {
      const response = await request(app)
        .get('/experts?location=USA')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(2);
      
      response.body.data.experts.forEach((expert: any) => {
        expect(expert.location).toContain('USA');
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/experts?specialties=n8n&availability=available&maxRate=120')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(1);
      
      const expert = response.body.data.experts[0];
      expect(expert.specialties).toContain('n8n');
      expect(expert.availability).toBe('available');
      expect(expert.hourlyRate.min).toBeLessThanOrEqual(120);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/experts?page=1&limit=2')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should sort experts by relevance/rating by default', async () => {
      // Add ratings to test sorting
      const { ExpertModel } = require('../../src/models/Expert');
      await ExpertModel.findByIdAndUpdate(expert1._id, { 
        averageRating: 4.8,
        totalReviews: 10
      });
      await ExpertModel.findByIdAndUpdate(expert2._id, { 
        averageRating: 4.2,
        totalReviews: 5
      });
      await ExpertModel.findByIdAndUpdate(expert3._id, { 
        averageRating: 3.8,
        totalReviews: 3
      });

      const response = await request(app)
        .get('/experts')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const experts = response.body.data.experts;
      
      // Should be sorted by rating (highest first)
      for (let i = 0; i < experts.length - 1; i++) {
        const currentRating = experts[i].rating?.average || 0;
        const nextRating = experts[i + 1].rating?.average || 0;
        expect(currentRating).toBeGreaterThanOrEqual(nextRating);
      }
    });
  });

  describe('GET /experts/:id', () => {
    it('should get expert details with reviews', async () => {
      const response = await request(app)
        .get(`/experts/${expert1._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert._id).toBe(expert1._id.toString());
      expect(response.body.data.expert.specialties).toContain('n8n');
      expect(response.body.data.reviews).toBeDefined();
    });

    it('should return 404 for non-existent expert', async () => {
      const response = await request(app)
        .get('/experts/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should include expert statistics', async () => {
      const response = await request(app)
        .get(`/experts/${expert1._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expert.stats).toBeDefined();
      expect(response.body.data.expert.stats.totalProjects).toBeDefined();
      expect(response.body.data.expert.stats.completionRate).toBeDefined();
      expect(response.body.data.expert.stats.avgResponseTime).toBeDefined();
    });
  });

  describe('Expert Profile Management', () => {
    describe('POST /experts', () => {
      it('should create expert profile for authenticated user', async () => {
        const newUser = await createTestUser({
          email: 'newexpert@example.com',
          role: 'expert'
        });
        const newUserToken = generateTestToken(newUser._id.toString());

        const expertData = {
          specialties: ['n8n', 'automation'],
          industries: ['technology'],
          hourlyRate: { amount: 120, currency: 'USD' },
          availability: 'available',
          bio: 'New expert joining the platform',
          experience: 3,
          location: 'Remote'
        };

        const response = await request(app)
          .post('/experts')
          .set('Authorization', `Bearer ${newUserToken}`)
          .send(expertData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.expert.userId).toBe(newUser._id.toString());
        expect(response.body.data.expert.specialties).toEqual(expertData.specialties);
        expect(response.body.data.expert.hourlyRate.amount).toBe(expertData.hourlyRate.amount);
      });

      it('should reject expert profile creation for client role', async () => {
        const expertData = {
          specialties: ['n8n'],
          industries: ['technology'],
          hourlyRate: { amount: 100, currency: 'USD' },
          bio: 'Test bio'
        };

        const response = await request(app)
          .post('/experts')
          .set('Authorization', `Bearer ${clientToken}`)
          .send(expertData)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Only users with expert role');
      });

      it('should reject duplicate expert profile creation', async () => {
        const expertData = {
          specialties: ['n8n'],
          industries: ['technology'],
          hourlyRate: { amount: 100, currency: 'USD' },
          bio: 'Test bio'
        };

        const response = await request(app)
          .post('/experts')
          .set('Authorization', `Bearer ${expertToken1}`)
          .send(expertData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already has an expert profile');
      });
    });

    describe('PUT /experts/:id', () => {
      it('should update expert profile by owner', async () => {
        const updateData = {
          bio: 'Updated bio with more details',
          hourlyRate: { amount: 110, currency: 'USD' },
          availability: 'busy'
        };

        const response = await request(app)
          .put(`/experts/${expert1._id}`)
          .set('Authorization', `Bearer ${expertToken1}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.expert.bio).toBe(updateData.bio);
        expect(response.body.data.expert.hourlyRate.amount).toBe(updateData.hourlyRate.amount);
        expect(response.body.data.expert.availability).toBe(updateData.availability);
      });

      it('should reject update by non-owner', async () => {
        const updateData = {
          bio: 'Unauthorized update'
        };

        const response = await request(app)
          .put(`/experts/${expert1._id}`)
          .set('Authorization', `Bearer ${clientToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('update this expert profile');
      });
    });

    describe('GET /experts/me/profile', () => {
      it('should get own expert profile', async () => {
        const response = await request(app)
          .get('/experts/me/profile')
          .set('Authorization', `Bearer ${expertToken1}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.expert._id).toBe(expert1._id.toString());
        expect(response.body.data.expert.userId).toBe(expertUser1._id.toString());
      });

      it('should return 404 for user without expert profile', async () => {
        const response = await request(app)
          .get('/experts/me/profile')
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Expert profile not found');
      });
    });
  });

  describe('Expert Recommendation Algorithm', () => {
    it('should recommend experts based on project requirements', async () => {
      // This would typically be a separate endpoint for recommendations
      // For now, we'll test the filtering logic that powers recommendations
      
      const projectRequirements = {
        specialties: ['n8n', 'automation'],
        industry: 'technology',
        budget: 2000, // Assuming 20 hours at $100/hour
        urgency: 'medium'
      };

      // Test the filtering that would be used in recommendation algorithm
      const response = await request(app)
        .get(`/experts?specialties=${projectRequirements.specialties.join('&specialties=')}&industries=${projectRequirements.industry}&maxRate=100&availability=available`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(1);
      
      const recommendedExpert = response.body.data.experts[0];
      expect(recommendedExpert.specialties).toEqual(expect.arrayContaining(projectRequirements.specialties));
      expect(recommendedExpert.industries).toContain(projectRequirements.industry);
      expect(recommendedExpert.hourlyRate.amount).toBeLessThanOrEqual(100);
      expect(recommendedExpert.availability).toBe('available');
    });

    it('should handle no matching experts gracefully', async () => {
      const response = await request(app)
        .get('/experts?specialties=blockchain&industries=cryptocurrency&minRating=5.0')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.experts).toHaveLength(0);
      expect(response.body.message).toContain('No experts found');
    });
  });

  describe('Expert Discovery Integration Flow', () => {
    it('should complete full expert discovery workflow', async () => {
      // 1. Client searches for experts with specific requirements
      const searchResponse = await request(app)
        .get('/experts?specialties=n8n&industries=technology&availability=available')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(searchResponse.body.data.experts.length).toBeGreaterThan(0);
      const foundExpert = searchResponse.body.data.experts[0];

      // 2. Client views detailed expert profile
      const detailResponse = await request(app)
        .get(`/experts/${foundExpert._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(detailResponse.body.data.expert._id).toBe(foundExpert._id);
      expect(detailResponse.body.data.expert.specialties).toContain('n8n');

      // 3. Expert updates their availability
      const expertToken = generateTestToken(foundExpert.userId);
      await request(app)
        .put(`/experts/${foundExpert._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ availability: 'busy' })
        .expect(200);

      // 4. Verify expert no longer appears in available search
      const updatedSearchResponse = await request(app)
        .get('/experts?specialties=n8n&industries=technology&availability=available')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      const stillAvailableExperts = updatedSearchResponse.body.data.experts;
      const updatedExpert = stillAvailableExperts.find((e: any) => e._id === foundExpert._id);
      expect(updatedExpert).toBeUndefined();

      // 5. But expert still appears in general search
      const generalSearchResponse = await request(app)
        .get('/experts?specialties=n8n&industries=technology')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      const allExperts = generalSearchResponse.body.data.experts;
      const expertInGeneral = allExperts.find((e: any) => e._id === foundExpert._id);
      expect(expertInGeneral).toBeDefined();
      expect(expertInGeneral.availability).toBe('busy');
    });
  });
});
