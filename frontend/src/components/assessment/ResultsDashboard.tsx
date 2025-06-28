import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle, 
  ArrowRight,
  MessageCircle,
  Calendar,
  Download,
  Users,
  Zap
} from 'lucide-react';
import { AssessmentData } from '../../types/assessment';

interface ResultsDashboardProps {
  assessmentData: AssessmentData;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  assessmentData
}) => {
  // Calculate automation readiness score
  const calculateReadinessScore = () => {
    let score = 0;
    let maxScore = 100;

    // Business Context (25%)
    const businessContext = assessmentData['business-context'] || {};
    if (businessContext.companySize) score += 6;
    if (businessContext.industry) score += 6;
    if (businessContext.currentTools?.length > 0) score += 8;
    if (businessContext.growthStage) score += 5;

    // Pain Points (30%)
    const painPoints = assessmentData['pain-points'] || {};
    if (painPoints.timeSpent) score += Math.min(painPoints.timeSpent / 40 * 10, 10);
    if (painPoints.errorFrequency) score += painPoints.errorFrequency * 2;
    if (painPoints.processBottlenecks?.length > 0) score += Math.min(painPoints.processBottlenecks.length * 2, 8);
    if (painPoints.growthBarrier) score += 5;
    if (painPoints.teamFrustration) score += painPoints.teamFrustration;

    // Goals (25%)
    const goals = assessmentData['goals'] || {};
    if (goals.primaryGoal) score += 8;
    if (goals.successMetrics?.length > 0) score += Math.min(goals.successMetrics.length * 2, 8);
    if (goals.timeline) score += 5;
    if (goals.budget) score += 4;

    // Technical (20%)
    const technical = assessmentData['technical'] || {};
    if (technical.technicalResources) score += 7;
    if (technical.dataQuality) score += technical.dataQuality * 2;
    if (technical.changeReadiness) score += technical.changeReadiness * 2;

    return Math.min(Math.round(score), 100);
  };

  const readinessScore = calculateReadinessScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-primary-600';
    if (score >= 40) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent - Ready for advanced automation';
    if (score >= 60) return 'Good - Great automation potential';
    if (score >= 40) return 'Fair - Automation will provide significant benefits';
    return 'Getting Started - Perfect time to begin automation journey';
  };

  // Generate opportunities based on assessment data
  const generateOpportunities = () => {
    const painPoints = assessmentData['pain-points'] || {};
    const goals = assessmentData['goals'] || {};
    const businessContext = assessmentData['business-context'] || {};

    const opportunities = [];

    // High time investment opportunity
    if (painPoints.timeSpent >= 15) {
      opportunities.push({
        title: 'High-Impact Time Automation',
        description: 'Automate your most time-consuming manual processes',
        currentState: `${painPoints.timeSpent} hours/week spent on manual tasks`,
        futureState: 'Automated workflows reducing manual work by 70-80%',
        timeSavings: Math.round(painPoints.timeSpent * 0.75),
        costSavings: Math.round(painPoints.timeSpent * 0.75 * 25 * 52),
        complexity: painPoints.timeSpent >= 25 ? 'Medium' : 'Low',
        timeline: '2-4 weeks',
        priority: 'High'
      });
    }

    // Error reduction opportunity
    if (painPoints.errorFrequency >= 3) {
      opportunities.push({
        title: 'Error-Prevention Workflows',
        description: 'Implement validation and approval workflows',
        currentState: 'Frequent manual errors impacting quality',
        futureState: 'Automated validation preventing 90%+ of errors',
        timeSavings: 5,
        costSavings: 25000,
        complexity: 'Medium',
        timeline: '1-3 weeks',
        priority: 'High'
      });
    }

    // Tool integration opportunity
    if (businessContext.currentTools?.length >= 3) {
      opportunities.push({
        title: 'Tool Integration Hub',
        description: 'Connect your existing tools to eliminate data silos',
        currentState: 'Manual data transfer between systems',
        futureState: 'Seamless data flow between all platforms',
        timeSavings: 10,
        costSavings: 15000,
        complexity: 'Medium',
        timeline: '3-6 weeks',
        priority: 'Medium'
      });
    }

    return opportunities.slice(0, 3); // Return top 3 opportunities
  };

  const opportunities = generateOpportunities();

  // Mock expert recommendations
  const expertRecommendations = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'E-commerce Automation Specialist',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      rating: 4.9,
      projectsCompleted: 47,
      compatibilityScore: 95,
      specialties: ['Shopify Integration', 'Multi-platform Sync', 'Data Analytics'],
      approach: 'Focus on high-impact workflows first, then expand systematically',
      availability: 'Available this week',
      estimatedCost: '$3,500 - $5,000'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      title: 'Enterprise Integration Expert',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      rating: 5.0,
      projectsCompleted: 63,
      compatibilityScore: 88,
      specialties: ['Salesforce Integration', 'API Development', 'Enterprise Workflows'],
      approach: 'Comprehensive automation strategy with phased implementation',
      availability: 'Available next week',
      estimatedCost: '$5,000 - $8,000'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Automation Assessment Results
          </h1>
          <p className="text-xl text-gray-600">
            Here's your personalized automation roadmap and expert recommendations
          </p>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* Readiness Score */}
            <div className="text-center lg:text-left">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(readinessScore)} text-white`}>
                {readinessScore}
              </div>
              <div className="text-xl font-semibold mb-2">Automation Readiness</div>
              <div className="text-primary-100 text-sm">
                {getScoreDescription(readinessScore)}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:col-span-3">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">{opportunities[0]?.timeSavings || 0} hrs/week</div>
                <div className="text-primary-100 text-sm">Potential Time Savings</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">${(opportunities[0]?.costSavings || 0).toLocaleString()}</div>
                <div className="text-primary-100 text-sm">Annual Savings Potential</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">{opportunities[0]?.timeline || 'N/A'}</div>
                <div className="text-primary-100 text-sm">Implementation Timeline</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Opportunities */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            Your Automation Opportunities
          </motion.h2>

          <div className="space-y-6">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-medium border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                    <p className="text-gray-600">{opportunity.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    opportunity.priority === 'High' ? 'bg-error-100 text-error-800' :
                    opportunity.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                    'bg-success-100 text-success-800'
                  }`}>
                    {opportunity.priority} Priority
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Current State</h4>
                    <p className="text-gray-600 text-sm">{opportunity.currentState}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Future State</h4>
                    <p className="text-gray-600 text-sm">{opportunity.futureState}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-success-600">{opportunity.timeSavings}hrs/week</div>
                    <div className="text-xs text-gray-500">Time Savings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary-600">${opportunity.costSavings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Annual Savings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-secondary-600">{opportunity.complexity}</div>
                    <div className="text-xs text-gray-500">Complexity</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-warning-600">{opportunity.timeline}</div>
                    <div className="text-xs text-gray-500">Timeline</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Expert Recommendations */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            Recommended Experts for Your Project
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {expertRecommendations.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-medium border border-gray-100"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{expert.title}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning-500 fill-current" />
                        <span>{expert.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                        <span>{expert.projectsCompleted} projects</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{expert.compatibilityScore}%</div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {expert.specialties.map((specialty, i) => (
                        <span key={i} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Approach</h4>
                    <p className="text-gray-600 text-sm">{expert.approach}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Availability:</span>
                    <div className="font-medium text-success-600">{expert.availability}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Estimated Cost:</span>
                    <div className="font-medium text-gray-900">{expert.estimatedCost}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-sm">
                    View Full Profile
                  </button>
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6">Ready to Get Started?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">1. Connect with Expert</h3>
              <p className="text-gray-300 text-sm">Schedule a consultation with your matched expert</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">2. Define Scope</h3>
              <p className="text-gray-300 text-sm">Finalize requirements and project timeline</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">3. Start Automation</h3>
              <p className="text-gray-300 text-sm">Begin implementation and see immediate results</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow-orange flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span>Schedule Free Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white border border-white border-opacity-30 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3">
              <Download className="w-5 h-5" />
              <span>Download Full Report</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};