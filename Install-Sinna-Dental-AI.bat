@echo off
setlocal enabledelayedexpansion
title Sinna Dental AI - 1-Click Setup and Launcher
color 0b

echo.
echo =====================================================================
echo               SINNA DENTAL AI - 1-CLICK CLINIC SETUP
echo            Autonomous Practice Suite - Offline Native App
echo =====================================================================
echo.

:: 1. Verify Node.js Environment
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 goto NODE_FOUND

if exist "%SystemDrive%\Program Files\nodejs\node.exe" (
    set "PATH=%SystemDrive%\Program Files\nodejs;%PATH%"
    goto NODE_FOUND
)
if exist "%SystemDrive%\Program Files (x86)\nodejs\node.exe" (
    set "PATH=%SystemDrive%\Program Files (x86)\nodejs;%PATH%"
    goto NODE_FOUND
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    goto NODE_FOUND
)

echo.
echo [X] Node.js was not detected on this computer.
echo [*] Please download and install Node.js LTS from: https://nodejs.org/
echo [*] After installing Node.js, double-click this file again.
echo.
pause
exit /b 1

:NODE_FOUND
echo [OK] Node.js is ready:
node -v

:: 2. Locate Git (System PATH or GitHub Desktop)
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 goto GIT_READY

for /d %%d in ("%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd") do (
    if exist "%%d\git.exe" (
        set "PATH=%%d;!PATH!"
        goto GIT_READY
    )
)
for /d %%d in ("%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\bin") do (
    if exist "%%d\git.exe" (
        set "PATH=%%d;!PATH!"
        goto GIT_READY
    )
)

:GIT_READY
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Git engine located.
) else (
    echo [*] Git CLI not found in PATH - will use direct HTTPS download.
)

:: 3. Acquire Project Codebase
set "TARGET_DIR=%~dp0SinnaAI"
if exist "%~dp0package.json" (
    echo [OK] Running directly inside Sinna project directory.
    set "TARGET_DIR=%~dp0"
    goto CONFIGURE_PROJECT
)

if exist "%TARGET_DIR%\package.json" (
    echo [OK] SinnaAI directory already exists. Syncing updates...
    cd /d "%TARGET_DIR%"
    where git >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        git pull origin main --quiet 2>nul
    )
    goto CONFIGURE_PROJECT
)

echo.
echo [*] Downloading Sinna Dental AI platform from GitHub...
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [*] Cloning via Git...
    git clone https://github.com/Dagmawialebachew/SinnaAI.git "%TARGET_DIR%"
) else (
    echo [*] Downloading project zip directly via secure HTTPS...
    powershell -NoProfile -Command ^
        "$zipPath = Join-Path $env:TEMP 'sinna_source.zip'; " ^
        "$tempExtract = Join-Path $env:TEMP 'sinna_extract'; " ^
        "Invoke-WebRequest -Uri 'https://github.com/Dagmawialebachew/SinnaAI/archive/refs/heads/main.zip' -OutFile $zipPath; " ^
        "Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force; " ^
        "$inner = Join-Path $tempExtract 'SinnaAI-main'; " ^
        "Move-Item -Path $inner -Destination '%TARGET_DIR%'; " ^
        "Remove-Item -Path $zipPath -Force; " ^
        "Remove-Item -Path $tempExtract -Recurse -Force"
)

if not exist "%TARGET_DIR%\package.json" (
    echo.
    echo [X] Failed to download Sinna Dental AI files. Please check your internet connection.
    pause
    exit /b 1
)

cd /d "%TARGET_DIR%"

:CONFIGURE_PROJECT
:: 4. Ensure .env is present
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
    ) else (
        echo DATABASE_URL="postgresql://postgres:sinna_secret_2026@localhost:5433/sinna_dental_db?schema=public"> .env
        echo JWT_SECRET="sinna_clinical_secret_key_9938172648_addis_ababa">> .env
        echo GEMINI_API_KEY="">> .env
    )
)

:: 5. Install Dependencies (First-Time Only)
if not exist "node_modules\" (
    echo.
    echo [*] Installing required clinical packages - one-time setup...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Dependency installation failed. Please check your connection.
        pause
        exit /b 1
    )
    echo [OK] Clinical packages installed successfully.
)

:: 6. Compile Optimized Production Bundle
if not exist ".next\BUILD_ID" (
    echo.
    echo [*] Compiling optimized clinical production bundle...
    call npm run build
    if !ERRORLEVEL! NEQ 0 (
        echo [!] Production compilation warning: Falling back to fast dev mode...
    ) else (
        echo [OK] Production bundle compiled successfully.
    )
)

:: 7. Create Permanent Desktop Shortcut
powershell -NoProfile -Command ^
    "$wsh = New-Object -ComObject WScript.Shell; " ^
    "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
    "$sc = $wsh.CreateShortcut((Join-Path $desktop 'Sinna Dental AI.lnk')); " ^
    "$sc.TargetPath = (Join-Path '%CD%' 'Sinna-Dental-AI.bat'); " ^
    "$sc.WorkingDirectory = '%CD%'; " ^
    "$sc.Description = 'Sinna Dental AI - Clinical Operating Platform'; " ^
    "$sc.Save()" 2>nul
echo [OK] Created 'Sinna Dental AI' shortcut on your Windows Desktop!

:: 8. Launch the Application Now
echo.
echo =====================================================================
echo  [SUCCESS] Sinna Dental AI is ready! Booting dedicated app window...
echo =====================================================================
echo.
timeout /t 2 >nul
call "%CD%\Sinna-Dental-AI.bat"
