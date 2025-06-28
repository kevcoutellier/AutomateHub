import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, User, Trash2 } from 'lucide-react';
import { conversationApi, Conversation } from '../../services/conversationApi';
import { socketService } from '../../services/socket';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  onConversationDeleted?: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
  onConversationDeleted
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    setupSocketListeners();

    return () => {
      // Clean up socket listeners when component unmounts
      socketService.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // Auto-select conversation if selectedConversationId is provided
    if (selectedConversationId && conversations.length > 0) {
      const selectedConv = conversations.find(conv => conv._id === selectedConversationId);
      if (selectedConv) {
        onSelectConversation(selectedConv);
      }
    }
  }, [selectedConversationId, conversations, onSelectConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationApi.getConversations();
      if (response.success && response.data) {
        console.log('Fetched conversations:', response.data.length);
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages to update conversation list
    socketService.onNewMessage((message) => {
      console.log('ConversationList received new message:', message);
      updateConversationWithNewMessage(message);
    });

    // Listen for message notifications to update conversation list
    socketService.onMessageNotification((data) => {
      console.log('ConversationList received message notification:', data);
      if (data.message) {
        updateConversationWithNewMessage(data.message);
      }
    });

    // Listen for messages marked as read to update conversation
    socketService.onMessagesRead((data) => {
      console.log('ConversationList received messages read event:', data);
      // Refresh conversations to update read status
      fetchConversations();
    });

    // Listen for conversation deletion events
    socketService.onConversationDeleted((data) => {
      console.log('ConversationList received conversation deleted event:', data);
      // Remove the deleted conversation from local state
      setConversations(prev => prev.filter(conv => conv._id !== data.conversationId));
      
      // Notify parent component if callback provided
      if (onConversationDeleted) {
        onConversationDeleted(data.conversationId);
      }
    });
  };

  const updateConversationWithNewMessage = (message: any) => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conversation => {
        if (conversation._id === message.conversationId) {
          // Update the conversation with the new message info
          return {
            ...conversation,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            // You might want to add unread count logic here
          };
        }
        return conversation;
      });

      // Sort conversations by lastMessageAt (most recent first)
      return updatedConversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    });
  };

  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent conversation selection when clicking delete
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingConversationId(conversationId);
      const response = await conversationApi.deleteConversation(conversationId);
      
      if (response.success) {
        // Remove conversation from local state
        setConversations(prev => prev.filter(conv => conv._id !== conversationId));
        
        // Notify parent component if callback provided
        if (onConversationDeleted) {
          onConversationDeleted(conversationId);
        }
      } else {
        alert(response.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeletingConversationId(null);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (conversation.expertProfile?.name?.toLowerCase().includes(searchLower)) ||
      (conversation.expertId && `${conversation.expertId.firstName} ${conversation.expertId.lastName}`.toLowerCase().includes(searchLower)) ||
      (conversation.clientId && `${conversation.clientId.firstName} ${conversation.clientId.lastName}`.toLowerCase().includes(searchLower)) ||
      conversation.lastMessage.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm text-center">
              Start a conversation by contacting an expert from their profile page.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation._id === selectedConversationId;
              const currentUserId = localStorage.getItem('userId'); // You'll need to store this during login
              const otherParticipant = conversation.participants?.find(p => p?._id !== currentUserId);
              
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
              
              try {
                if (!otherParticipant) {
                  console.error('No other participant found for conversation:', conversation);
                }
                if (!participantName || participantName === 'Unknown User') {
                  console.error('No participant name found for conversation:', conversation);
                }
              } catch (error) {
                console.error('Error rendering conversation:', error);
              }
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative group ${
                    isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
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
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {participantName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                          </span>
                          <button
                            onClick={(e) => handleDeleteConversation(conversation._id, e)}
                            disabled={deletingConversationId === conversation._id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 disabled:opacity-50"
                            title="Delete conversation"
                          >
                            {deletingConversationId === conversation._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
