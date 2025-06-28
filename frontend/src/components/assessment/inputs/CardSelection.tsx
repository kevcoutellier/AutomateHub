import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface CardOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  details?: string;
  benefits?: string[];
  approach?: string;
}

interface CardSelectionProps {
  title: string;
  description: string;
  options: CardOption[];
  value?: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
  showBenefits?: boolean;
  showDetails?: boolean;
}

export const CardSelection: React.FC<CardSelectionProps> = ({
  title,
  description,
  options,
  value,
  onChange,
  columns = 2,
  showBenefits = false,
  showDetails = false
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
        {options.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              value === option.value
                ? 'border-primary-500 bg-primary-50 shadow-glow'
                : 'border-gray-200 hover:border-primary-300 bg-white hover:shadow-medium'
            }`}
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selection Indicator */}
            {value === option.value && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-4">{option.icon}</div>

            {/* Content */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{option.label}</h4>
              <p className="text-gray-600 mb-4">{option.description}</p>
              
              {option.details && showDetails && (
                <p className="text-sm text-primary-700 mb-3 font-medium">{option.details}</p>
              )}

              {option.approach && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Approach:</span> {option.approach}
                  </p>
                </div>
              )}

              {option.benefits && showBenefits && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Key Benefits:</p>
                  <ul className="space-y-1">
                    {option.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};