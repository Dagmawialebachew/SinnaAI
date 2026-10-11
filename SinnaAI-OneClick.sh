#!/usr/bin/env bash
# =====================================================================
#             SINNA DENTAL AI - ONE-CLICK INSTALLER & LAUNCHER
# =====================================================================

set -e

echo "====================================================================="
echo "            SINNA DENTAL AI - ONE-CLICK INSTALLER"
echo "====================================================================="
echo ""

# 1. Install Git if missing
if ! command -v git &> /dev/null; then
    echo "[!] Git not found. Installing Git..."
    if command -v brew &> /dev/null; then
        brew install git
    elif command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y git
    fi
fi

# 2. Install Node.js if missing
if ! command -v node &> /dev/null; then
    echo "[!] Node.js not found. Installing Node.js..."
    if command -v brew &> /dev/null; then
        brew install node
    elif command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "[X] Please install Node.js (v18+) from: https://nodejs.org/"
        exit 1
    fi
fi

# 3. Clone or Update
if [ ! -d "SinnaAI" ]; then
    if [ -f "package.json" ]; then
        echo "[OK] Running inside existing repo directory."
    else
        echo "[*] Cloning SinnaAI from GitHub..."
        git clone https://github.com/Dagmawialebachew/SinnaAI.git
        cd SinnaAI
    fi
else
    echo "[*] Updating SinnaAI..."
    cd SinnaAI
    git pull origin main
fi

# 4. Install dependencies
if [ ! -d "node_modules" ]; then
    echo "[*] Installing dependencies..."
    npm install
fi

# 5. Open browser helper
open_browser() {
    sleep 3
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000"
    elif command -v open &> /dev/null; then
        open "http://localhost:3000"
    fi
}

open_browser &

# 6. Start server
echo "[*] Launching Sinna Dental AI on http://localhost:3000..."
npm run dev
