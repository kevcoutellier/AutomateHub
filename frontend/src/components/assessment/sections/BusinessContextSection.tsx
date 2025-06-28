import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Globe, TrendingUp } from 'lucide-react';
import { CardSelection } from '../inputs/CardSelection';
import { MultiSelect } from '../inputs/MultiSelect';

interface BusinessContextData {
  companySize?: string;
  industry?: string;
  currentTools?: string[];
  growthStage?: string;
}

interface BusinessContextSectionProps {
  data: BusinessContextData;
  onUpdate: (data: Partial<BusinessContextData>) => void;
}

export const BusinessContextSection: React.FC<BusinessContextSectionProps> = ({
  data,
  onUpdate
}) => {
  const companySizeOptions = [
    {
      value: '1-5',
      label: '1-5 employees',
      description: 'Startup or solopreneur',
      icon: '👤',
      details: 'Perfect for simple workflow automation'
    },
    {
      value: '6-20',
      label: '6-20 employees',
      description: 'Small growing business',
      icon: '👥',
      details: 'Focus on efficiency and scaling processes'
    },
    {
      value: '21-50',
      label: '21-50 employees',
      description: 'Established company',
      icon: '🏢',
      details: 'Multi-department coordination needs'
    },
    {
      value: '51-200',
      label: '51-200 employees',
      description: 'Mid-size business',
      icon: '🏬',
      details: 'Complex workflows and integrations'
    },
    {
      value: '200+',
      label: '200+ employees',
      description: 'Enterprise organization',
      icon: '🏭',
      details: 'Enterprise-grade automation solutions'
    }
  ];

  const industryOptions = [
    {
      value: 'ecommerce',
      label: 'E-commerce & Retail',
      description: 'Online stores, marketplaces',
      icon: '🛒',
      details: 'Inventory, orders, customer service'
    },
    {
      value: 'saas',
      label: 'SaaS & Technology',
      description: 'Software companies',
      icon: '💻',
      details: 'User onboarding, analytics, support'
    },
    {
      value: 'services',
      label: 'Professional Services',
      description: 'Consulting, agencies',
      icon: '💼',
      details: 'Client management, project workflows'
    },
    {
      value: 'manufacturing',
      label: 'Manufacturing',
      description: 'Physical product creation',
      icon: '🏭',
      details: 'Supply chain, quality control'
    },
    {
      value: 'healthcare',
      label: 'Healthcare',
      description: 'Medical, wellness',
      icon: '🏥',
      details: 'Patient management, compliance'
    },
    {
      value: 'finance',
      label: 'Finance & Banking',
      description: 'Financial services',
      icon: '💰',
      details: 'Risk management, reporting'
    },
    {
      value: 'education',
      label: 'Education',
      description: 'Schools, training',
      icon: '🎓',
      details: 'Student management, content delivery'
    },
    {
      value: 'realestate',
      label: 'Real Estate',
      description: 'Property management',
      icon: '🏠',
      details: 'Lead management, property tracking'
    }
  ];

  const toolCategories = [
    {
      category: 'CRM & Sales',
      tools: [
        { value: 'salesforce', label: 'Salesforce', popular: true },
        { value: 'hubspot', label: 'HubSpot', popular: true },
        { value: 'pipedrive', label: 'Pipedrive' },
        { value: 'zoho-crm', label: 'Zoho CRM' }
      ]
    },
    {
      category: 'Marketing',
      tools: [
        { value: 'mailchimp', label: 'Mailchimp', popular: true },
        { value: 'convertkit', label: 'ConvertKit' },
        { value: 'activecampaign', label: 'ActiveCampaign' },
        { value: 'klaviyo', label: 'Klaviyo' }
      ]
    },
    {
      category: 'E-commerce',
      tools: [
        { value: 'shopify', label: 'Shopify', popular: true },
        { value: 'woocommerce', label: 'WooCommerce' },
        { value: 'magento', label: 'Magento' },
        { value: 'bigcommerce', label: 'BigCommerce' }
      ]
    },
    {
      category: 'Productivity',
      tools: [
        { value: 'slack', label: 'Slack', popular: true },
        { value: 'microsoft-365', label: 'Microsoft 365', popular: true },
        { value: 'google-workspace', label: 'Google Workspace', popular: true },
        { value: 'notion', label: 'Notion' }
      ]
    },
    {
      category: 'Finance',
      tools: [
        { value: 'quickbooks', label: 'QuickBooks', popular: true },
        { value: 'xero', label: 'Xero' },
        { value: 'freshbooks', label: 'FreshBooks' },
        { value: 'stripe', label: 'Stripe' }
      ]
    },
    {
      category: 'Project Management',
      tools: [
        { value: 'asana', label: 'Asana', popular: true },
        { value: 'trello', label: 'Trello' },
        { value: 'monday', label: 'Monday.com' },
        { value: 'clickup', label: 'ClickUp' }
      ]
    }
  ];

  const growthStageOptions = [
    {
      value: 'startup',
      label: 'Just Starting Out',
      description: 'Building foundation',
      icon: '🌱',
      details: 'Basic automation to establish processes'
    },
    {
      value: 'growth',
      label: 'Steady Growth',
      description: 'Optimizing operations',
      icon: '📈',
      details: 'Efficiency improvements and scaling'
    },
    {
      value: 'scaling',
      label: 'Rapid Scaling',
      description: 'Managing increased volume',
      icon: '🚀',
      details: 'Advanced automation for scale'
    },
    {
      value: 'established',
      label: 'Established Operations',
      description: 'Mature business optimization',
      icon: '🏆',
      details: 'Sophisticated workflow optimization'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Company Size */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardSelection
          title="What's your team size?"
          description="This helps us understand your automation complexity needs"
          options={companySizeOptions}
          value={data.companySize}
          onChange={(value) => onUpdate({ companySize: value })}
          columns={2}
        />
      </motion.div>

      {/* Industry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardSelection
          title="What's your industry?"
          description="Industry expertise helps us match you with the right specialist"
          options={industryOptions}
          value={data.industry}
          onChange={(value) => onUpdate({ industry: value })}
          columns={2}
        />
      </motion.div>

      {/* Current Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MultiSelect
          title="What tools does your team currently use?"
          description="Select all that apply - this helps us plan integrations"
          categories={toolCategories}
          values={data.currentTools || []}
          onChange={(values) => onUpdate({ currentTools: values })}
          maxSelections={10}
          showPopularBadge
        />
      </motion.div>

      {/* Growth Stage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardSelection
          title="What's your current growth stage?"
          description="This helps us recommend the right automation approach"
          options={growthStageOptions}
          value={data.growthStage}
          onChange={(value) => onUpdate({ growthStage: value })}
          columns={2}
        />
      </motion.div>
    </div>
  );
};