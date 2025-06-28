import request from 'supertest';
import express from 'express';
import { createTestUser, generateTestToken } from '../setup';
import authRoutes from '../../src/routes/auth';
import { authenticate } from '../../src/middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Authentication Integration Tests', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'client'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should reject duplicate email registration', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'login@example.com',
        password: 'password123'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /auth/me', () => {
    let testUser: any;
    let authToken: string;

    beforeEach(async () => {
      testUser = await createTestUser();
      authToken = generateTestToken(testUser._id.toString());
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /auth/change-password', () => {
    let testUser: any;
    let authToken: string;

    beforeEach(async () => {
      testUser = await createTestUser();
      authToken = generateTestToken(testUser._id.toString());
    });

    it('should change password with valid current password', async () => {
      const response = await request(app)
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    it('should reject password change with invalid current password', async () => {
      const response = await request(app)
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('current password');
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full registration -> login -> profile access flow', async () => {
      // 1. Register
      const userData = {
        email: 'flow@example.com',
        password: 'password123',
        firstName: 'Flow',
        lastName: 'Test',
        role: 'client'
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const { token: registerToken } = registerResponse.body.data;

      // 2. Access profile with registration token
      const profileResponse = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${registerToken}`)
        .expect(200);

      expect(profileResponse.body.data.user.email).toBe(userData.email);

      // 3. Login with credentials
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const { token: loginToken } = loginResponse.body.data;

      // 4. Access profile with login token
      const profileResponse2 = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(profileResponse2.body.data.user.email).toBe(userData.email);

      // 5. Change password
      await request(app)
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({
          currentPassword: userData.password,
          newPassword: 'newpassword123'
        })
        .expect(200);

      // 6. Login with new password
      const newLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'newpassword123'
        })
        .expect(200);

      expect(newLoginResponse.body.data.token).toBeDefined();
    });
  });
});
