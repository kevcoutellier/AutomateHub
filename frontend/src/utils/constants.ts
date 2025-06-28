// Application constants

export const APP_CONFIG = {
  name: 'AutomateHub',
  tagline: 'Premium n8n Expertise',
  description: 'Transform your business with certified n8n automation experts',
  url: 'https://automatehub.com',
  supportEmail: 'hello@automatehub.com',
  supportPhone: '+1 (555) 123-4567',
  location: 'San Francisco, CA'
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500
};

export const API_ENDPOINTS = {
  experts: '/api/experts',
  projects: '/api/projects',
  reviews: '/api/reviews',
  auth: '/api/auth'
};

export const EXPERT_SPECIALTIES = [
  'E-commerce Integration',
  'CRM Automation',
  'Data Processing',
  'API Development',
  'Marketing Automation',
  'Financial Workflows',
  'Customer Support',
  'Analytics & Reporting',
  'Enterprise Integration',
  'Workflow Optimization'
];

export const INDUSTRIES = [
  'E-commerce',
  'SaaS',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Professional Services',
  'Non-profit',
  'Government'
];

export const AVAILABILITY_STATUS = {
  available: {
    label: 'Available Now',
    color: 'success',
    bgColor: 'bg-success-500'
  },
  busy: {
    label: 'In Project',
    color: 'warning',
    bgColor: 'bg-warning-500'
  },
  unavailable: {
    label: 'Unavailable',
    color: 'error',
    bgColor: 'bg-error-500'
  }
} as const;