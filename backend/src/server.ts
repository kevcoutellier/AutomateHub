import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/config';
import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import { Message } from './models/Message';
import { Conversation } from './models/Conversation';
import './types/socket'; // Import socket type extensions

// Import routes
import authRoutes from './routes/auth';
import expertRoutes from './routes/experts';
import projectRoutes from './routes/projects';
import reviewRoutes from './routes/reviews';
import assessmentRoutes from './routes/assessment';
import conversationRoutes from './routes/conversations';

const app = express();
const server = createServer(app);

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

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: config.server.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(async (socket: Socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    (socket as any).userId = decoded.userId;
    console.log('Socket authenticated for user:', decoded.userId);
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log(`User ${(socket as any).userId} connected`);

  // Join user to their personal room
  socket.join(`user_${(socket as any).userId}`);
  console.log(`User ${(socket as any).userId} joined personal room: user_${(socket as any).userId}`);

  // Join conversation rooms
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${(socket as any).userId} joined conversation ${conversationId}`);
    console.log(`Active rooms for user:`, Array.from(socket.rooms));
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${(socket as any).userId} left conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, receiverId, messageType = 'text' } = data;
      console.log(`Message received from user ${(socket as any).userId}:`, {
        conversationId,
        content: content.substring(0, 50) + '...',
        receiverId,
        messageType
      });

      // Create message in database
      const message = new Message({
        conversationId,
        senderId: (socket as any).userId,
        receiverId,
        content,
        messageType
      });

      await message.save();
      console.log(`Message saved to database with ID: ${message._id}`);

      // Update conversation last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: new Date()
      });

      // Populate message for broadcasting
      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name email avatar')
        .populate('receiverId', 'name email avatar');

      console.log(`Broadcasting message to conversation room: conversation_${conversationId}`);
      console.log(`Sockets in conversation room:`, io.sockets.adapter.rooms.get(`conversation_${conversationId}`)?.size || 0);
      
      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', populatedMessage);

      // Send notification to receiver's personal room
      console.log(`Sending notification to receiver room: user_${receiverId}`);
      console.log(`Sockets in receiver room:`, io.sockets.adapter.rooms.get(`user_${receiverId}`)?.size || 0);
      
      io.to(`user_${receiverId}`).emit('message_notification', {
        conversationId,
        message: populatedMessage,
        unreadCount: await Message.countDocuments({
          receiverId,
          isRead: false
        })
      });

      console.log(`Message broadcasting completed`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: (socket as any).userId,
      conversationId: data.conversationId
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
      userId: (socket as any).userId,
      conversationId: data.conversationId
    });
  });

  // Handle message read status
  socket.on('mark_messages_read', async (data) => {
    try {
      const { conversationId } = data;

      await Message.updateMany(
        {
          conversationId,
          receiverId: (socket as any).userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Notify sender that messages were read
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy: (socket as any).userId
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${(socket as any).userId} disconnected`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AutomateHub API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/conversations', conversationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AutomateHub API v1.0.0',
    documentation: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/me': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/refresh': 'Refresh access token'
      },
      experts: {
        'GET /api/experts': 'Get all experts with filtering',
        'GET /api/experts/:id': 'Get expert by ID',
        'POST /api/experts': 'Create expert profile (expert role)',
        'PUT /api/experts/:id': 'Update expert profile',
        'GET /api/experts/me/profile': 'Get own expert profile',
        'POST /api/experts/:id/portfolio': 'Add portfolio item',
        'PUT /api/experts/:id/portfolio/:itemId': 'Update portfolio item',
        'DELETE /api/experts/:id/portfolio/:itemId': 'Delete portfolio item',
        'GET /api/experts/:id/stats': 'Get expert statistics'
      },
      projects: {
        'GET /api/projects': 'Get projects with filtering',
        'GET /api/projects/:id': 'Get project by ID',
        'POST /api/projects': 'Create new project (client role)',
        'PUT /api/projects/:id': 'Update project',
        'PUT /api/projects/:id/progress': 'Update project progress (expert)',
        'POST /api/projects/:id/milestones': 'Add milestone',
        'PUT /api/projects/:id/milestones/:milestoneId': 'Update milestone',
        'POST /api/projects/:id/messages': 'Send message',
        'GET /api/projects/:id/messages': 'Get project messages'
      },
      reviews: {
        'GET /api/reviews': 'Get reviews with filtering',
        'GET /api/reviews/:id': 'Get review by ID',
        'POST /api/reviews': 'Create review (client role)',
        'PUT /api/reviews/:id': 'Update review',
        'DELETE /api/reviews/:id': 'Delete review',
        'GET /api/reviews/expert/:expertId': 'Get expert reviews',
        'GET /api/reviews/client/my-reviews': 'Get client reviews'
      },
      assessment: {
        'POST /api/assessment': 'Submit assessment (client role)',
        'GET /api/assessment/my-assessments': 'Get user assessments',
        'GET /api/assessment/:id': 'Get assessment by ID',
        'GET /api/assessment/:id/results': 'Get detailed assessment results',
        'DELETE /api/assessment/:id': 'Delete assessment'
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

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    server.listen(config.server.port, () => {
      console.log(`🚀 AutomateHub API server running on port ${config.server.port}`);
      console.log(`💬 Socket.IO server ready for real-time messaging`);
      console.log(`📖 API Documentation: http://localhost:${config.server.port}/api`);
      console.log(`🏥 Health Check: http://localhost:${config.server.port}/health`);
      console.log(`🌍 Environment: ${config.server.env}`);
      
      if (config.server.env === 'development') {
        console.log(`🔧 CORS Origin: ${config.server.corsOrigin}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

export default app;
export { io };
