import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, TrendingUp } from 'lucide-react';

interface BudgetOption {
  value: string;
  range: string;
  label: string;
  description: string;
  icon: string;
  includes: string[];
  bestFor: string;
}

interface BudgetInputProps {
  title: string;
  description: string;
  options: BudgetOption[];
  value?: string;
  onChange: (value: string) => void;
  showROICalculator?: boolean;
}

export const BudgetInput: React.FC<BudgetInputProps> = ({
  title,
  description,
  options,
  value,
  onChange,
  showROICalculator = false
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{option.icon}</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{option.label}</h4>
                <p className="text-primary-600 font-semibold">{option.range}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">{option.description}</p>

            {/* Includes */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700">Includes:</p>
              <ul className="space-y-1">
                {option.includes.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Best for:</span> {option.bestFor}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ROI Calculator */}
      {showROICalculator && selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-success-50 to-primary-50 rounded-xl p-6 border border-success-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success-600" />
            <h4 className="text-lg font-semibold text-gray-900">Investment ROI Projection</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {selectedOption.range}
              </div>
              <div className="text-sm text-gray-600">Investment Range</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                3-6x
              </div>
              <div className="text-sm text-gray-600">Typical ROI</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-600">
                6-12 months
              </div>
              <div className="text-sm text-gray-600">Payback Period</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 text-center">
            <DollarSign className="w-4 h-4 inline mr-1" />
            ROI varies based on your specific automation opportunities and implementation
          </div>
        </motion.div>
      )}
    </div>
  );
};