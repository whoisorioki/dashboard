#!/bin/bash

# This script starts the backend server
# Activate the virtual environment and start the backend FastAPI server

# Store the current directory
CURRENT_DIR=$(pwd)
VENV_PATH="$CURRENT_DIR/.venv"

# Detect operating system
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows with Git Bash
    ACTIVATE_SCRIPT="$VENV_PATH/Scripts/activate"
    PYTHON_EXEC="$VENV_PATH/Scripts/python.exe"
    PIP_EXEC="$VENV_PATH/Scripts/pip.exe"
else
    # Unix-like systems (Linux/Mac)
    ACTIVATE_SCRIPT="$VENV_PATH/bin/activate"
    PYTHON_EXEC="$VENV_PATH/bin/python"
    PIP_EXEC="$VENV_PATH/bin/pip"
fi

# Check if virtual environment exists, if not create it
if [ ! -d "$VENV_PATH" ]; then
    echo "Virtual environment not found. Creating one..."
    python -m venv "$VENV_PATH"
    
    # Install dependencies
    echo "Installing dependencies..."
    "$PIP_EXEC" install -r "$CURRENT_DIR/backend/requirements.txt"
fi

# Activate the virtual environment
echo "Activating virtual environment..."
if [ -f "$ACTIVATE_SCRIPT" ]; then
    source "$ACTIVATE_SCRIPT"
else
    echo "Error: Virtual environment activation script not found at $ACTIVATE_SCRIPT"
    echo "Please ensure the virtual environment is properly created."
    exit 1
fi

# Navigate to the backend directory
cd "$CURRENT_DIR/backend"

# Add the backend directory to PYTHONPATH to allow relative imports
export PYTHONPATH="$CURRENT_DIR/backend"
    
# Start the backend server
echo "Starting backend server at http://localhost:8000..."
echo "GraphQL endpoint: http://localhost:8000/graphql"
echo "API documentation: http://localhost:8000/docs"

if [ -f "$PYTHON_EXEC" ]; then
    "$PYTHON_EXEC" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Error: Python executable not found at $PYTHON_EXEC"
    echo "Please ensure the virtual environment is properly created."
    exit 1
fi
