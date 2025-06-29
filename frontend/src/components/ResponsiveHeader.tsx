import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, ChevronDown, LogOut, Settings, Briefcase } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

const ResponsiveHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Fermer les menus lors du clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/experts?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Accueil', path: '/', public: true },
    { name: 'Experts', path: '/experts', public: true },
    { name: 'Comment ça marche', path: '/how-it-works', public: true },
    { name: 'Dashboard', path: '/dashboard', auth: true },
    { name: 'Projets', path: '/projects', auth: true },
    { name: 'Messages', path: '/messages', auth: true },
  ];

  const userMenuItems = [
    { 
      name: 'Mon Profil', 
      path: '/profile', 
      icon: User 
    },
    { 
      name: user?.role === 'expert' ? 'Mes Services' : 'Mes Projets', 
      path: user?.role === 'expert' ? '/expert/services' : '/client/projects', 
      icon: Briefcase 
    },
    { 
      name: 'Paramètres', 
      path: '/settings', 
      icon: Settings 
    },
  ];

  const MobileMenu: React.FC = () => (
    <div className={`mobile-menu-container fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      
      {/* Menu content */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              AutomateHub
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              {navigationItems.map((item) => {
                const shouldShow = item.public || (item.auth && isAuthenticated);
                if (!shouldShow) return null;

                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User section */}
            {isAuthenticated && user && (
              <div className="border-t border-gray-200 mt-4">
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-lg">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}

            {/* Auth buttons for non-authenticated users */}
            {!isAuthenticated && (
              <div className="border-t border-gray-200 mt-4 p-4 space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );

  const UserMenu: React.FC = () => (
    <div className="user-menu-container relative">
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-blue-600 font-semibold text-sm">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {user?.email}
            </p>
            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
              {user?.role}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-2">
            {userMenuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                AutomateHub
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const shouldShow = item.public || (item.auth && isAuthenticated);
                if (!shouldShow) return null;

                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des experts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Authenticated user actions */}
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <UserMenu />
                </>
              ) : (
                /* Non-authenticated user actions */
                <div className="hidden lg:flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des experts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};

export default ResponsiveHeader;
