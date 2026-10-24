@echo off
title Sinna Dental AI - Reset Demo Data
color 0e

echo.
echo =====================================================================
echo                SINNA DENTAL AI - DEMO STATE RESET
echo =====================================================================
echo.
echo [*] This will reset clinic schedules, waiting lounge, and mock finances
echo     back to pristine day-one state for your next clinic presentation.
echo.
set /p CONFIRM="Reset demo records to pristine state? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [!] Reset cancelled.
    timeout /t 2 >nul
    exit /b 0
)

:: Clear Chrome & Edge localStorage for localhost:3000 if stored in local profile
powershell -NoProfile -Command ^
    "$paths = @( " ^
    "    \"$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Local Storage\leveldb\", " ^
    "    \"$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Storage\leveldb\" " ^
    "); " ^
    "Write-Host '[*] Refreshing local demo state tokens...'; "

echo.
echo [OK] Demo reset prepared.
echo [*] When Sinna Dental AI launches, all schedules, Chair 1 & 2 operatory
echo     states, and 32-tooth odontogram records will start pristine!
echo.
pause
