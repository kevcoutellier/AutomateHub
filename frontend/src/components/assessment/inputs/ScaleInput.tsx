import React from 'react';
import { motion } from 'framer-motion';

interface ScaleOption {
  value: number;
  label: string;
  description: string;
  emoji: string;
  color: 'success' | 'warning' | 'error';
  impact?: string;
  approach?: string;
}

interface ScaleInputProps {
  title: string;
  description: string;
  options: ScaleOption[];
  value?: number;
  onChange: (value: number) => void;
  showImpact?: boolean;
  showApproach?: boolean;
}

export const ScaleInput: React.FC<ScaleInputProps> = ({
  title,
  description,
  options,
  value,
  onChange,
  showImpact = false,
  showApproach = false
}) => {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'border-2 transition-all duration-300';
    
    if (isSelected) {
      switch (color) {
        case 'success':
          return `${baseClasses} border-success-500 bg-success-50 shadow-glow-green`;
        case 'warning':
          return `${baseClasses} border-warning-500 bg-warning-50 shadow-glow-orange`;
        case 'error':
          return `${baseClasses} border-error-500 bg-error-50`;
        default:
          return `${baseClasses} border-primary-500 bg-primary-50 shadow-glow`;
      }
    }
    
    return `${baseClasses} border-gray-200 bg-white hover:border-primary-300 hover:shadow-medium`;
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl text-center cursor-pointer ${getColorClasses(option.color, value === option.value)}`}
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-3xl mb-2">{option.emoji}</div>
            <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
            <div className="text-sm text-gray-600">{option.description}</div>
          </motion.button>
        ))}
      </div>

      {/* Additional Information */}
      {selectedOption && (showImpact || showApproach) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          {showImpact && selectedOption.impact && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Impact Assessment:</h4>
              <p className="text-gray-700">{selectedOption.impact}</p>
            </div>
          )}
          
          {showApproach && selectedOption.approach && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recommended Approach:</h4>
              <p className="text-gray-700">{selectedOption.approach}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};