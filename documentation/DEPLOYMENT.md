# AutomateHub Deployment Guide

## Overview
AutomateHub is a full-stack marketplace platform for n8n automation experts. This guide covers deployment for both frontend and backend components.

## Architecture
- **Frontend**: React + TypeScript + Vite (deployed on Netlify)
- **Backend**: Node.js + Express + TypeScript + MongoDB (deployed on Vercel)

## Prerequisites
- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended for production)
- Netlify account (for frontend deployment)
- Vercel account (for backend deployment)

## Environment Variables

### Backend (.env)
Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/automatehub
DB_NAME=automatehub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_APP_NAME=AutomateHub
VITE_APP_VERSION=1.0.0
```

## Deployment Steps

### 1. Backend Deployment (Vercel)

1. **Build the backend:**
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables:**
   - Go to Vercel dashboard
   - Add all environment variables from your `.env` file
   - Ensure `NODE_ENV=production`

### 2. Frontend Deployment (Netlify)

1. **Update API URL:**
   - Update `VITE_API_BASE_URL` in frontend `.env` with your deployed backend URL

2. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### 3. Database Setup

1. **MongoDB Atlas:**
   - Create a MongoDB Atlas cluster
   - Create a database user
   - Whitelist your deployment IPs (or use 0.0.0.0/0 for all IPs)
   - Get connection string and update `MONGODB_URI`

2. **Seed Initial Data:**
   ```bash
   cd backend
   npm run seed
   ```

## Post-Deployment Checklist

- [ ] Backend API is accessible and returns proper responses
- [ ] Frontend loads without errors
- [ ] Database connection is working
- [ ] Environment variables are properly configured
- [ ] CORS is configured for your frontend domain
- [ ] SSL certificates are active (handled by Netlify/Vercel)
- [ ] Email service is configured and working
- [ ] Authentication flow works end-to-end

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /api/health`
- Frontend: Check console for any errors

### Logs
- Vercel: Check function logs in Vercel dashboard
- Netlify: Check deploy logs in Netlify dashboard

### Updates
1. Make changes to your code
2. Push to your repository
3. Deployments will trigger automatically (if auto-deploy is enabled)

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure backend CORS is configured for your frontend domain
   - Check `src/middleware/cors.ts` in backend

2. **Database Connection:**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas
   - Ensure database user has proper permissions

3. **Environment Variables:**
   - Verify all required variables are set in deployment platforms
   - Check variable names match exactly (case-sensitive)

4. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Support
For deployment issues, check:
- Vercel documentation: https://vercel.com/docs
- Netlify documentation: https://docs.netlify.com
- MongoDB Atlas documentation: https://docs.atlas.mongodb.com

## Security Considerations

- Use strong JWT secrets
- Enable MongoDB authentication
- Use HTTPS only
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement rate limiting (already configured)
- Use environment variables for all secrets
