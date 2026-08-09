@echo off
title AmitSolutionHub Launcher
echo ==========================================
echo Starting AmitSolutionHub Next.js Application...
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

echo Starting AmitSolutionHub Next.js Monolith Server...
npm run dev

pause
