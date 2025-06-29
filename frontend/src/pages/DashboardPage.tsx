import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageCircle, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  User
} from 'lucide-react';
import { ClientDashboard } from '../components/dashboard/ClientDashboard';
import { ExpertDashboard } from '../components/dashboard/ExpertDashboard';
import { MessagingSystem } from '../components/dashboard/MessagingSystem';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { Button } from '../components/ui/Button';
import { socketService } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

type DashboardView = 'overview' | 'messages' | 'analytics' | 'settings';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  
  // Get user role from authenticated user
  const userRole = user?.role || 'client';

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
    // Analytics only for experts and admins
    ...(userRole === 'expert' || userRole === 'admin' ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderDashboardContent = () => {
    switch (activeView) {
      case 'overview':
        return userRole === 'client' ? <ClientDashboard /> : <ExpertDashboard />;
      case 'messages':
        return <MessagingSystem selectedConversationId={selectedConversationId} />;
      case 'analytics':
        // Only show analytics for experts and admins
        return (userRole === 'expert' || userRole === 'admin') ? <AnalyticsDashboard /> : <ClientDashboard />;
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return userRole === 'client' ? <ClientDashboard /> : <ExpertDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AH</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AutomateHub</span>
              </div>

              {/* Main Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
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
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* User Role Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                userRole === 'expert' 
                  ? 'bg-blue-100 text-blue-800' 
                  : userRole === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {userRole === 'expert' ? 'Expert' : userRole === 'admin' ? 'Admin' : 'Client'}
              </div>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
              </Button>

              {/* Profile */}
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
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