@echo off
setlocal enabledelayedexpansion
title Sinna Dental AI - Auto Launcher

echo =====================================================================
echo                     SINNA DENTAL AI LAUNCHER
echo              Clinical Practice Management Platform
echo =====================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js was not detected on this computer.
    echo [*] Attempting automated installation via Windows Package Manager (winget)...
    where winget >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [*] Installing Node.js LTS automatically. Please approve any Administrator prompt...
        winget install OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
        echo [*] Refreshing system environment PATH...
        call refreshenv >nul 2>nul
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else (
        echo.
        echo [X] Winget is not available on this Windows version.
        echo [*] Downloading Node.js LTS installer directly via PowerShell...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\nodejs_installer.msi'"
        echo [*] Launching Node.js installer. Please complete the quick setup wizard...
        start /wait msiexec /i "%TEMP%\nodejs_installer.msi" /passive
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    )
)

:: Re-verify Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Node.js is still not detected in your PATH.
    echo [*] If you just installed it, please close this window and double-click start.bat again.
    echo [*] Or download and run Node.js LTS manually from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed:
node -v
echo [OK] NPM is ready:
call npm -v
echo.

:: 2. Check for node_modules
if not exist "node_modules\" (
    echo [*] First-time setup detected: Installing required packages...
    echo [*] This will take approximately 1-2 minutes depending on your internet speed.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Error during package installation. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [OK] Packages installed successfully.
    echo.
)

:: 3. Launch the Application & Open Browser
echo [*] Starting Sinna Dental AI application server on http://localhost:3000...
echo [*] Opening your web browser in 5 seconds...
echo.

start "" powershell -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"

:: Run Next.js dev server
call npm run dev

pause
