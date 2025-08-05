@echo off
echo 🚀 Sahay - Dual Deployment Helper (Netlify + Render)
echo =====================================================

echo.
echo 📋 Step 1: Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Installing backend dependencies...
cd ..\server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 🔨 Step 3: Building the frontend application...
cd ..\client
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo.
echo ✅ All builds completed successfully!
echo.
echo 🎯 Deployment Options:
echo.
echo Option 1: Netlify Only (Frontend + Serverless Backend)
echo - Simpler setup, everything on Netlify
echo - Set REACT_APP_USE_RENDER=false
echo.
echo Option 2: Dual Platform (Recommended)
echo - Frontend: Netlify
echo - Backend: Render
echo - Set REACT_APP_USE_RENDER=true
echo.
echo 📝 Next steps:
echo 1. Push your code to GitHub
echo 2. Choose your deployment option
echo 3. Follow the instructions in DEPLOYMENT.md
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
echo.
pause 