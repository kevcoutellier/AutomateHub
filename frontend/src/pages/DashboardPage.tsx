import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageCircle, 
  BarChart3
} from 'lucide-react';
import { ClientDashboard } from '../components/dashboard/ClientDashboard';
import { ExpertDashboard } from '../components/dashboard/ExpertDashboard';
import { MessagingSystem } from '../components/dashboard/MessagingSystem';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { socketService } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

type DashboardView = 'overview' | 'messages' | 'analytics';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  
  // Get user role from authenticated user
  const userRole = user?.role || 'client';

  // Redirect admin users to admin page
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin');
      return;
    }
  }, [userRole, navigate]);

  // Handle navigation state from ExpertProfilePage
  useEffect(() => {
    if (location.state) {
      const { activeTab, conversationId } = location.state;
      if (activeTab) {
        setActiveView(activeTab as DashboardView);
      }
      if (conversationId) {
        setSelectedConversationId(conversationId);
      }
    }
  }, [location.state]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Filter navigation based on user role
  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    // Analytics only for experts (admins are redirected to /admin)
    ...(userRole === 'expert' ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : [])
  ];

  const renderDashboardContent = () => {
    switch (activeView) {
      case 'overview':
        return userRole === 'client' ? <ClientDashboard /> : <ExpertDashboard />;
      case 'messages':
        return <MessagingSystem selectedConversationId={selectedConversationId} />;
      case 'analytics':
        // Only show analytics for experts (admins are redirected to /admin)
        return userRole === 'expert' ? <AnalyticsDashboard /> : <ClientDashboard />;
      default:
        return userRole === 'client' ? <ClientDashboard /> : <ExpertDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as DashboardView)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeView === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Role Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              userRole === 'expert' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {userRole === 'expert' ? 'Expert' : 'Client'}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <motion.div
        key={`${userRole}-${activeView}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${activeView === 'messages' ? 'h-[calc(100vh-9rem)] md:h-[calc(100vh-4rem)]' : ''}`}
      >
        {renderDashboardContent()}
      </motion.div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as DashboardView)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-colors duration-200 ${
                activeView === item.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};