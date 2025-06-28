import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard,
  Star,
  FileText,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
    },
    ...(user.role === 'expert' ? [
      {
        icon: Star,
        label: 'My Services',
        href: '/expert/services',
      },
      {
        icon: FileText,
        label: 'My Projects',
        href: '/expert/projects',
      },
    ] : [
      {
        icon: FileText,
        label: 'My Projects',
        href: '/client/projects',
      },
      {
        icon: CreditCard,
        label: 'Billing',
        href: '/client/billing',
      },
    ]),
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
            </span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName || ''} {user.lastName || ''}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user.role}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName || ''} {user.lastName || ''}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'expert' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'expert' ? 'Expert' : 'Client'}
                </span>
                {user.isEmailVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
