#!/usr/bin/env bash
# =====================================================================
#                 SINNA DENTAL AI - BASH AUTO LAUNCHER
# =====================================================================

set -e

echo "====================================================================="
echo "                SINNA DENTAL AI AUTO LAUNCHER"
echo "====================================================================="
echo ""

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[!] Node.js is not installed."
    echo "[*] Attempting to install Node.js via Package Manager..."
    if command -v brew &> /dev/null; then
        brew install node
    elif command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "[X] Please install Node.js (v18+) manually from: https://nodejs.org/"
        exit 1
    fi
fi

echo "[OK] Node.js version: $(node -v)"
echo "[OK] NPM version: $(npm -v)"
echo ""

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "[*] Installing project dependencies (first-time setup)..."
    npm install
fi

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

# 4. Start Next.js development server
echo "[*] Launching Sinna Dental AI on http://localhost:3000..."
npm run dev
