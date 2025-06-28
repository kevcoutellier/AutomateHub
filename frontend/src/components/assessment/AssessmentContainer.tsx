import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressIndicator } from './ProgressIndicator';
import { BusinessContextSection } from './sections/BusinessContextSection';
import { PainPointSection } from './sections/PainPointSection';
import { GoalsSection } from './sections/GoalsSection';
import { TechnicalSection } from './sections/TechnicalSection';
import { ResultsDashboard } from './ResultsDashboard';
import { NavigationControls } from './NavigationControls';
import { AssessmentData, AssessmentSection } from '../../types/assessment';

const sections: AssessmentSection[] = [
  {
    id: 'business-context',
    title: 'Business Context',
    description: 'Tell us about your business foundation',
    icon: 'Building2',
    questions: 4
  },
  {
    id: 'pain-points',
    title: 'Process Challenges',
    description: 'Identify your biggest operational pain points',
    icon: 'AlertTriangle',
    questions: 5
  },
  {
    id: 'goals',
    title: 'Automation Goals',
    description: 'Define your objectives and success metrics',
    icon: 'Target',
    questions: 4
  },
  {
    id: 'technical',
    title: 'Technical Readiness',
    description: 'Assess your implementation capabilities',
    icon: 'Settings',
    questions: 3
  }
];

export const AssessmentContainer: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [showResults, setShowResults] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('assessment-progress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAssessmentData(parsed.data || {});
        setCurrentSection(parsed.section || 0);
      } catch (error) {
        console.error('Failed to load saved assessment:', error);
      }
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (Object.keys(assessmentData).length > 0) {
      localStorage.setItem('assessment-progress', JSON.stringify({
        data: assessmentData,
        section: currentSection,
        timestamp: Date.now()
      }));
    }
  }, [assessmentData, currentSection]);

  const updateAssessmentData = (sectionId: string, data: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...data }
    }));
  };

  const handleNext = async () => {
    if (currentSection < sections.length - 1) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentSection(prev => prev + 1);
      setIsTransitioning(false);
    } else {
      // Generate results
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowResults(true);
      setIsTransitioning(false);
      
      // Clear saved progress
      localStorage.removeItem('assessment-progress');
    }
  };

  const handlePrevious = async () => {
    if (currentSection > 0) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentSection(prev => prev - 1);
      setIsTransitioning(false);
    }
  };

  const handleSectionJump = async (sectionIndex: number) => {
    if (sectionIndex !== currentSection) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentSection(sectionIndex);
      setIsTransitioning(false);
    }
  };

  const getCurrentSectionData = () => {
    return assessmentData[sections[currentSection].id] || {};
  };

  const isCurrentSectionComplete = () => {
    const sectionData = getCurrentSectionData();
    const section = sections[currentSection];
    
    // Basic completion check - can be enhanced with specific validation
    return Object.keys(sectionData).length >= Math.ceil(section.questions * 0.75);
  };

  const getOverallProgress = () => {
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions, 0);
    const answeredQuestions = Object.values(assessmentData).reduce((sum, sectionData) => {
      return sum + Object.keys(sectionData).length;
    }, 0);
    
    return Math.min((answeredQuestions / totalQuestions) * 100, 100);
  };

  if (showResults) {
    return <ResultsDashboard assessmentData={assessmentData} />;
  }

  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Business Automation Assessment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your automation potential and get matched with the perfect expert
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <ProgressIndicator
          sections={sections}
          currentSection={currentSection}
          overallProgress={getOverallProgress()}
          onSectionClick={handleSectionJump}
          assessmentData={assessmentData}
        />

        {/* Section Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-medium border border-gray-100 p-8 mb-8"
              >
                {/* Section Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">
                        {currentSection + 1}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentSectionData.title}
                      </h2>
                      <p className="text-gray-600">
                        {currentSectionData.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Component */}
                {currentSection === 0 && (
                  <BusinessContextSection
                    data={getCurrentSectionData()}
                    onUpdate={(data) => updateAssessmentData('business-context', data)}
                  />
                )}
                {currentSection === 1 && (
                  <PainPointSection
                    data={getCurrentSectionData()}
                    onUpdate={(data) => updateAssessmentData('pain-points', data)}
                  />
                )}
                {currentSection === 2 && (
                  <GoalsSection
                    data={getCurrentSectionData()}
                    onUpdate={(data) => updateAssessmentData('goals', data)}
                  />
                )}
                {currentSection === 3 && (
                  <TechnicalSection
                    data={getCurrentSectionData()}
                    onUpdate={(data) => updateAssessmentData('technical', data)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isTransitioning && (
            <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-8 mb-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {showResults ? 'Generating your personalized recommendations...' : 'Loading next section...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {!isTransitioning && (
          <NavigationControls
            currentSection={currentSection}
            totalSections={sections.length}
            canProceed={isCurrentSectionComplete()}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isGeneratingResults={currentSection === sections.length - 1}
          />
        )}
      </div>
    </div>
  );
};