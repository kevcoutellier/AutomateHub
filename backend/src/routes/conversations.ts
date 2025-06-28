import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { UserModel } from '../models/User';
import { ExpertModel } from '../models/Expert';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { io } from '../server';

const router = express.Router();

// Get all conversations for a user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'firstName lastName email avatar')
    .populate('expertId', 'firstName lastName email avatar')
    .populate('clientId', 'firstName lastName email avatar')
    .sort({ lastMessageAt: -1 });

    // Enhance conversations with expert profile data
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const conversationObj = conversation.toObject();
        
        // Find the expert profile for this conversation
        if (conversationObj.expertId && typeof conversationObj.expertId === 'object') {
          const expertProfile = await ExpertModel.findOne({ userId: (conversationObj.expertId as any)._id });
          if (expertProfile) {
            // Add expert profile data to the conversation
            (conversationObj as any).expertProfile = {
              name: expertProfile.name,
              title: expertProfile.title,
              avatar: expertProfile.portfolio?.[0]?.imageUrl || (conversationObj.expertId as any).avatar
            };
          }
        }
        
        return conversationObj;
      })
    );

    res.json({
      success: true,
      data: enhancedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get or create conversation between client and expert
router.post('/start', authenticate, [
  body('expertId').notEmpty().withMessage('Expert ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const clientId = req.user?.id;
    const { expertId } = req.body;

    // Check if expert exists
    const expert = await ExpertModel.findById(expertId);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }

    // Get the expert's user ID
    const expertUserId = expert.userId;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      expertId: expertUserId,
      clientId
    })
    .populate('participants', 'firstName lastName email avatar')
    .populate('expertId', 'firstName lastName email avatar')
    .populate('clientId', 'firstName lastName email avatar');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [clientId, expertUserId],
        expertId: expertUserId,
        clientId,
        lastMessage: '',
        lastMessageAt: new Date()
      });

      await conversation.save();
      
      // Populate the new conversation
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName email avatar')
        .populate('expertId', 'firstName lastName email avatar')
        .populate('clientId', 'firstName lastName email avatar');
    }

    if(conversation) {
      // Enhance conversation with expert profile data
      const conversationObj = conversation?.toObject();
      if (conversationObj && conversationObj.expertId && typeof conversationObj.expertId === 'object') {
        const expertProfile = await ExpertModel.findOne({ userId: (conversationObj.expertId as any)._id });
        if (expertProfile) {
          (conversationObj as any).expertProfile = {
            name: expertProfile.name,
            title: expertProfile.title,
            avatar: expertProfile.portfolio?.[0]?.imageUrl || (conversationObj.expertId as any).avatar
          };
        }
      }

      return res.json({
        success: true,
        data: conversationObj
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
  } catch (error) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start conversation'
    });
  }
});

// Get conversation by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    })
    .populate('participants', 'firstName lastName email avatar')
    .populate('expertId', 'firstName lastName email avatar')
    .populate('clientId', 'firstName lastName email avatar');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Enhance conversation with expert profile data
    const conversationObj = conversation?.toObject();
    if (conversationObj && conversationObj.expertId && typeof conversationObj.expertId === 'object') {
      const expertProfile = await ExpertModel.findOne({ userId: (conversationObj.expertId as any)._id });
      if (expertProfile) {
        (conversationObj as any).expertProfile = {
          name: expertProfile.name,
          title: expertProfile.title,
          avatar: expertProfile.portfolio?.[0]?.imageUrl || (conversationObj.expertId as any).avatar
        };
      }
    }

    return res.json({
      success: true,
      data: conversationObj
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// Get messages for a conversation
router.get('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({
      conversationId
    })
    .populate('senderId', 'firstName lastName email avatar')
    .populate('receiverId', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalMessages = await Message.countDocuments({ conversationId });

    return res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/:id/messages', authenticate, [
  body('content').notEmpty().withMessage('Message content is required'),
  body('receiverId').notEmpty().withMessage('Receiver ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?.id;
    const conversationId = req.params.id;
    const { content, receiverId, messageType = 'text' } = req.body;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      receiverId,
      content,
      messageType
    });

    await message.save();

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date()
    });

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'firstName lastName email avatar')
      .populate('receiverId', 'firstName lastName email avatar');

    return res.json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark messages as read
router.put('/:id/messages/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// Delete conversation
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get all participants before deletion for socket notification
    const participants = conversation.participants;

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    // Emit socket event to all participants
    participants.forEach(participantId => {
      if (participantId.toString() !== userId) {
        io.to(`user_${participantId}`).emit('conversation_deleted', {
          conversationId,
          deletedBy: userId
        });
      }
    });

    // Also emit to the conversation room in case anyone is still connected
    io.to(`conversation_${conversationId}`).emit('conversation_deleted', {
      conversationId,
      deletedBy: userId
    });

    return res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
});

export default router;
