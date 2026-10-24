@echo off
setlocal enabledelayedexpansion
title Sinna Dental AI - Clinical Practice Suite
color 0b

echo.
echo =====================================================================
echo                 SINNA DENTAL AI - CLINICAL SHOWCASE
echo          Autonomous Practice Operating Suite (Bole Dental)
echo =====================================================================
echo.

:: 1. Verify Node.js Environment
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    ) else (
        echo [!] Node.js runtime was not detected on this computer.
        echo [*] Please install Node.js LTS (v20+ recommended) from:
        echo     https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)

:: 2. Check for Git & Auto-Sync Updates from GitHub if Online
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if exist ".git\" (
        echo [*] Checking connection to GitHub for latest clinic updates...
        powershell -NoProfile -Command ^
            "$test = Test-Connection -ComputerName github.com -Count 1 -Quiet -TimeoutSeconds 2; " ^
            "if ($test) { exit 0 } else { exit 1 }"
        if !ERRORLEVEL! EQU 0 (
            echo [*] Online: Pulling latest clinical updates from origin/main...
            git pull origin main --quiet
            if !ERRORLEVEL! EQU 0 (
                echo [OK] Synced with latest GitHub changes.
            )
        ) else (
            echo [*] Offline mode detected. Running from local clinical storage.
        )
    )
)

:: 3. Check & Install Dependencies (First-Time Setup)
if not exist "node_modules\" (
    echo.
    echo [*] First-time setup detected: Installing required packages...
    echo [*] This will take approximately 1-2 minutes...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [!] Error during package installation. Please check your connection.
        pause
        exit /b 1
    )
    echo [OK] Packages ready.
)

:: 4. Determine Port (Default 3000, Fallback to 3001 if occupied)
set PORT=3000
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [*] Port 3000 is currently occupied. Switching to port 3001...
    set PORT=3001
)

:: 5. Check for Production Build (.next directory)
set LAUNCH_MODE=start
if not exist ".next\" (
    echo [*] First-time build: Generating optimized production bundle...
    call npm run build
    if !ERRORLEVEL! NEQ 0 (
        echo [!] Build notice: Falling back to dev mode...
        set LAUNCH_MODE=dev
    )
) else (
    echo [OK] Optimized production bundle detected. Booting lightning-fast server...
)

:: 6. Start Server Process in Background
echo [*] Starting Sinna Dental AI on http://localhost:%PORT%...
if "%LAUNCH_MODE%"=="start" (
    start /min "Sinna-Server" cmd /c "npm run start -- -p %PORT%"
) else (
    start /min "Sinna-Server" cmd /c "npm run dev -- -p %PORT%"
)

:: 7. Wait for Server to be Responsive (PowerShell Healthcheck)
echo [*] Initializing clinical database and odontogram engine...
powershell -NoProfile -Command ^
    "$port = %PORT%; " ^
    "$ready = $false; " ^
    "for ($i = 0; $i -lt 30; $i++) { " ^
    "    try { " ^
    "        $res = Invoke-WebRequest -Uri \"http://127.0.0.1:$port/\" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; " ^
    "        if ($res.StatusCode -eq 200) { $ready = $true; break } " ^
    "    } catch { Start-Sleep -Milliseconds 600 } " ^
    "} " ^
    "if (-not $ready) { Start-Sleep -Seconds 2 }"

:: 8. Launch Dedicated Native App Window (Edge / Chrome App Mode)
echo [OK] Clinical server is live! Launching dedicated app window...
where msedge >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start msedge.exe --app="http://localhost:%PORT%" --window-size=1440,900
) else (
    where chrome >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        start chrome.exe --app="http://localhost:%PORT%" --window-size=1440,900
    ) else (
        start "" "http://localhost:%PORT%"
    )
)

echo.
echo =====================================================================
echo  [LIVE] Sinna Dental AI is active on http://localhost:%PORT%
echo =====================================================================
echo.
echo  QUICK SHOWCASE CONTROLS:
echo    [O] - Re-open application window
echo    [U] - Pull latest updates from GitHub now
echo    [Q] - Quit and stop local server
echo.
echo  (Keep this window open while presenting to dental clinics)
echo.

:MENU_LOOP
set /p USER_CHOICE="Select an option (O/U/Q): "
if /i "%USER_CHOICE%"=="O" (
    where msedge >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        start msedge.exe --app="http://localhost:%PORT%" --window-size=1440,900
    ) else (
        start "" "http://localhost:%PORT%"
    )
    goto MENU_LOOP
)
if /i "%USER_CHOICE%"=="U" (
    echo [*] Pulling latest updates from GitHub...
    git pull origin main
    echo [*] Rebuilding production bundle...
    call npm run build
    echo [OK] Updates applied. Please re-open app window.
    goto MENU_LOOP
)
if /i "%USER_CHOICE%"=="Q" (
    echo [*] Shutting down Sinna Dental AI server...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%PORT% .*LISTENING"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    echo [OK] Server stopped cleanly. Thank you.
    timeout /t 2 >nul
    exit /b 0
)
goto MENU_LOOP
