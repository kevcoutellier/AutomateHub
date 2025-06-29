import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'expert' | 'admin';
  allowedRoles?: ('client' | 'expert' | 'admin')[];
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  allowedRoles,
  fallback = null,
  requireAuth = true
}) => {
  const { user, isAuthenticated } = useAuthStore();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // If a specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    return <>{fallback}</>;
  }

  // If multiple roles are allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const ClientOnly: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard requiredRole="client" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ExpertOnly: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard requiredRole="expert" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOnly: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard requiredRole="admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AuthenticatedOnly: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard allowedRoles={['client', 'expert', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Hook for role checking in components
export const useRoleCheck = () => {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = (role: 'client' | 'expert' | 'admin') => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: ('client' | 'expert' | 'admin')[]) => {
    return isAuthenticated && user && roles.includes(user.role);
  };

  const isClient = () => hasRole('client');
  const isExpert = () => hasRole('expert');
  const isAdmin = () => hasRole('admin');

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isClient,
    isExpert,
    isAdmin
  };
};
