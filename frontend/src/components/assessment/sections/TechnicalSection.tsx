import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Users, Zap } from 'lucide-react';
import { CardSelection } from '../inputs/CardSelection';
import { ScaleInput } from '../inputs/ScaleInput';

interface TechnicalData {
  technicalResources?: string;
  dataQuality?: number;
  changeReadiness?: number;
}

interface TechnicalSectionProps {
  data: TechnicalData;
  onUpdate: (data: Partial<TechnicalData>) => void;
}

export const TechnicalSection: React.FC<TechnicalSectionProps> = ({
  data,
  onUpdate
}) => {
  const technicalResourceOptions = [
    {
      value: 'no-tech',
      label: 'No Technical Team',
      description: 'Need full-service implementation',
      icon: '🤝',
      details: 'Complete setup and management included',
      approach: 'Full-service automation with ongoing support'
    },
    {
      value: 'basic-tech',
      label: 'Basic Tech-Savvy Team',
      description: 'Can handle simple tasks with guidance',
      icon: '🎓',
      details: 'Guided implementation with training',
      approach: 'Collaborative setup with comprehensive training'
    },
    {
      value: 'experienced-tech',
      label: 'Experienced Technical Staff',
      description: 'Can collaborate on implementation',
      icon: '⚙️',
      details: 'Technical partnership approach',
      approach: 'Joint implementation with knowledge transfer'
    },
    {
      value: 'dedicated-it',
      label: 'Dedicated IT Department',
      description: 'Full technical capabilities in-house',
      icon: '🏢',
      details: 'Technical consultation and architecture',
      approach: 'Strategic guidance and advanced automation'
    }
  ];

  const dataQualityOptions = [
    {
      value: 1,
      label: 'Scattered',
      description: 'Data is everywhere, no organization',
      emoji: '😵',
      color: 'error',
      impact: 'Requires significant data cleanup'
    },
    {
      value: 2,
      label: 'Disorganized',
      description: 'Some structure but lots of manual work',
      emoji: '😟',
      color: 'warning',
      impact: 'Moderate data preparation needed'
    },
    {
      value: 3,
      label: 'Average',
      description: 'Well-organized but not connected',
      emoji: '😐',
      color: 'warning',
      impact: 'Integration work required'
    },
    {
      value: 4,
      label: 'Good',
      description: 'Mostly integrated and clean',
      emoji: '😊',
      color: 'success',
      impact: 'Minor cleanup and optimization'
    },
    {
      value: 5,
      label: 'Excellent',
      description: 'Highly structured and connected',
      emoji: '🤩',
      color: 'success',
      impact: 'Ready for advanced automation'
    }
  ];

  const changeReadinessOptions = [
    {
      value: 1,
      label: 'Resistant',
      description: 'Team prefers current methods',
      emoji: '😤',
      color: 'error',
      approach: 'Careful change management required'
    },
    {
      value: 2,
      label: 'Cautious',
      description: 'Need convincing and gradual changes',
      emoji: '🤔',
      color: 'warning',
      approach: 'Gradual implementation recommended'
    },
    {
      value: 3,
      label: 'Open',
      description: 'Willing to try new solutions',
      emoji: '😊',
      color: 'success',
      approach: 'Standard implementation approach'
    },
    {
      value: 4,
      label: 'Eager',
      description: 'Actively wanting improvements',
      emoji: '😃',
      color: 'success',
      approach: 'Accelerated implementation possible'
    },
    {
      value: 5,
      label: 'Desperate',
      description: 'Urgently need automation solutions',
      emoji: '🚀',
      color: 'success',
      approach: 'Aggressive automation timeline'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Technical Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardSelection
          title="What technical resources do you have available?"
          description="This determines our implementation approach and support level"
          options={technicalResourceOptions}
          value={data.technicalResources}
          onChange={(value) => onUpdate({ technicalResources: value })}
          columns={1}
          showDetails
        />
      </motion.div>

      {/* Data Quality */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ScaleInput
          title="How would you describe your current data organization?"
          description="Data quality affects automation complexity and timeline"
          options={dataQualityOptions}
          value={data.dataQuality}
          onChange={(value) => onUpdate({ dataQuality: value })}
          showImpact
        />
      </motion.div>

      {/* Change Management Readiness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ScaleInput
          title="How does your team typically respond to new processes?"
          description="Team readiness affects implementation strategy and success"
          options={changeReadinessOptions}
          value={data.changeReadiness}
          onChange={(value) => onUpdate({ changeReadiness: value })}
          showApproach
        />
      </motion.div>
    </div>
  );
};