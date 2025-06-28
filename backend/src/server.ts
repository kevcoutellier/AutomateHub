import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/config';
import { connectDatabase } from './config/database';
import { Message } from './models/Message';
import { Conversation } from './models/Conversation';
import { app } from './app';
import './types/socket'; // Import socket type extensions
const server = createServer(app);

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
