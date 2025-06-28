import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-soft hover:shadow-glow-orange focus:ring-secondary-500 hover:scale-105',
    secondary: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500 hover:scale-105',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-primary-500 shadow-soft'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>
  );
};