import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { AuthModal } from '../auth/AuthModal';
import { UserMenu } from '../auth/UserMenu';
import NotificationBell from '../NotificationBell';
import { useAuthStore } from '../../stores/authStore';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const location = useLocation();
  const { isAuthenticated, getCurrentUser } = useAuthStore();

  // Initialize user session on app load
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Find Experts', href: '/experts' },
    { name: 'For Businesses', href: '/assessment' },
    { name: 'Success Stories', href: '#success-stories' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-glow group-hover:shadow-glow-orange transition-all duration-300 group-hover:scale-105">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-text-primary group-hover:text-primary-600 transition-colors duration-200">
                  AutomateHub
                </span>
                <span className="text-xs text-text-muted font-medium">Premium n8n Expertise</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 relative group ${
                    isActiveLink(item.href)
                      ? 'text-primary-600'
                      : 'text-text-secondary hover:text-primary-600'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary-600 transform transition-transform duration-200 ${
                    isActiveLink(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={() => handleAuthClick('signup')}
                  >
                    <span>Start Your Project</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="md"
                    onClick={() => handleAuthClick('signin')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-text-secondary hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, height: 'auto' },
            closed: { opacity: 0, height: 0 }
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                  isActiveLink(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-text-secondary hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              {isAuthenticated ? (
                <div className="px-3">
                  <UserMenu />
                </div>
              ) : (
                <>
                  <Button 
                    variant="primary" 
                    size="md" 
                    fullWidth
                    onClick={() => {
                      handleAuthClick('signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    Start Your Project
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="md" 
                    fullWidth
                    onClick={() => {
                      handleAuthClick('signin');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};