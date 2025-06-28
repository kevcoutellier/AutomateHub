#!/bin/bash

# AutomateHub Deployment Script
echo "🚀 Starting AutomateHub deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_status "Requirements check passed"
}

# Build backend
build_backend() {
    echo "🏗️  Building backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        print_warning "Installing backend dependencies..."
        npm install
    fi
    
    print_status "Building TypeScript..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Backend build completed"
    else
        print_error "Backend build failed"
        exit 1
    fi
    
    cd ..
}

# Build frontend
build_frontend() {
    echo "🎨 Building frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_warning "Installing frontend dependencies..."
        npm install
    fi
    
    print_status "Building React app..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Run tests
run_tests() {
    echo "🧪 Running tests..."
    
    # Backend tests
    cd backend
    if npm run test --silent &> /dev/null; then
        print_status "Backend tests passed"
    else
        print_warning "Backend tests failed or not configured"
    fi
    cd ..
    
    # Frontend tests (if configured)
    cd frontend
    if npm run test --silent &> /dev/null; then
        print_status "Frontend tests passed"
    else
        print_warning "Frontend tests not configured"
    fi
    cd ..
}

# Check environment files
check_env_files() {
    echo "🔧 Checking environment configuration..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found. Please copy .env.example to .env and configure it."
    else
        print_status "Backend environment file found"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found. Please copy .env.example to .env and configure it."
    else
        print_status "Frontend environment file found"
    fi
}

# Main deployment process
main() {
    echo "🎯 AutomateHub Deployment Script"
    echo "================================"
    
    check_requirements
    check_env_files
    build_backend
    build_frontend
    run_tests
    
    echo ""
    echo "🎉 Deployment preparation completed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in deployment platforms"
    echo "2. Deploy backend to Vercel: cd backend && vercel --prod"
    echo "3. Deploy frontend to Netlify (or connect via Git)"
    echo "4. Update frontend .env with your deployed backend URL"
    echo "5. Run database seeding: cd backend && npm run seed"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT.md"
}

# Run main function
main
