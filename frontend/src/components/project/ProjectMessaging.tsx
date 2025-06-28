import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, FileText, Download, User } from 'lucide-react';
import { apiClient } from '../../services/api';
import { Message } from '../../types';
import FileUpload from '../FileUpload/FileUpload';

interface ProjectMessagingProps {
  projectId: string;
  messages: Message[];
  onMessageSent: () => void;
}

const ProjectMessaging: React.FC<ProjectMessagingProps> = ({
  projectId,
  messages,
  onMessageSent
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      setSending(true);
      await apiClient.sendMessage(projectId, {
        content: newMessage,
        attachments
      });
      
      setNewMessage('');
      setAttachments([]);
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (fileIds: string[]) => {
    setAttachments(prev => [...prev, ...fileIds]);
    setShowFileUpload(false);
  };

  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(id => id !== fileId));
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString('fr-FR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
      {/* Messages Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Messages du projet</h3>
        <p className="text-sm text-gray-500">{messages.length} message(s)</p>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.9L3 21l1.9-6.226A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez la conversation en envoyant un message.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.sender.id === localStorage.getItem('userId');
            const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                    {showAvatar ? (
                      message.sender.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={message.sender.avatar}
                          alt={`${message.sender.firstName} ${message.sender.lastName}`}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )
                    ) : (
                      <div className="h-8 w-8"></div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span className="text-xs font-medium text-gray-900">
                          {message.sender.firstName} {message.sender.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isCurrentUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className={`flex items-center space-x-2 p-2 rounded ${
                                isCurrentUser ? 'bg-indigo-500' : 'bg-gray-200'
                              }`}
                            >
                              {getFileIcon(attachment.fileName)}
                              <span className="text-xs truncate flex-1">{attachment.fileName}</span>
                              <button
                                onClick={() => window.open(attachment.url, '_blank')}
                                className={`p-1 rounded hover:bg-opacity-20 hover:bg-white ${
                                  isCurrentUser ? 'text-white' : 'text-gray-600'
                                }`}
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {!showAvatar && (
                      <span className="text-xs text-gray-500 mt-1">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((fileId) => (
              <div
                key={fileId}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Fichier attaché</span>
                <button
                  onClick={() => removeAttachment(fileId)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFileUpload(true)}
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && attachments.length === 0)}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter des fichiers</h3>
            <FileUpload
              onUpload={handleFileUpload}
              multiple={true}
              accept="*/*"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowFileUpload(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMessaging;
