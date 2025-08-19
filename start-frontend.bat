@echo off
REM This script starts the frontend server on Windows

REM Store the current directory
set CURRENT_DIR=%CD%
set FRONTEND_DIR=%CURRENT_DIR%\frontend

REM Navigate to frontend directory
cd "%FRONTEND_DIR%"

REM Check if node_modules exists, if not, run npm install
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Make sure all dependencies are installed
echo Making sure all dependencies are installed...
npm install

REM Generate GraphQL types (if backend is running)
echo Generating GraphQL types...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8000/graphql' -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    npm run codegen
    echo GraphQL types generated successfully!
) else (
    echo Warning: Backend not running. GraphQL types not generated.
    echo Start the backend first with: start-backend.bat
)

REM Use direct command to run vite
echo Starting frontend server at http://localhost:5173...
echo Make sure backend is running at http://localhost:8000 for full functionality
node ".\node_modules\vite\bin\vite.js"

pause
