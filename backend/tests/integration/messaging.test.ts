import request from 'supertest';
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import { createTestUser, createTestExpert, createTestProject, generateTestToken } from '../setup';
import conversationRoutes from '../../src/routes/conversations';
import { authenticate } from '../../src/middleware/auth';

// Create test app with Socket.IO
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(authenticate);
app.use('/conversations', conversationRoutes);

// Socket handlers will be set up manually for testing

describe('Messaging System Integration Tests', () => {
  let client: any;
  let expert: any;
  let expertUser: any;
  let testProject: any;
  let clientToken: string;
  let expertToken: string;
  let serverPort: number;

  beforeAll((done) => {
    httpServer.listen(() => {
      serverPort = (httpServer.address() as any).port;
      done();
    });
  });

  afterAll((done) => {
    httpServer.close(done);
  });

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

    testProject = await createTestProject(
      client._id.toString(),
      expert._id.toString()
    );

    clientToken = generateTestToken(client._id.toString());
    expertToken = generateTestToken(expertUser._id.toString());
  });

  describe('REST API Messaging', () => {
    describe('POST /conversations', () => {
      it('should create a new conversation', async () => {
        const conversationData = {
          expertId: expert._id.toString()
        };

        const response = await request(app)
          .post('/conversations/start')
          .set('Authorization', `Bearer ${clientToken}`)
          .send(conversationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        
        // Check participants array (contains populated user objects)
        const participantIds = response.body.data.participants.map((p: any) => p._id);
        expect(participantIds).toContain(client._id.toString());
        expect(participantIds).toContain(expertUser._id.toString());
        
        // Check expert and client IDs (may be populated objects)
        const expertId = typeof response.body.data.expertId === 'object' 
          ? response.body.data.expertId._id 
          : response.body.data.expertId;
        const clientId = typeof response.body.data.clientId === 'object' 
          ? response.body.data.clientId._id 
          : response.body.data.clientId;
          
        expect(expertId).toBe(expertUser._id.toString());
        expect(clientId).toBe(client._id.toString());
      });

      it('should reject conversation creation with invalid participant', async () => {
        const conversationData = {
          expertId: '507f1f77bcf86cd799439011' // Non-existent expert
        };

        const response = await request(app)
          .post('/conversations/start')
          .set('Authorization', `Bearer ${clientToken}`)
          .send(conversationData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Expert not found');
      });

      it('should reject conversation creation with missing expert ID', async () => {
        const conversationData = {}; // Missing expertId

        const response = await request(app)
          .post('/conversations/start')
          .set('Authorization', `Bearer ${clientToken}`)
          .send(conversationData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Validation failed');
      });
    });

    describe('GET /conversations', () => {
      let conversation: any;

      beforeEach(async () => {
        const response = await request(app)
          .post('/conversations/start')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            expertId: expert._id.toString()
          });
        conversation = response.body.data;
      });

      it('should get conversations for client', async () => {
        const response = await request(app)
          .get('/conversations')
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]._id).toBe(conversation._id);
        
        // Check participants array (contains populated user objects)
        const participantIds = response.body.data[0].participants.map((p: any) => p._id);
        expect(participantIds).toContain(client._id.toString());
      });

      it('should get conversations for expert', async () => {
        const response = await request(app)
          .get('/conversations')
          .set('Authorization', `Bearer ${expertToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        
        // Check participants array (contains populated user objects)
        const participantIds = response.body.data[0].participants.map((p: any) => p._id);
        expect(participantIds).toContain(expertUser._id.toString());
      });

      it('should support pagination', async () => {
        // Create multiple conversations
        for (let i = 0; i < 5; i++) {
          await request(app)
            .post('/conversations')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
              participantId: expertUser._id.toString(),
              projectId: testProject._id.toString(),
              initialMessage: `Test message ${i}`
            });
        }

        const response = await request(app)
          .get('/conversations?page=1&limit=3')
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.conversations.length).toBeLessThanOrEqual(3);
        expect(response.body.data.pagination).toBeDefined();
      });
    });

    describe('POST /conversations/:id/messages', () => {
      let conversation: any;

      beforeEach(async () => {
        const response = await request(app)
          .post('/conversations')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            participantId: expertUser._id.toString(),
            projectId: testProject._id.toString(),
            initialMessage: 'Initial message'
          });
        conversation = response.body.data.conversation;
      });

      it('should send a message in conversation', async () => {
        const messageData = {
          content: 'This is a reply message',
          messageType: 'text'
        };

        const response = await request(app)
          .post(`/conversations/${conversation._id}/messages`)
          .set('Authorization', `Bearer ${expertToken}`)
          .send(messageData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message.content).toBe(messageData.content);
        expect(response.body.data.message.senderId).toBe(expertUser._id.toString());
        expect(response.body.data.message.conversationId).toBe(conversation._id);
      });

      it('should reject message from non-participant', async () => {
        const otherUser = await createTestUser({
          email: 'other@example.com',
          role: 'client'
        });
        const otherToken = generateTestToken(otherUser._id.toString());

        const response = await request(app)
          .post(`/conversations/${conversation._id}/messages`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({ content: 'Unauthorized message' })
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not a participant');
      });

      it('should reject empty message', async () => {
        const response = await request(app)
          .post(`/conversations/${conversation._id}/messages`)
          .set('Authorization', `Bearer ${expertToken}`)
          .send({ content: '' })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /conversations/:id/messages', () => {
      let conversation: any;

      beforeEach(async () => {
        const response = await request(app)
          .post('/conversations')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            participantId: expertUser._id.toString(),
            projectId: testProject._id.toString(),
            initialMessage: 'Initial message'
          });
        conversation = response.body.data.conversation;

        // Add more messages
        for (let i = 0; i < 3; i++) {
          await request(app)
            .post(`/conversations/${conversation._id}/messages`)
            .set('Authorization', `Bearer ${expertToken}`)
            .send({ content: `Reply message ${i}` });
        }
      });

      it('should get messages for conversation participant', async () => {
        const response = await request(app)
          .get(`/conversations/${conversation._id}/messages`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.messages.length).toBeGreaterThan(0);
        expect(response.body.data.messages[0].conversationId).toBe(conversation._id);
      });

      it('should reject access from non-participant', async () => {
        const otherUser = await createTestUser({
          email: 'other@example.com',
          role: 'client'
        });
        const otherToken = generateTestToken(otherUser._id.toString());

        const response = await request(app)
          .get(`/conversations/${conversation._id}/messages`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });

      it('should support pagination for messages', async () => {
        const response = await request(app)
          .get(`/conversations/${conversation._id}/messages?page=1&limit=2`)
          .set('Authorization', `Bearer ${clientToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.messages.length).toBeLessThanOrEqual(2);
        expect(response.body.data.pagination).toBeDefined();
      });
    });
  });

  describe('Socket.IO Real-time Messaging', () => {
    let clientSocket: any;
    let expertSocket: any;
    let conversation: any;

    beforeEach(async () => {
      // Create conversation via REST API
      const response = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          participantId: expertUser._id.toString(),
          projectId: testProject._id.toString(),
          initialMessage: 'Socket test conversation'
        });
      conversation = response.body.data.conversation;

      // Connect socket clients
      clientSocket = Client(`http://localhost:${serverPort}`, {
        auth: { token: clientToken }
      });

      expertSocket = Client(`http://localhost:${serverPort}`, {
        auth: { token: expertToken }
      });

      // Wait for connections
      await Promise.all([
        new Promise<void>(resolve => clientSocket.on('connect', () => resolve())),
        new Promise<void>(resolve => expertSocket.on('connect', () => resolve()))
      ]);

      // Join conversation rooms
      clientSocket.emit('join_conversation', conversation._id);
      expertSocket.emit('join_conversation', conversation._id);
    });

    afterEach(() => {
      if (clientSocket) clientSocket.disconnect();
      if (expertSocket) expertSocket.disconnect();
    });

    it('should send and receive messages in real-time', (done) => {
      const testMessage = {
        conversationId: conversation._id,
        content: 'Real-time test message',
        receiverId: expertUser._id.toString(),
        messageType: 'text'
      };

      // Expert listens for new message
      expertSocket.on('new_message', (message: any) => {
        expect(message.content).toBe(testMessage.content);
        expect(message.senderId).toBe(client._id.toString());
        expect(message.conversationId).toBe(conversation._id);
        done();
      });

      // Client sends message
      clientSocket.emit('send_message', testMessage);
    });

    it('should handle typing indicators', (done) => {
      let typingReceived = false;
      let stopTypingReceived = false;

      // Expert listens for typing events
      expertSocket.on('user_typing', (data: any) => {
        expect(data.userId).toBe(client._id.toString());
        expect(data.conversationId).toBe(conversation._id);
        typingReceived = true;
        
        if (typingReceived && stopTypingReceived) {
          done();
        }
      });

      expertSocket.on('user_stop_typing', (data: any) => {
        expect(data.userId).toBe(client._id.toString());
        expect(data.conversationId).toBe(conversation._id);
        stopTypingReceived = true;
        
        if (typingReceived && stopTypingReceived) {
          done();
        }
      });

      // Client starts and stops typing
      clientSocket.emit('typing_start', { conversationId: conversation._id });
      setTimeout(() => {
        clientSocket.emit('typing_stop', { conversationId: conversation._id });
      }, 100);
    });

    it('should handle message read receipts', (done) => {
      // Client listens for read receipt
      clientSocket.on('messages_read', (data: any) => {
        expect(data.conversationId).toBe(conversation._id);
        expect(data.readBy).toBe(expertUser._id.toString());
        done();
      });

      // Expert marks messages as read
      expertSocket.emit('mark_messages_read', { conversationId: conversation._id });
    });

    it('should handle connection errors gracefully', (done) => {
      const invalidSocket = Client(`http://localhost:${serverPort}`, {
        auth: { token: 'invalid-token' }
      });

      invalidSocket.on('connect_error', (error) => {
        expect(error).toBeDefined();
        invalidSocket.disconnect();
        done();
      });
    });
  });

  describe('Complete Messaging Flow Integration', () => {
    it('should complete full messaging workflow: create conversation -> send messages -> real-time updates', async () => {
      // 1. Create conversation via REST API
      const conversationResponse = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          participantId: expertUser._id.toString(),
          projectId: testProject._id.toString(),
          initialMessage: 'Hello, let\'s discuss the project'
        })
        .expect(201);

      const conversation = conversationResponse.body.data.conversation;

      // 2. Send additional messages via REST API
      await request(app)
        .post(`/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          content: 'Great! I\'m excited to work on this project.',
          messageType: 'text'
        })
        .expect(201);

      await request(app)
        .post(`/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          content: 'When can we start?',
          messageType: 'text'
        })
        .expect(201);

      // 3. Retrieve conversation history
      const messagesResponse = await request(app)
        .get(`/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(messagesResponse.body.data.messages).toHaveLength(3);

      // 4. Test real-time messaging
      return new Promise<void>((resolve) => {
        const clientSocket = Client(`http://localhost:${serverPort}`, {
          auth: { token: clientToken }
        });

        const expertSocket = Client(`http://localhost:${serverPort}`, {
          auth: { token: expertToken }
        });

        Promise.all([
          new Promise<void>(res => clientSocket.on('connect', () => res())),
          new Promise<void>(res => expertSocket.on('connect', () => res()))
        ]).then(() => {
          clientSocket.emit('join_conversation', conversation._id);
          expertSocket.emit('join_conversation', conversation._id);

          // Client listens for expert's real-time message
          clientSocket.on('new_message', (message: any) => {
            expect(message.content).toBe('Let\'s start tomorrow!');
            expect(message.senderId).toBe(expertUser._id.toString());
            
            clientSocket.disconnect();
            expertSocket.disconnect();
            resolve();
          });

          // Expert sends real-time message
          setTimeout(() => {
            expertSocket.emit('send_message', {
              conversationId: conversation._id,
              content: 'Let\'s start tomorrow!',
              receiverId: client._id.toString(),
              messageType: 'text'
            });
          }, 100);
        });
      });
    });
  });
});
