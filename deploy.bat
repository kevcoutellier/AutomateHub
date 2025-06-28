@echo off
echo 🚀 Starting AutomateHub deployment process...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    exit /b 1
)

echo ✅ Requirements check passed

:: Check environment files
echo 🔧 Checking environment configuration...
if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Please copy .env.example to .env and configure it.
) else (
    echo ✅ Backend environment file found
)

if not exist "frontend\.env" (
    echo ⚠️  Frontend .env file not found. Please copy .env.example to .env and configure it.
) else (
    echo ✅ Frontend environment file found
)

:: Build backend
echo 🏗️  Building backend...
cd backend

if not exist "node_modules" (
    echo ⚠️  Installing backend dependencies...
    npm install
)

echo ✅ Building TypeScript...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    exit /b 1
)

echo ✅ Backend build completed
cd ..

:: Build frontend
echo 🎨 Building frontend...
cd frontend

if not exist "node_modules" (
    echo ⚠️  Installing frontend dependencies...
    npm install
)

echo ✅ Building React app...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)

echo ✅ Frontend build completed
cd ..

echo.
echo 🎉 Deployment preparation completed!
echo.
echo Next steps:
echo 1. Configure your environment variables in deployment platforms
echo 2. Deploy backend to Vercel: cd backend ^&^& vercel --prod
echo 3. Deploy frontend to Netlify (or connect via Git)
echo 4. Update frontend .env with your deployed backend URL
echo 5. Run database seeding: cd backend ^&^& npm run seed
echo.
echo 📖 For detailed instructions, see DEPLOYMENT.md

pause
