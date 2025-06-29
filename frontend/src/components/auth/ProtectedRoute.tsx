import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'expert' | 'admin';
  allowedRoles?: ('client' | 'expert' | 'admin')[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  requireAuth = true
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If a specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (user?.role) {
      case 'expert':
        return <Navigate to="/dashboard" replace />;
      case 'client':
        return <Navigate to="/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If multiple roles are allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role
    switch (user.role) {
      case 'expert':
        return <Navigate to="/dashboard" replace />;
      case 'client':
        return <Navigate to="/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const ClientOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="client">{children}</ProtectedRoute>
);

export const ExpertOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="expert">{children}</ProtectedRoute>
);

export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['client', 'expert', 'admin']}>{children}</ProtectedRoute>
);
