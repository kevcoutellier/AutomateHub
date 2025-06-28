import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2 } from 'lucide-react';
import { conversationApi, Conversation, Message } from '../../services/conversationApi';
import { socketService } from '../../services/socket';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  conversation: Conversation;
  currentUserId: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  currentUserId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number>();
  const tempMessageIdRef = useRef<string>('');

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      joinConversation();
      setupSocketListeners();
    }

    return () => {
      if (conversation) {
        socketService.leaveConversation(conversation._id);
        socketService.removeAllListeners();
      }
    };
  }, [conversation._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await conversationApi.getMessages(conversation._id);
      if (response.success && response.data) {
        setMessages(response.data.messages);
        // Mark messages as read
        await conversationApi.markMessagesAsRead(conversation._id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    // Ensure socket is connected before joining conversation
    if (socketService.isConnected()) {
      console.log('Socket is connected, joining conversation:', conversation._id);
      socketService.joinConversation(conversation._id);
    } else {
      console.log('Socket not connected, waiting for connection...');
      // Wait for socket connection and then join
      const checkConnection = setInterval(() => {
        if (socketService.isConnected()) {
          console.log('Socket connected, now joining conversation:', conversation._id);
          socketService.joinConversation(conversation._id);
          clearInterval(checkConnection);
        }
      }, 100);
      
      // Clear interval after 5 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkConnection), 5000);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((message: Message) => {
      console.log('MessageThread received new message:', message);
      if (message.conversationId === conversation._id) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg._id === message._id);
          if (messageExists) {
            console.log('Message already exists, skipping duplicate');
            return prev;
          }

          // Check if this is replacing a temporary message from the same sender
          const isFromCurrentUser = message.senderId._id === currentUserId;
          console.log('Message from current user:', isFromCurrentUser, 'Current user ID:', currentUserId);
          
          if (isFromCurrentUser) {
            // Remove any temporary messages and add the real one
            const withoutTemp = prev.filter(msg => !msg._id.startsWith('temp-'));
            console.log('Replacing temp message, messages before:', prev.length, 'after:', withoutTemp.length + 1);
            return [...withoutTemp, message];
          } else {
            // For messages from others, just add normally and sort by timestamp
            console.log('Adding message from other user');
            const newMessages = [...prev, message];
            return newMessages.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
        });
        
        // Mark as read if it's not from current user and conversation is active
        if (message.senderId._id !== currentUserId) {
          console.log('Marking message as read from other user');
          socketService.markMessagesAsRead(conversation._id);
          // Also update via REST API
          conversationApi.markMessagesAsRead(conversation._id);
        }

        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    });

    socketService.onMessageNotification((data) => {
      console.log('MessageThread received message notification:', data);
      // If this notification is for the current conversation, the message should already be handled above
      // This is mainly for updating unread counts in other conversations
    });

    socketService.onUserTyping((data) => {
      if (data.conversationId === conversation._id && data.userId !== currentUserId) {
        setTyping(prev => {
          // Add user to typing list if not already there
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
        
        // Auto-clear typing indicator after 5 seconds
        setTimeout(() => {
          setTyping(prev => prev.filter(id => id !== data.userId));
        }, 5000);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (data.conversationId === conversation._id) {
        setTyping(prev => prev.filter(id => id !== data.userId));
      }
    });

    socketService.onMessagesRead((data) => {
      console.log('MessageThread received messages read event:', data);
      if (data.conversationId === conversation._id) {
        // Update message read status
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: true,
          readAt: data.readAt || new Date().toISOString()
        })));
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const receiverId = conversation.participants.find(p => p._id !== currentUserId)?._id;
    if (!receiverId) {
      console.error('No receiver ID found');
      return;
    }

    const messageContent = newMessage.trim();
    console.log('Sending message:', messageContent, 'to:', receiverId, 'currentUserId:', currentUserId);
    
    try {
      setSending(true);
      
      // Create temporary message for immediate display
      const tempMessageId = `temp-${Date.now()}`;
      tempMessageIdRef.current = tempMessageId;
      const tempMessage: Message = {
        _id: tempMessageId,
        conversationId: conversation._id,
        senderId: {
          _id: currentUserId,
          firstName: 'You',
          lastName: '',
          email: '',
          avatar: ''
        },
        receiverId: {
          _id: receiverId,
          firstName: '',
          lastName: '',
          email: '',
          avatar: ''
        },
        content: messageContent,
        messageType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Adding temporary message:', tempMessage);
      // Add message to local state immediately
      setMessages(prev => {
        console.log('Messages before adding temp:', prev.length);
        return [...prev, tempMessage];
      });
      setNewMessage('');
      socketService.stopTyping(conversation._id);

      // Send via Socket.IO for real-time delivery
      console.log('Sending via Socket.IO');
      socketService.sendMessage({
        conversationId: conversation._id,
        content: messageContent,
        receiverId,
        messageType: 'text'
      });

      // Also send via REST API as fallback
      try {
        console.log('Sending via REST API as fallback');
        await conversationApi.sendMessage(conversation._id, messageContent, receiverId);
      } catch (restError) {
        console.warn('REST API fallback failed:', restError);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg._id !== tempMessageIdRef.current));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Send typing indicator
    socketService.startTyping(conversation._id);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversation._id);
    }, 3000);
  };

  const otherParticipant = conversation.participants.find(p => p._id !== currentUserId);
  
  // Enhanced name resolution with expert profile priority
  let participantName = 'Unknown User';
  if (conversation.expertProfile?.name) {
    // Use expert's full name from expert profile
    participantName = conversation.expertProfile.name;
  } else if (otherParticipant) {
    // Use participant's first and last name
    participantName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim();
  } else if (conversation.expertId) {
    // Fallback to expertId first and last name
    participantName = `${conversation.expertId.firstName || ''} ${conversation.expertId.lastName || ''}`.trim();
  } else if (conversation.clientId) {
    // Fallback to clientId first and last name
    participantName = `${conversation.clientId.firstName || ''} ${conversation.clientId.lastName || ''}`.trim();
  }
  
  // Use expert profile avatar if available
  const participantAvatar = conversation.expertProfile?.avatar || otherParticipant?.avatar;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b bg-white flex-shrink-0">
        {participantAvatar ? (
          <img
            src={participantAvatar}
            alt={participantName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-900">
            {participantName}
          </h2>
          <p className="text-sm text-gray-600">{otherParticipant?.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId._id === currentUserId;
            return (
              <div
                key={message._id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typing.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
