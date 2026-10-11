@echo off
setlocal enabledelayedexpansion
title Sinna Dental AI - One-Click Setup & Launcher

echo =====================================================================
echo                 SINNA DENTAL AI - ONE-CLICK INSTALLER
echo          Clinical Practice Management Platform (Bole Dental)
echo =====================================================================
echo.

:: 1. Check & Install Git if missing
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [*] Git not found. Installing Git automatically...
    where winget >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        winget install Git.Git -e --silent --accept-source-agreements --accept-package-agreements
        set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
    ) else (
        echo [*] Downloading Git installer via PowerShell...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.46.2.windows.1/Git-2.46.2-64-bit.exe' -OutFile '%TEMP%\git_setup.exe'"
        start /wait %TEMP%\git_setup.exe /VERYSILENT /NORESTART
        set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
    )
)

:: 2. Check & Install Node.js if missing
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [*] Node.js not found. Installing Node.js LTS automatically...
    where winget >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        winget install OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else (
        echo [*] Downloading Node.js installer via PowerShell...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\nodejs_installer.msi'"
        start /wait msiexec /i "%TEMP%\nodejs_installer.msi" /passive
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    )
)

:: Re-verify Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] If this is your first install of Node.js, please close and re-run this file.
    echo [*] Or install Node.js manually from: https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Clone repository or enter existing folder
if not exist "SinnaAI\" (
    if exist "package.json" (
        echo [OK] Running directly inside the Sinna project folder.
    ) else (
        echo [*] Downloading Sinna Dental AI from GitHub (https://github.com/Dagmawialebachew/SinnaAI.git)...
        git clone https://github.com/Dagmawialebachew/SinnaAI.git
        cd SinnaAI
    )
) else (
    echo [*] SinnaAI directory found. Syncing latest updates from GitHub...
    cd SinnaAI
    git pull origin main
)

:: 4. Install dependencies if node_modules missing
if not exist "node_modules\" (
    echo [*] Installing project dependencies (first-time setup)...
    echo [*] This will take approximately 1-2 minutes depending on your internet connection.
    call npm install
)

:: 5. Launch Application & Open Browser
echo.
echo =====================================================================
echo [OK] Starting Sinna Dental AI server on http://localhost:3000...
echo =====================================================================
echo.

start "" powershell -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"

call npm run dev

pause
