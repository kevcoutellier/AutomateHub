import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../src/middleware/auth';
import { handleValidationErrors, validateUserRegistration } from '../../src/middleware/validation';
import { errorHandler } from '../../src/middleware/errorHandler';
import { config } from '../../src/config/config';

describe('Middleware Unit Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Authentication Middleware', () => {
    it('should authenticate valid JWT token', async () => {
      const userId = 'user123';
      const role = 'client';
      const token = jwt.sign(
        { userId, role },
        config.jwt.secret as string,
        { expiresIn: '1h' }
      );

      app.get('/protected', authenticate, (req: any, res: Response) => {
        res.json({
          success: true,
          user: req.user
        });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe(userId);
      expect(response.body.user.role).toBe(role);
    });

    it('should reject request without token', async () => {
      app.get('/protected', authenticate, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      app.get('/protected', authenticate, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should reject expired token', async () => {
      const token = jwt.sign(
        { userId: 'user123', role: 'client' },
        config.jwt.secret as string,
        { expiresIn: '-1h' } // Expired token
      );

      app.get('/protected', authenticate, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should handle malformed Authorization header', async () => {
      app.get('/protected', authenticate, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('Validation Middleware', () => {
    it('should validate user registration data successfully', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true, data: req.body });
      });

      const validData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      };

      const response = await request(app)
        .post('/register')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should reject invalid email format', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('valid email address');
    });

    it('should reject short password', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const invalidData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password must be at least 6 characters');
    });

    it('should reject missing required fields', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const invalidData = {
        email: 'test@example.com',
        password: 'password123'
        // Missing firstName and lastName
      };

      const response = await request(app)
        .post('/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should reject invalid role', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Role must be either client or expert');
    });

    it('should normalize email address', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true, data: req.body });
      });

      const dataWithUppercaseEmail = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      };

      const response = await request(app)
        .post('/register')
        .send(dataWithUppercaseEmail)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should trim whitespace from names', async () => {
      app.post('/register', validateUserRegistration, (req: Request, res: Response) => {
        res.json({ success: true, data: req.body });
      });

      const dataWithWhitespace = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '  Test  ',
        lastName: '  User  ',
        role: 'client'
      };

      const response = await request(app)
        .post('/register')
        .send(dataWithWhitespace)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Test');
      expect(response.body.data.lastName).toBe('User');
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle custom errors with status codes', async () => {
      app.get('/error', (req: Request, res: Response, next: NextFunction) => {
        const error = new Error('Custom error message') as any;
        error.statusCode = 400;
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Custom error message');
    });

    it('should handle errors without status codes (default to 500)', async () => {
      app.get('/error', (req: Request, res: Response, next: NextFunction) => {
        const error = new Error('Internal error');
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal error');
    });

    it('should handle MongoDB validation errors', async () => {
      app.get('/mongo-error', (req: Request, res: Response, next: NextFunction) => {
        const error = new Error('Validation failed') as any;
        error.name = 'ValidationError';
        error.errors = {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' }
        };
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/mongo-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should handle MongoDB duplicate key errors', async () => {
      app.get('/duplicate-error', (req: Request, res: Response, next: NextFunction) => {
        const error = new Error('Duplicate key error') as any;
        error.name = 'MongoError';
        error.code = 11000;
        error.keyPattern = { email: 1 };
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/duplicate-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should handle JWT errors', async () => {
      app.get('/jwt-error', (req: Request, res: Response, next: NextFunction) => {
        const error = new Error('jwt malformed') as any;
        error.name = 'JsonWebTokenError';
        next(error);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/jwt-error')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should handle unexpected errors gracefully', async () => {
      app.get('/unexpected-error', (req: Request, res: Response, next: NextFunction) => {
        // Simulate an unexpected error
        throw new Error('Something went wrong');
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/unexpected-error')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Something went wrong');
    });
  });
});
