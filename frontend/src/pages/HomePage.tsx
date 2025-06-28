import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ProblemSolutionSection } from '../components/home/ProblemSolutionSection';
import { ProcessSection } from '../components/home/ProcessSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { ExpertShowcaseSection } from '../components/home/ExpertShowcaseSection';
import { CTASection } from '../components/home/CTASection';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSolutionSection />
      <ProcessSection />
      <TestimonialsSection />
      <ExpertShowcaseSection />
      <CTASection />
    </div>
  );
};