@echo off
title Sinna Dental AI - Live Hot-Reload Server
echo =====================================================================
echo              SINNA DENTAL AI - AUTO-RELOAD DEV SERVER
echo   (Every file change is instantly reloaded without npm run build)
echo =====================================================================
echo.
echo [*] Starting Next.js Dev Server with Instant Fast Refresh...
echo [*] Opening http://localhost:3000 in your browser...
echo.

start "" powershell -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

call npm run dev
