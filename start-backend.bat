@echo off
REM This script starts the backend server on Windows
REM Activate the virtual environment and start the backend FastAPI server

REM Store the current directory
set CURRENT_DIR=%CD%
set VENV_PATH=%CURRENT_DIR%\.venv

REM Check if virtual environment exists, if not create it
if not exist "%VENV_PATH%" (
    echo Virtual environment not found. Creating one...
    python -m venv "%VENV_PATH%"
    
    REM Install dependencies
    echo Installing dependencies...
    "%VENV_PATH%\Scripts\pip.exe" install -r "%CURRENT_DIR%\backend\requirements.txt"
)

REM Activate the virtual environment
echo Activating virtual environment...
call "%VENV_PATH%\Scripts\activate.bat"

REM Navigate to the backend directory
cd "%CURRENT_DIR%\backend"

REM Add the backend directory to PYTHONPATH to allow relative imports
set PYTHONPATH=%CURRENT_DIR%\backend
    
REM Start the backend server
echo Starting backend server at http://localhost:8000...
echo GraphQL endpoint: http://localhost:8000/graphql
echo API documentation: http://localhost:8000/docs
"%VENV_PATH%\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
