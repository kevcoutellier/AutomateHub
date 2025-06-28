import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'soft' | 'medium' | 'strong';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'medium',
  onClick
}) => {
  const baseClasses = 'bg-white border border-gray-100 transition-all duration-300';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong'
  };

  const hoverClasses = hover 
    ? 'hover:shadow-strong hover:-translate-y-1 hover:border-primary-200 cursor-pointer' 
    : '';

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <Component
      className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} rounded-xl ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};