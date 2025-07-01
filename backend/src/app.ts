import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestIdMiddleware } from './utils/apiResponse';
import { versioningMiddleware, legacyRedirectMiddleware } from './middleware/versioning';
import { globalRateLimit, authRateLimit } from './middleware/rateLimiting';

// Import routes
import authRoutes from './routes/auth';
import expertRoutes from './routes/experts';
import projectRoutes from './routes/projects';
import reviewRoutes from './routes/reviews';
import assessmentRoutes from './routes/assessment';
import conversationRoutes from './routes/conversations';
import analyticsRoutes from './routes/analytics';
import fileRoutes from './routes/files';
import adminRoutes from './routes/admin';
import reportRoutes from './routes/reports';
import notificationRoutes from './routes/notifications';

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request ID middleware for tracking
app.use(requestIdMiddleware);

// Legacy redirect middleware (redirect /api/* to /api/v1/*)
app.use(legacyRedirectMiddleware);

// API versioning middleware
app.use(versioningMiddleware);

// Global rate limiting
app.use(globalRateLimit);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.server.env !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AutomateHub API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0',
    apiVersion: res.locals.apiVersion || 'v1'
  });
});

// API routes with versioning
app.use('/api/v1/auth', authRateLimit, authRoutes);
app.use('/api/v1/experts', expertRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/assessment', assessmentRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'AutomateHub API',
    version: '1.0.0',
    description: 'Premium n8n Expertise Marketplace API',
    documentation: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password with token',
        'PUT /api/auth/change-password': 'Change password (authenticated)',
        'POST /api/auth/verify-email': 'Verify email address',
        'POST /api/auth/resend-verification': 'Resend verification email'
      },
      experts: {
        'GET /api/experts': 'Get all experts with filtering',
        'GET /api/experts/:id': 'Get expert by ID',
        'POST /api/experts': 'Create expert profile (expert role)',
        'PUT /api/experts/:id': 'Update expert profile',
        'GET /api/experts/me/profile': 'Get current user expert profile',
        'GET /api/experts/me/stats': 'Get expert statistics',
        'GET /api/experts/search': 'Search experts by skills/location'
      },
      projects: {
        'GET /api/projects': 'Get projects with filtering',
        'GET /api/projects/:id': 'Get project by ID',
        'POST /api/projects': 'Create new project (client role)',
        'PUT /api/projects/:id': 'Update project',
        'DELETE /api/projects/:id': 'Delete project',
        'POST /api/projects/:id/accept': 'Accept project (expert)',
        'PUT /api/projects/:id/progress': 'Update project progress',
        'PUT /api/projects/:id/complete': 'Mark project as completed'
      },
      reviews: {
        'GET /api/reviews': 'Get all reviews',
        'GET /api/reviews/:id': 'Get review by ID',
        'POST /api/reviews': 'Create new review',
        'PUT /api/reviews/:id': 'Update review',
        'DELETE /api/reviews/:id': 'Delete review'
      },
      conversations: {
        'GET /api/conversations': 'Get user conversations',
        'GET /api/conversations/:id': 'Get conversation by ID',
        'POST /api/conversations': 'Create new conversation',
        'GET /api/conversations/:id/messages': 'Get conversation messages',
        'POST /api/conversations/:id/messages': 'Send message'
      },
      files: {
        'POST /api/files/upload': 'Upload file to S3',
        'GET /api/files/:id': 'Get file metadata',
        'GET /api/files/:id/download': 'Download file',
        'DELETE /api/files/:id': 'Delete file'
      },
      assessment: {
        'POST /api/assessment': 'Submit assessment (client role)',
        'GET /api/assessment/my-assessments': 'Get user assessments',
        'GET /api/assessment/:id': 'Get assessment by ID',
        'GET /api/assessment/:id/results': 'Get detailed assessment results',
        'DELETE /api/assessment/:id': 'Delete assessment'
      },
      analytics: {
        'GET /api/analytics': 'Get platform analytics with time range',
        'GET /api/analytics/platform': 'Get platform-specific metrics',
        'GET /api/analytics/expert': 'Get all experts analytics overview',
        'GET /api/analytics/expert/:id': 'Get specific expert analytics'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (admin only)',
        'GET /api/admin/users/:id': 'Get user details (admin only)',
        'PUT /api/admin/users/:id/suspend': 'Suspend user (admin only)',
        'PUT /api/admin/users/:id/activate': 'Activate user (admin only)',
        'PUT /api/admin/users/:id/role': 'Update user role (admin only)',
        'GET /api/admin/projects': 'Get all projects (admin only)',
        'PUT /api/admin/projects/:id/suspend': 'Suspend project (admin only)',
        'GET /api/admin/reports': 'Get all reports (admin only)',
        'GET /api/admin/reports/:id': 'Get report details (admin only)',
        'PUT /api/admin/reports/:id': 'Update report status (admin only)',
        'GET /api/admin/dashboard/stats': 'Get admin dashboard stats (admin only)',
        'GET /api/admin/analytics/user-growth': 'Get user growth analytics (admin only)',
        'GET /api/admin/settings': 'Get system settings (admin only)',
        'PUT /api/admin/settings': 'Update system settings (admin only)'
      },
      reports: {
        'POST /api/reports': 'Create a new report',
        'GET /api/reports/my-reports': 'Get user\'s reports',
        'GET /api/reports/:id': 'Get report details'
      }
    },
    endpoints: [
      'GET /health - Health check',
      'GET /api - API documentation',
      'Authentication required for most endpoints',
      'Use Bearer token in Authorization header'
    ]
  });
});

// Handle 404 for unknown routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export { app };
