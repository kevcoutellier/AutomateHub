import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, TrendingDown, Users } from 'lucide-react';
import { SliderInput } from '../inputs/SliderInput';
import { ScaleInput } from '../inputs/ScaleInput';
import { RankingInput } from '../inputs/RankingInput';
import { CardSelection } from '../inputs/CardSelection';

interface PainPointData {
  timeSpent?: number;
  errorFrequency?: number;
  processBottlenecks?: string[];
  growthBarrier?: string;
  teamFrustration?: number;
}

interface PainPointSectionProps {
  data: PainPointData;
  onUpdate: (data: Partial<PainPointData>) => void;
}

export const PainPointSection: React.FC<PainPointSectionProps> = ({
  data,
  onUpdate
}) => {
  const errorFrequencyOptions = [
    {
      value: 1,
      label: 'Rarely',
      description: 'Less than once per month',
      emoji: '😊',
      color: 'success'
    },
    {
      value: 2,
      label: 'Occasionally',
      description: '2-3 times per month',
      emoji: '😐',
      color: 'warning'
    },
    {
      value: 3,
      label: 'Frequently',
      description: 'Weekly occurrences',
      emoji: '😟',
      color: 'warning'
    },
    {
      value: 4,
      label: 'Often',
      description: 'Multiple times per week',
      emoji: '😰',
      color: 'error'
    },
    {
      value: 5,
      label: 'Constantly',
      description: 'Daily or multiple daily',
      emoji: '😫',
      color: 'error'
    }
  ];

  const bottleneckOptions = [
    {
      id: 'data-entry',
      label: 'Data Entry & Transfer',
      description: 'Manual data input between systems',
      impact: 'High',
      icon: '📝'
    },
    {
      id: 'customer-communication',
      label: 'Customer Communication',
      description: 'Follow-ups, responses, updates',
      impact: 'High',
      icon: '💬'
    },
    {
      id: 'reporting',
      label: 'Report Generation',
      description: 'Creating and distributing reports',
      impact: 'Medium',
      icon: '📊'
    },
    {
      id: 'inventory-management',
      label: 'Inventory Management',
      description: 'Stock tracking and updates',
      impact: 'High',
      icon: '📦'
    },
    {
      id: 'lead-qualification',
      label: 'Lead Qualification',
      description: 'Scoring and nurturing prospects',
      impact: 'High',
      icon: '🎯'
    },
    {
      id: 'invoicing',
      label: 'Billing & Invoicing',
      description: 'Payment processing workflows',
      impact: 'Medium',
      icon: '💰'
    },
    {
      id: 'project-management',
      label: 'Project Tracking',
      description: 'Status updates and coordination',
      impact: 'Medium',
      icon: '📋'
    },
    {
      id: 'compliance',
      label: 'Quality & Compliance',
      description: 'Audit trails and documentation',
      impact: 'Medium',
      icon: '✅'
    }
  ];

  const growthBarrierOptions = [
    {
      value: 'time-strategy',
      label: 'Not Enough Strategic Time',
      description: 'Team stuck in operational tasks',
      icon: '⏰',
      details: 'Focus on time-saving automation'
    },
    {
      value: 'scaling-manual',
      label: 'Manual Work Doesn\'t Scale',
      description: 'Volume growth creates bottlenecks',
      icon: '📈',
      details: 'Implement scalable processes'
    },
    {
      value: 'quality-errors',
      label: 'Errors Hurt Quality',
      description: 'Inconsistencies damage reputation',
      icon: '⚠️',
      details: 'Error-prevention workflows needed'
    },
    {
      value: 'performance-tracking',
      label: 'Can\'t Track Performance',
      description: 'Lack of visibility into metrics',
      icon: '📊',
      details: 'Analytics and reporting automation'
    },
    {
      value: 'wrong-activities',
      label: 'Team on Wrong Activities',
      description: 'High-value people doing low-value work',
      icon: '🎯',
      details: 'Workflow optimization needed'
    }
  ];

  const teamFrustrationOptions = [
    {
      value: 1,
      label: 'Content',
      description: 'Team is fine with current workflows',
      emoji: '😊',
      color: 'success'
    },
    {
      value: 2,
      label: 'Minor Complaints',
      description: 'Some grumbling about repetitive tasks',
      emoji: '😐',
      color: 'warning'
    },
    {
      value: 3,
      label: 'Regular Frustration',
      description: 'Frequent complaints about manual work',
      emoji: '😟',
      color: 'warning'
    },
    {
      value: 4,
      label: 'Actively Seeking Solutions',
      description: 'Team asking for automation tools',
      emoji: '😤',
      color: 'error'
    },
    {
      value: 5,
      label: 'Refusing Manual Tasks',
      description: 'Team pushback on repetitive work',
      emoji: '😡',
      color: 'error'
    }
  ];

  const getTimeImpactDescription = (hours: number) => {
    if (hours <= 5) return 'Minimal automation opportunity';
    if (hours <= 15) return 'Moderate efficiency gains possible';
    if (hours <= 25) return 'Significant automation potential';
    return 'High-impact automation opportunity';
  };

  const getTimeImpactColor = (hours: number) => {
    if (hours <= 5) return 'text-gray-600';
    if (hours <= 15) return 'text-warning-600';
    if (hours <= 25) return 'text-secondary-600';
    return 'text-error-600';
  };

  return (
    <div className="space-y-8">
      {/* Time Investment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SliderInput
          title="How many hours per week does your team spend on repetitive manual tasks?"
          description="Include data entry, report generation, follow-ups, and other routine work"
          min={0}
          max={40}
          step={2}
          value={data.timeSpent || 0}
          onChange={(value) => onUpdate({ timeSpent: value })}
          suffix=" hours/week"
          formatValue={(value) => `${value} hours/week`}
          impactDescription={getTimeImpactDescription(data.timeSpent || 0)}
          impactColor={getTimeImpactColor(data.timeSpent || 0)}
          showROIEstimate
          roiCalculation={(hours) => ({
            weeklySavings: hours * 25, // $25/hour average
            annualSavings: hours * 25 * 52,
            automationCost: Math.min(hours * 100, 5000) // Rough automation cost estimate
          })}
        />
      </motion.div>

      {/* Error Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ScaleInput
          title="How often do manual errors in your processes cause problems?"
          description="Consider data entry mistakes, missed follow-ups, incorrect calculations"
          options={errorFrequencyOptions}
          value={data.errorFrequency}
          onChange={(value) => onUpdate({ errorFrequency: value })}
        />
      </motion.div>

      {/* Process Bottlenecks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <RankingInput
          title="Rank these business challenges by their impact on your operations"
          description="Drag to reorder - most impactful at the top"
          options={bottleneckOptions}
          values={data.processBottlenecks || []}
          onChange={(values) => onUpdate({ processBottlenecks: values })}
          maxSelections={5}
        />
      </motion.div>

      {/* Growth Barrier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardSelection
          title="What's the biggest barrier preventing your business from growing faster?"
          description="This helps us prioritize the right automation approach"
          options={growthBarrierOptions}
          value={data.growthBarrier}
          onChange={(value) => onUpdate({ growthBarrier: value })}
          columns={1}
        />
      </motion.div>

      {/* Team Frustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ScaleInput
          title="How does your team feel about current manual processes?"
          description="Team buy-in is crucial for successful automation adoption"
          options={teamFrustrationOptions}
          value={data.teamFrustration}
          onChange={(value) => onUpdate({ teamFrustration: value })}
        />
      </motion.div>
    </div>
  );
};