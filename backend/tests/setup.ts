import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  console.log('Connected to in-memory MongoDB for testing');
});

afterAll(async () => {
  // Cleanup
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  
  console.log('Disconnected from test database');
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
export const createTestUser = async (userData: any = {}) => {
  const { UserModel } = require('../src/models/User');
  
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123', // Let the model's pre-save hook handle hashing
    firstName: 'Test',
    lastName: 'User',
    role: 'client',
    isEmailVerified: true,
    ...userData
  };
  
  return await UserModel.create(defaultUser);
};

export const createTestExpert = async (userData: any = {}) => {
  const user = await createTestUser({ role: 'expert', ...userData });
  const { ExpertModel } = require('../src/models/Expert');
  
  const expertData = {
    userId: user._id,
    name: `${user.firstName} ${user.lastName}`,
    title: 'Senior n8n Automation Expert',
    bio: 'Experienced automation expert with 5+ years of experience in n8n, workflow automation, and business process optimization. Specialized in creating complex automation solutions for businesses.',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    hourlyRate: { 
      min: 80, 
      max: 120 
    },
    specialties: ['n8n', 'automation', 'workflow-design'],
    industries: ['technology', 'finance'],
    experience: 'senior', // Must be one of: 'entry', 'intermediate', 'senior', 'expert'
    availability: 'available',
    languages: ['English', 'Spanish'],
    portfolio: [],
    isApproved: true,
    isActive: true,
    featured: false,
    ...userData.expertData
  };
  
  const expert = await ExpertModel.create(expertData);
  return { user, expert };
};

export const createTestProject = async (clientId: string, expertId: string, projectData: any = {}) => {
  const { ProjectModel } = require('../src/models/Project');
  
  // Fix status values to match model enum: 'in_progress' -> 'in-progress'
  const fixedProjectData = { ...projectData };
  if (fixedProjectData.status === 'in_progress') {
    fixedProjectData.status = 'in-progress';
  }
  
  const defaultProject = {
    title: 'Test Project',
    description: 'Test project description',
    clientId,
    expertId,
    budget: { total: 1000, currency: 'USD' },
    status: 'planning',
    startDate: new Date(),
    ...fixedProjectData
  };
  
  return await ProjectModel.create(defaultProject);
};

// JWT token generation for testing
export const generateTestToken = (userId: string) => {
  const jwt = require('jsonwebtoken');
  const { config } = require('../src/config/config');
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: '1h' });
};
