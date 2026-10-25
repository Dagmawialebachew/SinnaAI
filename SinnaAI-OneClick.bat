@echo off
setlocal enabledelayedexpansion
title Sinna Dental AI - Auto Setup and Launcher
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

:: 3. Check for packages and build
call "%~dp0Sinna-Dental-AI.bat"
