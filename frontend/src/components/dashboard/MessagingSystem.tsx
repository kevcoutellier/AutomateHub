import React, { useState, useEffect } from 'react';
import { ConversationList } from '../messaging/ConversationList';
import { MessageThread } from '../messaging/MessageThread';
import { Conversation } from '../../services/conversationApi';

interface MessagingSystemProps {
  selectedConversationId?: string;
}

export const MessagingSystem: React.FC<MessagingSystemProps> = ({
  selectedConversationId
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Get current user ID from localStorage or auth context
    const userId = localStorage.getItem('userId') || '';
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    // If a conversation ID is passed from navigation, we need to fetch that conversation
    if (selectedConversationId && !selectedConversation) {
      // The ConversationList component will handle selecting this conversation
      // when it loads the conversations
    }
  }, [selectedConversationId, selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationDeleted = (deletedConversationId: string) => {
    // If the deleted conversation was currently selected, clear the selection
    if (selectedConversation?._id === deletedConversationId) {
      setSelectedConversation(null);
    }
  };

  return (
    <div className="h-full min-h-[600px] bg-gray-50 flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 h-full min-h-[600px]">
        <ConversationList
          onSelectConversation={handleSelectConversation}
          onConversationDeleted={handleConversationDeleted}
          selectedConversationId={selectedConversation?._id || selectedConversationId}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col h-full min-h-[600px]">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};