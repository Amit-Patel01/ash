@echo off
title SolutionHub Launcher
echo ==========================================
echo Starting SolutionHub Development Servers...
echo ==========================================
echo.

:: Add Node.js to the path temporarily for this session
set PATH=%PATH%;C:\Program Files\nodejs

:: Verify node exists
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js could not be found at C:\Program Files\nodejs or in your PATH.
    echo Please make sure Node.js is installed.
    pause
    exit /b
)

echo [1/2] Starting Backend Server...
start "SolutionHub Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Frontend Server...
start "SolutionHub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate terminal windows!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
