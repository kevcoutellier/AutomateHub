import mongoose from 'mongoose';
import { config } from '../config/config';
import { UserModel } from '../models/User';
import { ExpertModel } from '../models/Expert';
import { ProjectModel } from '../models/Project';
import { ReviewModel } from '../models/Review';

const sampleUsers = [
  {
    email: 'admin@automatehub.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'AutomateHub',
    role: 'admin',
    isEmailVerified: true
  },
  {
    email: 'client@automatehub.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'client',
    isEmailVerified: true
  },
  {
    email: 'sarah.chen@automatehub.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'expert',
    isEmailVerified: true
  },
  {
    email: 'marcus.rodriguez@automatehub.com',
    password: 'password123',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    role: 'expert',
    isEmailVerified: true
  },
  {
    email: 'emily.watson@automatehub.com',
    password: 'password123',
    firstName: 'Emily',
    lastName: 'Watson',
    role: 'expert',
    isEmailVerified: true
  },
  {
    email: 'alex.kim@automatehub.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Kim',
    role: 'expert',
    isEmailVerified: true
  },
  {
    email: 'lisa.johnson@automatehub.com',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Johnson',
    role: 'expert',
    isEmailVerified: true
  },
  {
    email: 'david.brown@automatehub.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Brown',
    role: 'expert',
    isEmailVerified: true
  },
  {
    email: 'maria.garcia@automatehub.com',
    password: 'password123',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'expert',
    isEmailVerified: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await UserModel.deleteMany({});
    await ExpertModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await ReviewModel.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await UserModel.create(sampleUsers);
    console.log('Created users');

    // Find expert users
    const expertUsers = users.filter(user => user.role === 'expert');
    const clientUser = users.find(user => user.role === 'client');

    // Create expert profiles
    const sampleExperts = [
      {
        userId: expertUsers[0]._id,
        name: 'Sarah Chen',
        title: 'E-commerce Automation Specialist',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'San Francisco, CA',
        timezone: 'PST (UTC-8)',
        rating: 4.9,
        reviewCount: 47,
        projectsCompleted: 47,
        successRate: 98,
        responseTime: '< 2 hours',
        hourlyRate: { min: 85, max: 120, currency: 'USD' },
        availability: 'available',
        nextAvailable: 'Immediately',
        specialties: ['E-commerce Integration', 'Shopify Automation', 'Multi-platform Sync', 'Data Analytics'],
        industries: ['E-commerce', 'Retail', 'SaaS'],
        certifications: ['n8n Certified Professional', 'Shopify Partner'],
        languages: ['English', 'Mandarin'],
        experience: 'expert',
        completionTime: '1-2 weeks',
        recentProject: 'Automated order processing for 10K+ orders/month',
        featured: true,
        bio: 'Specialized in e-commerce automation with deep expertise in Shopify, WooCommerce, and multi-platform integrations. Helped 40+ businesses automate their order processing, inventory management, and customer communications.',
        portfolio: [
          {
            id: '1',
            title: 'E-commerce Order Automation',
            description: 'Complete order processing automation for growing online retailer. Reduced processing time by 95% and eliminated manual errors.',
            technologies: ['n8n', 'Shopify', 'Google Sheets', 'Slack', 'ShipStation'],
            completedAt: new Date('2024-01-15')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'Mike Johnson',
            clientRole: 'CEO',
            clientCompany: 'TechFlow Solutions',
            rating: 5,
            comment: 'Sarah transformed our entire order process. What used to take hours now happens automatically. Incredible expertise and communication.',
            projectTitle: 'E-commerce Order Automation',
            date: new Date('2024-01-15'),
            verified: true
          }
        ]
      },
      {
        userId: expertUsers[1]._id,
        name: 'Marcus Rodriguez',
        title: 'CRM & Marketing Automation Expert',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'Austin, TX',
        timezone: 'CST (UTC-6)',
        rating: 4.8,
        reviewCount: 32,
        projectsCompleted: 32,
        successRate: 96,
        responseTime: '< 4 hours',
        hourlyRate: { min: 75, max: 110, currency: 'USD' },
        availability: 'available',
        nextAvailable: 'This week',
        specialties: ['CRM Automation', 'Marketing Workflows', 'Lead Generation', 'Sales Funnels'],
        industries: ['SaaS', 'Professional Services', 'Healthcare'],
        certifications: ['HubSpot Certified', 'Salesforce Administrator'],
        languages: ['English', 'Spanish'],
        experience: 'senior',
        completionTime: '2-3 weeks',
        recentProject: 'Lead nurturing automation generating 40% more qualified leads',
        featured: true,
        bio: 'Expert in CRM and marketing automation with proven track record in lead generation and customer lifecycle management. Specialized in HubSpot, Salesforce, and custom workflow solutions.',
        portfolio: [
          {
            id: '1',
            title: 'Lead Nurturing Automation',
            description: 'Comprehensive lead scoring and nurturing system. Increased conversion by 40% and reduced manual work by 80%.',
            technologies: ['n8n', 'HubSpot', 'Mailchimp', 'Zapier', 'Google Analytics'],
            completedAt: new Date('2024-02-01')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'Lisa Park',
            clientRole: 'Marketing Director',
            clientCompany: 'GrowthCorp',
            rating: 5,
            comment: 'Marcus delivered an amazing lead nurturing system that doubled our conversion rates. Professional and results-driven.',
            projectTitle: 'Lead Nurturing Automation',
            date: new Date('2024-02-01'),
            verified: true
          }
        ]
      },
      {
        userId: expertUsers[2]._id,
        name: 'Emily Watson',
        title: 'Data Integration & Analytics Specialist',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'Seattle, WA',
        timezone: 'PST (UTC-8)',
        rating: 4.7,
        reviewCount: 28,
        projectsCompleted: 28,
        successRate: 94,
        responseTime: '< 6 hours',
        hourlyRate: { min: 90, max: 140, currency: 'USD' },
        availability: 'busy',
        nextAvailable: 'Next week',
        specialties: ['Data Integration', 'Analytics Automation', 'API Development', 'Database Management'],
        industries: ['Finance', 'Healthcare', 'Manufacturing'],
        certifications: ['Google Cloud Certified', 'AWS Solutions Architect'],
        languages: ['English'],
        experience: 'expert',
        completionTime: '2-4 weeks',
        recentProject: 'Real-time data pipeline processing 1M+ records daily',
        featured: false,
        bio: 'Data integration specialist with expertise in complex API integrations, real-time data processing, and analytics automation. Strong background in cloud platforms and database optimization.',
        portfolio: [
          {
            id: '1',
            title: 'Real-time Data Pipeline',
            description: 'Automated data collection and processing system. Achieved real-time data processing with 99.9% accuracy and automated reporting.',
            technologies: ['n8n', 'PostgreSQL', 'Google Cloud', 'Python', 'Grafana'],
            completedAt: new Date('2024-01-20')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'David Kim',
            clientRole: 'CTO',
            clientCompany: 'DataTech Inc',
            rating: 5,
            comment: 'Emily built an incredible data pipeline that transformed our analytics capabilities. Highly technical and reliable.',
            projectTitle: 'Real-time Data Pipeline',
            date: new Date('2024-01-20'),
            verified: true
          }
        ]
      },
      {
        userId: expertUsers[3]._id,
        name: 'Alex Kim',
        title: 'Marketing Automation & CRM Specialist',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'New York, NY',
        timezone: 'EST (UTC-5)',
        rating: 4.9,
        reviewCount: 55,
        projectsCompleted: 55,
        successRate: 98,
        responseTime: '< 1 hour',
        hourlyRate: { min: 95, max: 150, currency: 'USD' },
        availability: 'available',
        nextAvailable: 'This week',
        specialties: ['HubSpot Automation', 'Email Marketing', 'Lead Scoring', 'Sales Funnel Optimization'],
        industries: ['SaaS', 'B2B Services', 'Technology'],
        certifications: ['HubSpot Certified', 'Salesforce Administrator'],
        languages: ['English', 'Korean'],
        experience: 'expert',
        completionTime: '1-3 weeks',
        recentProject: 'Automated lead nurturing increasing conversion by 40%',
        featured: true,
        bio: 'Marketing automation expert specializing in HubSpot, Salesforce, and custom CRM integrations. Helped 50+ companies optimize their sales funnels and automate lead nurturing processes.',
        portfolio: [
          {
            id: '1',
            title: 'Lead Nurturing Automation',
            description: 'Complete lead scoring and nurturing system. Achieved 40% increase in conversion and reduced sales cycle by 30%.',
            technologies: ['HubSpot', 'Zapier', 'Google Analytics', 'Slack'],
            completedAt: new Date('2024-01-25')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'Jennifer Lee',
            clientRole: 'Marketing Director',
            clientCompany: 'GrowthTech',
            rating: 5,
            comment: 'Alex completely transformed our marketing automation. Our lead conversion improved dramatically and the system runs flawlessly.',
            projectTitle: 'Lead Nurturing Automation',
            date: new Date('2024-01-25'),
            verified: true
          }
        ]
      },
      {
        userId: expertUsers[4]._id,
        name: 'Lisa Johnson',
        title: 'HR & Operations Automation Expert',
        avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'Chicago, IL',
        timezone: 'CST (UTC-6)',
        rating: 4.8,
        reviewCount: 38,
        projectsCompleted: 38,
        successRate: 97,
        responseTime: '< 3 hours',
        hourlyRate: { min: 70, max: 105, currency: 'USD' },
        availability: 'available',
        nextAvailable: 'Next week',
        specialties: ['Employee Onboarding', 'Payroll Automation', 'Document Management', 'Workflow Optimization'],
        industries: ['HR Services', 'Consulting', 'Healthcare'],
        certifications: ['SHRM Certified', 'BambooHR Partner'],
        languages: ['English', 'Spanish'],
        experience: 'expert',
        completionTime: '2-4 weeks',
        recentProject: 'Automated employee onboarding reducing time by 60%',
        featured: false,
        bio: 'HR operations specialist focused on automating repetitive HR processes. Expert in employee onboarding, document management, and payroll automation systems.',
        portfolio: [
          {
            id: '1',
            title: 'Employee Onboarding Automation',
            description: 'Complete digital onboarding process. Achieved 60% reduction in onboarding time and reduced paperwork by 90%.',
            technologies: ['BambooHR', 'DocuSign', 'Slack', 'Google Workspace'],
            completedAt: new Date('2024-02-01')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'Robert Chen',
            clientRole: 'HR Director',
            clientCompany: 'TechStart Inc',
            rating: 5,
            comment: 'Lisa streamlined our entire onboarding process. New employees love the smooth experience and we save so much time.',
            projectTitle: 'Employee Onboarding Automation',
            date: new Date('2024-02-01'),
            verified: true
          }
        ]
      },
      {
        userId: expertUsers[5]._id,
        name: 'David Brown',
        title: 'Financial Process Automation Specialist',
        avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'Boston, MA',
        timezone: 'EST (UTC-5)',
        rating: 4.7,
        reviewCount: 42,
        projectsCompleted: 42,
        successRate: 95,
        responseTime: '< 4 hours',
        hourlyRate: { min: 100, max: 160, currency: 'USD' },
        availability: 'busy',
        nextAvailable: 'In 2 weeks',
        specialties: ['Invoice Automation', 'Expense Management', 'Financial Reporting', 'QuickBooks Integration'],
        industries: ['Finance', 'Accounting', 'Professional Services'],
        certifications: ['QuickBooks ProAdvisor', 'CPA'],
        languages: ['English'],
        experience: 'expert',
        completionTime: '2-5 weeks',
        recentProject: 'Automated invoice processing saving 25 hours/week',
        featured: false,
        bio: 'Financial automation expert with CPA background. Specializes in automating accounting processes, invoice management, and financial reporting for growing businesses.',
        portfolio: [
          {
            id: '1',
            title: 'Invoice Processing Automation',
            description: 'End-to-end invoice automation system. Saved 25 hours per week and reduced errors by 95%.',
            technologies: ['QuickBooks', 'Receipt Bank', 'Zapier', 'DocuSign'],
            completedAt: new Date('2024-01-30')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'Susan Williams',
            clientRole: 'CFO',
            clientCompany: 'Growth Partners',
            rating: 5,
            comment: 'David automated our entire invoice process. The time savings and accuracy improvements have been incredible.',
            projectTitle: 'Invoice Processing Automation',
            date: new Date('2024-01-30'),
            verified: true
          }
        ]
      },
      {
        userId: expertUsers[6]._id,
        name: 'Maria Garcia',
        title: 'Social Media & Content Automation Expert',
        avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'Los Angeles, CA',
        timezone: 'PST (UTC-8)',
        rating: 4.6,
        reviewCount: 35,
        projectsCompleted: 35,
        successRate: 93,
        responseTime: '< 5 hours',
        hourlyRate: { min: 60, max: 95, currency: 'USD' },
        availability: 'available',
        nextAvailable: 'This week',
        specialties: ['Social Media Automation', 'Content Scheduling', 'Influencer Outreach', 'Analytics Reporting'],
        industries: ['Marketing', 'E-commerce', 'Entertainment'],
        certifications: ['Hootsuite Certified', 'Facebook Blueprint'],
        languages: ['English', 'Spanish'],
        experience: 'senior',
        completionTime: '1-3 weeks',
        recentProject: 'Automated social media strategy increasing engagement by 150%',
        featured: false,
        bio: 'Social media automation specialist helping brands scale their online presence. Expert in content scheduling, influencer outreach automation, and social media analytics.',
        portfolio: [
          {
            id: '1',
            title: 'Social Media Automation for Fashion Brand',
            description: 'Complete social media management automation for growing fashion e-commerce brand',
            challenge: 'Manual posting and engagement across multiple platforms consuming 20+ hours/week',
            solution: 'Automated content scheduling with engagement tracking, hashtag optimization, and performance reporting',
            results: ['150% increase in engagement', '300% growth in followers', 'Reduced management time by 85%', 'Automated cross-platform posting'],
            timeline: '2 weeks',
            technologies: ['Hootsuite', 'Buffer', 'Zapier', 'Google Analytics', 'Instagram API', 'Facebook Business'],
            completedAt: new Date('2024-02-10')
          },
          {
            id: '2',
            title: 'Influencer Outreach Automation',
            description: 'Automated influencer discovery and outreach system for beauty brand',
            challenge: 'Manual influencer research and outreach taking weeks per campaign',
            solution: 'AI-powered influencer discovery with automated outreach sequences and performance tracking',
            results: ['90% reduction in outreach time', '45% higher response rate', 'Tracked 500+ influencer relationships', 'ROI increased by 200%'],
            timeline: '3 weeks',
            technologies: ['Zapier', 'Airtable', 'Gmail API', 'Instagram API', 'Google Sheets', 'Mailchimp'],
            completedAt: new Date('2024-01-25')
          },
          {
            id: '3',
            title: 'Content Creation Workflow',
            description: 'Streamlined content creation and approval process for marketing agency',
            challenge: 'Chaotic content approval process causing delays and missed deadlines',
            solution: 'Automated workflow from content brief to publication with approval stages and notifications',
            results: ['50% faster content delivery', 'Zero missed deadlines', 'Improved client satisfaction', 'Automated asset organization'],
            timeline: '2 weeks',
            technologies: ['Notion', 'Slack', 'Google Drive', 'Canva API', 'Trello', 'Zapier'],
            completedAt: new Date('2024-01-15')
          },
          {
            id: '4',
            title: 'Social Media Analytics Dashboard',
            description: 'Comprehensive analytics dashboard for multi-brand social media management',
            challenge: 'Manual data collection from multiple platforms for monthly reports',
            solution: 'Automated data aggregation with real-time dashboard and scheduled reporting',
            results: ['Real-time performance insights', 'Automated monthly reports', '95% time savings on analytics', 'Better decision making'],
            timeline: '1 week',
            technologies: ['Google Data Studio', 'Facebook API', 'Instagram API', 'Twitter API', 'Google Sheets', 'Zapier'],
            completedAt: new Date('2023-12-20')
          },
          {
            id: '5',
            title: 'User-Generated Content Campaign',
            description: 'Automated UGC collection and moderation system for lifestyle brand',
            challenge: 'Missing valuable user-generated content and manual moderation bottlenecks',
            solution: 'Automated hashtag monitoring with AI-powered content curation and approval workflow',
            results: ['300% increase in UGC collection', 'Automated content moderation', '80% faster campaign execution', 'Higher brand authenticity'],
            timeline: '2 weeks',
            technologies: ['Instagram API', 'Twitter API', 'AI Content Moderation', 'Slack', 'Google Drive', 'Zapier'],
            completedAt: new Date('2023-12-05')
          }
        ],
        testimonials: [
          {
            id: '1',
            clientName: 'Michael Torres',
            clientRole: 'Marketing Manager',
            clientCompany: 'BrandBoost',
            rating: 5,
            comment: 'Maria automated our social media completely. Our engagement skyrocketed and we save hours every week. The ROI has been incredible!',
            projectTitle: 'Social Media Automation for Fashion Brand',
            date: new Date('2024-02-05'),
            verified: true
          },
          {
            id: '2',
            clientName: 'Sarah Mitchell',
            clientRole: 'Founder & CEO',
            clientCompany: 'GlowBeauty',
            rating: 5,
            comment: 'The influencer outreach automation Maria built transformed our marketing. We went from manually reaching out to 10 influencers per week to 100+ with better results.',
            projectTitle: 'Influencer Outreach Automation',
            date: new Date('2024-01-20'),
            verified: true
          },
          {
            id: '3',
            clientName: 'David Chen',
            clientRole: 'Creative Director',
            clientCompany: 'Pixel Perfect Agency',
            rating: 4,
            comment: 'Maria streamlined our entire content workflow. What used to take days now happens in hours. Our clients love the faster turnaround times.',
            projectTitle: 'Content Creation Workflow',
            date: new Date('2024-01-10'),
            verified: true
          },
          {
            id: '4',
            clientName: 'Jennifer Lopez',
            clientRole: 'Marketing Director',
            clientCompany: 'MultiMedia Corp',
            rating: 5,
            comment: 'The analytics dashboard Maria created gives us insights we never had before. Real-time data has revolutionized our social media strategy.',
            projectTitle: 'Social Media Analytics Dashboard',
            date: new Date('2023-12-15'),
            verified: true
          },
          {
            id: '5',
            clientName: 'Alex Rodriguez',
            clientRole: 'Brand Manager',
            clientCompany: 'LifeStyle Co',
            rating: 5,
            comment: 'Our UGC campaigns are now 10x more effective thanks to Maria\'s automation. We capture and curate content we would have missed before.',
            projectTitle: 'User-Generated Content Campaign',
            date: new Date('2023-11-30'),
            verified: true
          }
        ]
      }
    ];

    const experts = await ExpertModel.create(sampleExperts);
    console.log('Created expert profiles');

    // Create sample project
    if (clientUser && experts[0]) {
      const sampleProject = {
        title: 'E-commerce Order Processing Automation',
        description: 'Automate our Shopify order processing workflow to reduce manual work and improve accuracy. Need integration with our inventory system and shipping providers.',
        status: 'in-progress',
        progress: 65,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-28'),
        budget: { total: 8500, spent: 5500, currency: 'USD' },
        expertId: experts[0]._id,
        clientId: clientUser._id,
        milestones: [
          {
            id: '1',
            title: 'Requirements Analysis',
            description: 'Analyze current workflow and define automation requirements',
            status: 'completed',
            dueDate: new Date('2024-01-20'),
            completedDate: new Date('2024-01-18'),
            deliverables: ['Requirements document', 'Process flow diagram']
          },
          {
            id: '2',
            title: 'Shopify Integration',
            description: 'Set up Shopify webhook integration and order processing',
            status: 'completed',
            dueDate: new Date('2024-02-05'),
            completedDate: new Date('2024-02-03'),
            deliverables: ['Shopify webhook setup', 'Order processing workflow']
          },
          {
            id: '3',
            title: 'Inventory System Integration',
            description: 'Connect with inventory management system',
            status: 'in-progress',
            dueDate: new Date('2024-02-15'),
            deliverables: ['Inventory sync workflow', 'Stock level monitoring']
          }
        ],
        messages: [
          {
            id: '1',
            senderId: experts[0].userId.toString(),
            senderRole: 'expert',
            content: 'Hi John! I\'ve completed the Shopify integration and the orders are now being processed automatically. The next step is connecting your inventory system.',
            timestamp: new Date('2024-02-10T10:30:00Z'),
            messageType: 'text'
          },
          {
            id: '2',
            senderId: (clientUser as any)._id.toString(),
            senderRole: 'client',
            content: 'That\'s great news! I can already see the difference. When do you think the inventory integration will be ready?',
            timestamp: new Date('2024-02-10T14:15:00Z'),
            messageType: 'text'
          }
        ]
      };

      const project = await ProjectModel.create(sampleProject);
      console.log('Created sample project');

      // Create sample review
      const sampleReview = {
        expertId: experts[0]._id,
        clientId: clientUser._id,
        projectId: project._id,
        rating: 5,
        comment: 'Sarah did an amazing job automating our order processing. The system works flawlessly and has saved us countless hours. Highly recommend!',
        aspects: {
          communication: 5,
          quality: 5,
          timeliness: 4,
          expertise: 5
        },
        verified: true
      };

      await ReviewModel.create(sampleReview);
      console.log('Created sample review');
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n🔐 Admin Account:');
    console.log('Admin: admin@automatehub.com / admin123');
    console.log('\n📧 Sample login credentials:');
    console.log('Client: client@automatehub.com / password123');
    console.log('\n🔧 Expert Accounts:');
    console.log('• Sarah Chen (E-commerce): sarah.chen@automatehub.com / password123');
    console.log('• Marcus Rodriguez (CRM): marcus.rodriguez@automatehub.com / password123');
    console.log('• Emily Watson (Data): emily.watson@automatehub.com / password123');
    console.log('• Alex Kim (Marketing): alex.kim@automatehub.com / password123');
    console.log('• Lisa Johnson (HR): lisa.johnson@automatehub.com / password123');
    console.log('• David Brown (Finance): david.brown@automatehub.com / password123');
    console.log('• Maria Garcia (Social Media): maria.garcia@automatehub.com / password123');
    console.log('\n📊 Total: 7 experts across different specialties');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
