# AutomateHub Backend API

A comprehensive Node.js + Express + TypeScript backend for the AutomateHub marketplace platform, connecting businesses with certified n8n automation experts.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Expert Management**: Complete expert profiles with portfolios and ratings
- **Project Management**: Full project lifecycle with milestones and messaging
- **Review System**: Comprehensive review and rating system
- **Assessment Engine**: Business automation readiness assessment
- **Real-time Messaging**: Project-based communication system
- **File Upload**: Secure file handling for project assets
- **Rate Limiting**: API protection against abuse
- **Comprehensive Validation**: Input validation and error handling

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Email**: Nodemailer
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+ (local or cloud)
- Git

## ⚡ Quick Start

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud connection
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access API**
   - API: http://localhost:5000/api
   - Health Check: http://localhost:5000/health
   - Documentation: http://localhost:5000/api

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── config.ts    # App configuration
│   └── database.ts  # Database connection
├── middleware/      # Express middleware
│   ├── auth.ts      # Authentication middleware
│   ├── validation.ts # Input validation
│   └── errorHandler.ts # Error handling
├── models/          # Mongoose models
│   ├── User.ts      # User model
│   ├── Expert.ts    # Expert profile model
│   ├── Project.ts   # Project model
│   ├── Review.ts    # Review model
│   └── Assessment.ts # Assessment model
├── routes/          # API routes
│   ├── auth.ts      # Authentication routes
│   ├── experts.ts   # Expert management
│   ├── projects.ts  # Project management
│   ├── reviews.ts   # Review system
│   └── assessment.ts # Assessment engine
├── types/           # TypeScript type definitions
│   └── index.ts     # Shared types
└── server.ts        # Main server file
```

## 🔐 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/automatehub

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/change-password` - Change password

### Experts
- `GET /api/experts` - List experts (with filtering)
- `GET /api/experts/:id` - Get expert details
- `POST /api/experts` - Create expert profile
- `PUT /api/experts/:id` - Update expert profile
- `GET /api/experts/:id/stats` - Get expert statistics

### Projects
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/messages` - Send message

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/expert/:expertId` - Get expert reviews

### Assessment
- `POST /api/assessment` - Submit assessment
- `GET /api/assessment/my-assessments` - Get user assessments
- `GET /api/assessment/:id/results` - Get detailed results

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Client**: Can create projects, submit assessments, write reviews
- **Expert**: Can create profiles, manage projects, respond to clients
- **Admin**: Full system access (future implementation)

## 📊 Database Schema

### Users
- Basic user information
- Role-based access control
- Email verification status

### Experts
- Detailed professional profiles
- Skills, specialties, and experience
- Portfolio and testimonials
- Availability and pricing

### Projects
- Project lifecycle management
- Milestones and progress tracking
- Client-expert messaging
- File attachments

### Reviews
- Multi-aspect rating system
- Verified reviews from completed projects
- Expert rating calculations

### Assessments
- Business automation readiness scoring
- Personalized recommendations
- Expert matching algorithm

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production MongoDB
4. Set up proper CORS origins
5. Configure email service
6. Set up monitoring and logging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 📈 Performance

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Compression**: Gzip compression enabled
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: All list endpoints support pagination
- **Caching**: Response caching for static data (future)

## 🔧 Development

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Consistent error handling
- Comprehensive input validation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/api`
- Review the health check at `/health`

---

Built with ❤️ for the AutomateHub community
