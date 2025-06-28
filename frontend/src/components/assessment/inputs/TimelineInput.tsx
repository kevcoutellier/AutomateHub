import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';

interface TimelineOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  details: string;
  complexity: string;
  scope: string;
}

interface TimelineInputProps {
  title: string;
  description: string;
  options: TimelineOption[];
  value?: string;
  onChange: (value: string) => void;
}

export const TimelineInput: React.FC<TimelineInputProps> = ({
  title,
  description,
  options,
  value,
  onChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              value === option.value
                ? 'border-primary-500 bg-primary-50 shadow-glow'
                : 'border-gray-200 hover:border-primary-300 bg-white hover:shadow-medium'
            }`}
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Selection Indicator */}
            {value === option.value && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-3xl">{option.icon}</div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{option.label}</h4>
                  <span className="text-sm text-gray-500">({option.description})</span>
                </div>
                
                <p className="text-gray-600 mb-4">{option.details}</p>

                {/* Timeline Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Complexity</span>
                    </div>
                    <span className="text-sm text-gray-600">{option.complexity}</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Scope</span>
                    </div>
                    <span className="text-sm text-gray-600">{option.scope}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};