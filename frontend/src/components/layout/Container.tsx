import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',      // 640px - mobile content
    md: 'max-w-3xl',      // 768px - forms, narrow content
    lg: 'max-w-4xl',      // 1024px - main content
    xl: 'max-w-7xl',      // 1280px - full sections
    full: 'max-w-none'    // No limit
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};