import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  popular?: boolean;
}

interface Category {
  category: string;
  tools?: SelectOption[];
  metrics?: SelectOption[];
}

interface MultiSelectProps {
  title: string;
  description: string;
  categories: Category[];
  values: string[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
  showPopularBadge?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  title,
  description,
  categories,
  values,
  onChange,
  maxSelections,
  showPopularBadge = false
}) => {
  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else if (!maxSelections || values.length < maxSelections) {
      onChange([...values, value]);
    }
  };

  const isSelected = (value: string) => values.includes(value);
  const isDisabled = (value: string) => 
    !isSelected(value) && maxSelections && values.length >= maxSelections;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        {maxSelections && (
          <p className="text-sm text-gray-500">
            Selected: {values.length}/{maxSelections}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-gray-800">{category.category}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(category.tools || category.metrics || []).map((option, optionIndex) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (categoryIndex * 0.1) + (optionIndex * 0.05) }}
                  className={`relative p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    isSelected(option.value)
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : isDisabled(option.value)
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-25 text-gray-700'
                  }`}
                  onClick={() => !isDisabled(option.value) && handleToggle(option.value)}
                  disabled={isDisabled(option.value)}
                  whileHover={!isDisabled(option.value) ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled(option.value) ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected(option.value)
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected(option.value) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    
                    {option.popular && showPopularBadge && (
                      <div className="flex items-center gap-1 text-xs text-warning-600 bg-warning-100 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3" />
                        <span>Popular</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};