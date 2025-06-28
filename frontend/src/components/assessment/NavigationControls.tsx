import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

interface NavigationControlsProps {
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isGeneratingResults?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentSection,
  totalSections,
  canProceed,
  onNext,
  onPrevious,
  isGeneratingResults = false
}) => {
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  return (
    <div className="flex items-center justify-between">
      {/* Previous Button */}
      <motion.button
        onClick={onPrevious}
        disabled={isFirstSection}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
          isFirstSection
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
        }`}
        whileHover={!isFirstSection ? { scale: 1.02 } : {}}
        whileTap={!isFirstSection ? { scale: 0.98 } : {}}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Previous</span>
      </motion.button>

      {/* Section Indicator */}
      <div className="text-sm text-gray-500">
        Section {currentSection + 1} of {totalSections}
      </div>

      {/* Next/Generate Results Button */}
      <motion.button
        onClick={onNext}
        disabled={!canProceed}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
          canProceed
            ? isLastSection
              ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-glow-orange'
              : 'bg-primary-500 hover:bg-primary-600 text-white shadow-glow'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={canProceed ? { scale: 1.02 } : {}}
        whileTap={canProceed ? { scale: 0.98 } : {}}
      >
        {isLastSection ? (
          <>
            <Zap className="w-5 h-5" />
            <span>{isGeneratingResults ? 'Generating Results...' : 'Generate Results'}</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </div>
  );
};