#!/usr/bin/env bash
# =====================================================================
#             SINNA DENTAL AI - BASH REFRESH & GIT SYNC
# =====================================================================

set -e

echo "====================================================================="
echo "              SINNA DENTAL AI GIT SYNC & REFRESH"
echo "====================================================================="
echo ""

# 1. Pull latest changes
echo "[*] Pulling latest updates from GitHub..."
git pull origin main

# 2. Update dependencies
echo "[*] Installing/updating packages..."
npm install

# 3. Launch browser helper
open_browser() {
    sleep 3
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000"
    elif command -v open &> /dev/null; then
        open "http://localhost:3000"
    else
        echo "[*] Open http://localhost:3000 in your browser."
    fi
}

open_browser &

# 4. Launch app
echo "[*] Starting Sinna Dental AI on http://localhost:3000..."
npm run dev
