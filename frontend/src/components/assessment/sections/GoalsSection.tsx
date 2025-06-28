import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, DollarSign, TrendingUp, Heart } from 'lucide-react';
import { CardSelection } from '../inputs/CardSelection';
import { MultiSelect } from '../inputs/MultiSelect';
import { TimelineInput } from '../inputs/TimelineInput';
import { BudgetInput } from '../inputs/BudgetInput';

interface GoalsData {
  primaryGoal?: string;
  successMetrics?: string[];
  timeline?: string;
  budget?: string;
}

interface GoalsSectionProps {
  data: GoalsData;
  onUpdate: (data: Partial<GoalsData>) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  data,
  onUpdate
}) => {
  const primaryGoalOptions = [
    {
      value: 'save-time',
      label: 'Save Time',
      description: 'Focus team on high-value activities',
      icon: '⏰',
      details: 'Eliminate repetitive manual tasks',
      benefits: ['More strategic work', 'Reduced overtime', 'Better work-life balance']
    },
    {
      value: 'reduce-errors',
      label: 'Reduce Errors',
      description: 'Eliminate mistakes and inconsistencies',
      icon: '✅',
      details: 'Automated validation and workflows',
      benefits: ['Higher quality output', 'Improved customer satisfaction', 'Reduced rework']
    },
    {
      value: 'scale-operations',
      label: 'Scale Operations',
      description: 'Handle more volume without adding staff',
      icon: '📈',
      details: 'Scalable automated processes',
      benefits: ['Growth without proportional costs', 'Consistent quality at scale', 'Faster response times']
    },
    {
      value: 'improve-analytics',
      label: 'Better Analytics',
      description: 'Gain visibility into business performance',
      icon: '📊',
      details: 'Automated reporting and dashboards',
      benefits: ['Data-driven decisions', 'Real-time insights', 'Performance tracking']
    },
    {
      value: 'customer-experience',
      label: 'Enhance Customer Experience',
      description: 'Faster, more consistent service delivery',
      icon: '❤️',
      details: 'Automated customer workflows',
      benefits: ['Faster response times', 'Consistent service quality', 'Proactive communication']
    }
  ];

  const successMetricsCategories = [
    {
      category: 'Time & Efficiency',
      metrics: [
        { value: 'time-savings', label: 'Hours saved per week', popular: true },
        { value: 'response-time', label: 'Faster response times' },
        { value: 'processing-speed', label: 'Faster processing speed' },
        { value: 'cycle-time', label: 'Reduced cycle times' }
      ]
    },
    {
      category: 'Quality & Accuracy',
      metrics: [
        { value: 'error-reduction', label: 'Reduction in errors', popular: true },
        { value: 'consistency', label: 'Process consistency' },
        { value: 'compliance', label: 'Compliance adherence' },
        { value: 'quality-scores', label: 'Quality score improvements' }
      ]
    },
    {
      category: 'Financial Impact',
      metrics: [
        { value: 'cost-savings', label: 'Cost savings', popular: true },
        { value: 'revenue-increase', label: 'Revenue increase' },
        { value: 'roi', label: 'Return on investment' },
        { value: 'profit-margins', label: 'Improved profit margins' }
      ]
    },
    {
      category: 'Customer & Team',
      metrics: [
        { value: 'customer-satisfaction', label: 'Customer satisfaction', popular: true },
        { value: 'employee-satisfaction', label: 'Employee satisfaction' },
        { value: 'customer-retention', label: 'Customer retention' },
        { value: 'team-productivity', label: 'Team productivity' }
      ]
    }
  ];

  const timelineOptions = [
    {
      value: 'immediate',
      label: 'Immediate Results',
      description: 'Within 2 weeks',
      icon: '🚨',
      details: 'Simple workflow automation only',
      complexity: 'Low',
      scope: 'Single process automation'
    },
    {
      value: 'short-term',
      label: 'Short Term',
      description: 'Within 1 month',
      icon: '📅',
      details: 'Basic multi-step workflows',
      complexity: 'Medium',
      scope: 'Department-level automation'
    },
    {
      value: 'medium-term',
      label: 'Medium Term',
      description: 'Within 3 months',
      icon: '📊',
      details: 'Comprehensive automation suite',
      complexity: 'High',
      scope: 'Cross-department integration'
    },
    {
      value: 'long-term',
      label: 'Long Term',
      description: '6+ months',
      icon: '🗓️',
      details: 'Enterprise-wide transformation',
      complexity: 'Very High',
      scope: 'Complete business automation'
    }
  ];

  const budgetRanges = [
    {
      value: 'small',
      range: '$500 - $2,000',
      label: 'Simple Automation',
      description: 'Single workflow automation',
      icon: '💡',
      includes: ['Basic workflow setup', 'Simple integrations', 'Documentation'],
      bestFor: 'Small teams, single process'
    },
    {
      value: 'medium',
      range: '$2,000 - $5,000',
      label: 'Multi-Workflow System',
      description: 'Connected automation workflows',
      icon: '⚙️',
      includes: ['Multiple workflows', 'Advanced integrations', 'Training & support'],
      bestFor: 'Growing businesses, multiple processes'
    },
    {
      value: 'large',
      range: '$5,000 - $15,000',
      label: 'Comprehensive Suite',
      description: 'Department-wide automation',
      icon: '🏢',
      includes: ['Complex workflows', 'Custom integrations', 'Ongoing optimization'],
      bestFor: 'Established companies, full departments'
    },
    {
      value: 'enterprise',
      range: '$15,000+',
      label: 'Enterprise Transformation',
      description: 'Company-wide automation',
      icon: '🏭',
      includes: ['Enterprise workflows', 'Custom development', 'Dedicated support'],
      bestFor: 'Large organizations, complete transformation'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardSelection
          title="What's your primary goal for business automation?"
          description="This helps us focus on the most impactful solutions for your business"
          options={primaryGoalOptions}
          value={data.primaryGoal}
          onChange={(value) => onUpdate({ primaryGoal: value })}
          columns={1}
          showBenefits
        />
      </motion.div>

      {/* Success Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <MultiSelect
          title="How will you measure automation success?"
          description="Select all metrics that matter to your business"
          categories={successMetricsCategories}
          values={data.successMetrics || []}
          onChange={(values) => onUpdate({ successMetrics: values })}
          maxSelections={6}
          showPopularBadge
        />
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TimelineInput
          title="When do you need to see automation results?"
          description="Timeline affects scope and complexity of recommended solutions"
          options={timelineOptions}
          value={data.timeline}
          onChange={(value) => onUpdate({ timeline: value })}
        />
      </motion.div>

      {/* Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <BudgetInput
          title="What's your anticipated investment range for automation?"
          description="Budget helps us recommend the right scope and expert match"
          options={budgetRanges}
          value={data.budget}
          onChange={(value) => onUpdate({ budget: value })}
          showROICalculator
        />
      </motion.div>
    </div>
  );
};