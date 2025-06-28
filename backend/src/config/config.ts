import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface Config {
  server: {
    port: number;
    env: string;
    corsOrigin: string;
  };
  database: {
    uri: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  upload: {
    maxFileSize: number;
    uploadPath: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  security: {
    bcryptRounds: number;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/automatehub',
    name: process.env.DB_NAME || 'automatehub',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Required environment variable ${envVar} is not set`);
    process.exit(1);
  }
}
