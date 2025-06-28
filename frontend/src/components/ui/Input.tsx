import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseClasses = 'border border-gray-200 rounded-lg px-4 py-3 text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const errorClasses = error ? 'border-error-500 focus:ring-error-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const paddingClass = leftIcon ? 'pl-12' : rightIcon ? 'pr-12' : '';

  return (
    <div className={widthClass}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          className={`${baseClasses} ${errorClasses} ${paddingClass} ${widthClass} ${className}`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error-500">{error}</p>
      )}
      
      {helper && !error && (
        <p className="mt-2 text-sm text-text-muted">{helper}</p>
      )}
    </div>
  );
};