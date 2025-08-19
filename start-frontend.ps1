# This script starts the frontend server

# Store the current directory
$currentDir = Get-Location
$frontendDir = Join-Path $currentDir "frontend"

# Navigate to frontend directory
Set-Location $frontendDir

# Check if node_modules exists, if not, run npm install
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Make sure all dependencies are installed
Write-Host "Making sure all dependencies are installed..." -ForegroundColor Yellow
npm install

# Generate GraphQL types
Write-Host "Generating GraphQL types..." -ForegroundColor Yellow
npm run codegen

# Use direct command to run vite
Write-Host "Starting frontend server at http://localhost:5173..." -ForegroundColor Green
& "C:\Program Files\nodejs\node.exe" "./node_modules/vite/bin/vite.js"
