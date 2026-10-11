@echo off
setlocal enabledelayedexpansion
title Sinna Dental AI - Auto Updater & Refresher

echo =====================================================================
echo                 SINNA DENTAL AI - GIT SYNC & REFRESH
echo =====================================================================
echo.

:: 1. Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Git is not installed or not in your PATH.
    echo [*] Attempting automated Git installation via winget...
    where winget >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        winget install Git.Git -e --silent --accept-source-agreements --accept-package-agreements
        set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
    ) else (
        echo [X] Please install Git from: https://git-scm.com/downloads
        pause
        exit /b 1
    )
)

echo [*] Pulling latest code updates from GitHub (origin/main)...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo [!] Warning: git pull encountered an issue. Continuing with current local version...
) else (
    echo [OK] Codebase successfully updated to latest commit.
)
echo.

:: 2. Check dependencies
echo [*] Checking and updating npm packages...
call npm install
echo.

:: 3. Launch the Application & Open Browser
echo [*] Starting Sinna Dental AI application server on http://localhost:3000...
echo [*] Opening your web browser in 4 seconds...
echo.

start "" powershell -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"

call npm run dev

pause
