#!/bin/bash

# Navigate to the directory of the script
cd "$(dirname "$0")/apps/popos-gui"

VENV_DIR=".venv"

# Check for python3 and venv
if ! command -v python3 &> /dev/null || ! python3 -m venv --help &> /dev/null; then
    echo "Error: python3 and/or python3-venv are not installed."
    echo "Please install them to continue."
    echo "On Debian/Ubuntu/Pop!_OS: sudo apt update && sudo apt install python3 python3-venv"
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv $VENV_DIR
fi

# Activate the virtual environment and run the GUI
echo "Launching Firecrawl GUI..."
source $VENV_DIR/bin/activate
python3 gui.py
deactivate
