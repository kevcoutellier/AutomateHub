import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { AssessmentSection, AssessmentData } from '../../types/assessment';

interface ProgressIndicatorProps {
  sections: AssessmentSection[];
  currentSection: number;
  overallProgress: number;
  onSectionClick: (index: number) => void;
  assessmentData: AssessmentData;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  sections,
  currentSection,
  overallProgress,
  onSectionClick,
  assessmentData
}) => {
  const getSectionProgress = (sectionId: string, questionCount: number) => {
    const sectionData = assessmentData[sectionId] || {};
    const answeredQuestions = Object.keys(sectionData).length;
    return Math.min((answeredQuestions / questionCount) * 100, 100);
  };

  const isSectionComplete = (sectionId: string, questionCount: number) => {
    return getSectionProgress(sectionId, questionCount) >= 75;
  };

  const isSectionAccessible = (index: number) => {
    // Current section is always accessible
    if (index === currentSection) return true;
    
    // Previous sections are always accessible
    if (index < currentSection) return true;
    
    // Next section is accessible if current section is mostly complete
    if (index === currentSection + 1) {
      const currentSectionData = assessmentData[sections[currentSection].id] || {};
      return Object.keys(currentSectionData).length >= Math.ceil(sections[currentSection].questions * 0.5);
    }
    
    return false;
  };

  return (
    <div className="mb-8">
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(overallProgress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Section Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section, index) => {
          const progress = getSectionProgress(section.id, section.questions);
          const isComplete = isSectionComplete(section.id, section.questions);
          const isCurrent = index === currentSection;
          const isAccessible = isSectionAccessible(index);
          
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? 'border-primary-500 bg-primary-50 shadow-glow'
                  : isComplete
                  ? 'border-success-300 bg-success-50 hover:border-success-400'
                  : isAccessible
                  ? 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-medium'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
              onClick={() => isAccessible && onSectionClick(index)}
              whileHover={isAccessible ? { scale: 1.02 } : {}}
              whileTap={isAccessible ? { scale: 0.98 } : {}}
            >
              {/* Section Number/Status */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isComplete
                    ? 'bg-success-500 text-white'
                    : isCurrent
                    ? 'bg-primary-500 text-white'
                    : isAccessible
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Progress Circle */}
                <div className="relative w-6 h-6">
                  <Circle className="w-6 h-6 text-gray-200" />
                  <motion.div
                    className="absolute inset-0"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: -90 }}
                  >
                    <svg className="w-6 h-6 transform -rotate-90">
                      <motion.circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke={isComplete ? '#10b981' : isCurrent ? '#3b82f6' : '#d1d5db'}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 10 }}
                        animate={{ 
                          strokeDashoffset: 2 * Math.PI * 10 * (1 - progress / 100)
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Section Info */}
              <div>
                <h3 className={`text-sm font-semibold mb-1 ${
                  isCurrent ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {section.title}
                </h3>
                <p className={`text-xs ${
                  isCurrent ? 'text-primary-700' : 'text-gray-600'
                }`}>
                  {section.questions} questions
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <motion.div
                    className={`h-1 rounded-full ${
                      isComplete
                        ? 'bg-success-500'
                        : isCurrent
                        ? 'bg-primary-500'
                        : 'bg-gray-300'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Current Section Indicator */}
              {isCurrent && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};