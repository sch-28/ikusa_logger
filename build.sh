#!/bin/bash
set -e  

log() {
    echo "[INFO] $1"
}

error_exit() {
    echo "[ERROR] $1"
    exit 1
}

# Build the logger
log "Building the logger..."
cd logger || error_exit "Logger directory missing"
log "Creating a virtual environment and installing dependencies..."
python3 -m venv .venv || error_exit "Failed to create virtual environment."
source .venv/bin/activate || error_exit "Failed to activate virtual environment."
pip install scapy pyinstaller  || error_exit "Failed to install dependencies."


log "Building the logger..."
{
    pyinstaller logger.spec -y
} || error_exit "PyInstaller build failed."


# Copy everything from logger/dist/logger to dist/ikusa-logger/logger/
log "Copying logger files..."
cd .. || error_exit "Failed to return to parent directory."
mkdir -p dist/ikusa-logger/logger
cp -r logger/dist/logger/* dist/ikusa-logger/logger/ || error_exit "Failed to copy logger files."


# Install Dependencies for the Frontend
log "Installing frontend dependencies..."
cd ui || error_exit "Missing UI directory"
npm install || error_exit "NPM install failed."


# Compile the program
log "Compiling the program..."
cd .. || error_exit "Failed to return to parent directory."
neu() {
    ./ui/node_modules/.bin/neu "$@"
}

neu update || error_exit "Neutralino.js update failed."
neu build || error_exit "Neutralino.js build failed."

# allow scapy to read network
log "Setting capabilities for the logger binary..."
sudo setcap cap_net_raw=eip ./dist/ikusa-logger/ikusa-logger-linux_x64
sudo setcap cap_net_raw=eip ./dist/ikusa-logger/logger/logger

log "Build completed. Compiled files are in dist/ikusa-logger/"
log "All tasks completed successfully."
