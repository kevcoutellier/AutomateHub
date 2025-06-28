import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';

interface ROICalculation {
  weeklySavings: number;
  annualSavings: number;
  automationCost: number;
}

interface SliderInputProps {
  title: string;
  description: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  formatValue?: (value: number) => string;
  impactDescription?: string;
  impactColor?: string;
  showROIEstimate?: boolean;
  roiCalculation?: (value: number) => ROICalculation;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  title,
  description,
  min,
  max,
  step,
  value,
  onChange,
  suffix = '',
  formatValue,
  impactDescription,
  impactColor = 'text-gray-600',
  showROIEstimate = false,
  roiCalculation
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${suffix}`;
  const roi = roiCalculation ? roiCalculation(value) : null;
  const paybackMonths = roi ? Math.ceil(roi.automationCost / (roi.weeklySavings * 4)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
            }}
          />
          
          {/* Value Display */}
          <motion.div
            className="absolute -top-12 bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-semibold"
            style={{
              left: `calc(${((value - min) / (max - min)) * 100}% - 20px)`
            }}
            animate={{
              left: `calc(${((value - min) / (max - min)) * 100}% - 20px)`
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {displayValue}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary-600"></div>
          </motion.div>
        </div>

        {/* Range Labels */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>{min}{suffix}</span>
          <span>{max}+{suffix}</span>
        </div>

        {/* Impact Description */}
        {impactDescription && (
          <div className={`text-center font-medium ${impactColor}`}>
            {impactDescription}
          </div>
        )}

        {/* ROI Estimate */}
        {showROIEstimate && roi && value > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-success-50 to-primary-50 rounded-xl p-6 border border-success-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success-600" />
              <h4 className="text-lg font-semibold text-gray-900">Automation ROI Estimate</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  ${roi.weeklySavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Weekly Savings</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  ${roi.annualSavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Annual Savings</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">
                  {paybackMonths} months
                </div>
                <div className="text-sm text-gray-600">Payback Period</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 text-center">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Estimated automation cost: ${roi.automationCost.toLocaleString()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};