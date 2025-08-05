@echo off
echo Starting Sahay - Community Health Clinic Management System
echo.

echo Starting MongoDB (if not already running)...
echo Please ensure MongoDB is installed and running on your system
echo.

echo Starting Backend Server...
start "Sahay Backend" cmd /k "cd server && npm start"

echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Application...
start "Sahay Frontend" cmd /k "cd client && npm start"

echo.
echo Sahay is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul 