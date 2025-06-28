import mongoose from 'mongoose';
import { config } from '../config/config';
import { UserModel } from '../models/User';
import { ExpertModel } from '../models/Expert';
import { ProjectModel } from '../models/Project';
import { ReviewModel } from '../models/Review';

const sampleUsers = [
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
        experience: '5+ years',
        completionTime: '1-2 weeks',
        recentProject: 'Automated order processing for 10K+ orders/month',
        featured: true,
        bio: 'Specialized in e-commerce automation with deep expertise in Shopify, WooCommerce, and multi-platform integrations. Helped 40+ businesses automate their order processing, inventory management, and customer communications.',
        portfolio: [
          {
            id: '1',
            title: 'E-commerce Order Automation',
            description: 'Complete order processing automation for growing online retailer',
            challenge: 'Manual order processing taking 3+ hours daily with frequent errors',
            solution: 'Automated workflow connecting Shopify, inventory system, and shipping providers',
            results: ['Reduced processing time by 95%', 'Eliminated manual errors', 'Saved 20 hours/week'],
            timeline: '2 weeks',
            technologies: ['n8n', 'Shopify', 'Google Sheets', 'Slack', 'ShipStation']
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
        experience: '4+ years',
        completionTime: '2-3 weeks',
        recentProject: 'Lead nurturing automation generating 40% more qualified leads',
        featured: true,
        bio: 'Expert in CRM and marketing automation with proven track record in lead generation and customer lifecycle management. Specialized in HubSpot, Salesforce, and custom workflow solutions.',
        portfolio: [
          {
            id: '1',
            title: 'Lead Nurturing Automation',
            description: 'Comprehensive lead scoring and nurturing system',
            challenge: 'Low lead conversion rates and manual follow-up processes',
            solution: 'Automated lead scoring, segmentation, and personalized nurturing sequences',
            results: ['Increased conversion by 40%', 'Reduced manual work by 80%', 'Improved lead quality'],
            timeline: '3 weeks',
            technologies: ['n8n', 'HubSpot', 'Mailchimp', 'Zapier', 'Google Analytics']
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
        experience: '6+ years',
        completionTime: '2-4 weeks',
        recentProject: 'Real-time data pipeline processing 1M+ records daily',
        featured: false,
        bio: 'Data integration specialist with expertise in complex API integrations, real-time data processing, and analytics automation. Strong background in cloud platforms and database optimization.',
        portfolio: [
          {
            id: '1',
            title: 'Real-time Data Pipeline',
            description: 'Automated data collection and processing system',
            challenge: 'Manual data collection from multiple sources causing delays',
            solution: 'Real-time data pipeline with automated validation and reporting',
            results: ['Real-time data processing', '99.9% data accuracy', 'Automated reporting'],
            timeline: '4 weeks',
            technologies: ['n8n', 'PostgreSQL', 'Google Cloud', 'Python', 'Grafana']
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
    console.log('\n📧 Sample login credentials:');
    console.log('Client: client@automatehub.com / password123');
    console.log('Expert: sarah.chen@automatehub.com / password123');
    console.log('Expert: marcus.rodriguez@automatehub.com / password123');
    console.log('Expert: emily.watson@automatehub.com / password123');

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
