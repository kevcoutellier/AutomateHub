import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, AlertTriangle } from 'lucide-react';

interface RankingOption {
  id: string;
  label: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  icon: string;
}

interface RankingInputProps {
  title: string;
  description: string;
  options: RankingOption[];
  values: string[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
}

export const RankingInput: React.FC<RankingInputProps> = ({
  title,
  description,
  options,
  values,
  onChange,
  maxSelections = 5
}) => {
  const [selectedItems, setSelectedItems] = useState<RankingOption[]>(
    values.map(id => options.find(opt => opt.id === id)).filter(Boolean) as RankingOption[]
  );

  const availableOptions = options.filter(opt => !values.includes(opt.id));

  const handleAddItem = (option: RankingOption) => {
    if (selectedItems.length < maxSelections) {
      const newSelected = [...selectedItems, option];
      setSelectedItems(newSelected);
      onChange(newSelected.map(item => item.id));
    }
  };

  const handleRemoveItem = (optionId: string) => {
    const newSelected = selectedItems.filter(item => item.id !== optionId);
    setSelectedItems(newSelected);
    onChange(newSelected.map(item => item.id));
  };

  const handleReorder = (newOrder: RankingOption[]) => {
    setSelectedItems(newOrder);
    onChange(newOrder.map(item => item.id));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-error-600 bg-error-100';
      case 'Medium': return 'text-warning-600 bg-warning-100';
      case 'Low': return 'text-success-600 bg-success-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-sm text-gray-500">
          Selected: {selectedItems.length}/{maxSelections} (drag to reorder by priority)
        </p>
      </div>

      {/* Selected Items (Draggable) */}
      {selectedItems.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Your Priority Ranking:</h4>
          <Reorder.Group
            axis="y"
            values={selectedItems}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {selectedItems.map((item, index) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="bg-white border-2 border-primary-200 rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-medium"
                whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="text-2xl">{item.icon}</div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="font-semibold text-gray-900">{item.label}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(item.impact)}`}>
                        {item.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-error-500 transition-colors duration-200"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Available Options */}
      {availableOptions.length > 0 && selectedItems.length < maxSelections && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">
            {selectedItems.length === 0 ? 'Select your biggest challenges:' : 'Add more challenges:'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableOptions.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-25 transition-all duration-200 text-left"
                onClick={() => handleAddItem(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xl">{option.icon}</div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{option.label}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(option.impact)}`}>
                        {option.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {selectedItems.length >= maxSelections && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <p className="text-warning-800 text-sm">
            You've selected the maximum number of challenges. Remove some to add others, or continue to the next section.
          </p>
        </div>
      )}
    </div>
  );
};