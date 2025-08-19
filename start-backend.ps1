# This script starts the backend server
# Activate the virtual environment and start the backend FastAPI server

# Store the current directory
$currentDir = Get-Location
$venvPath = Join-Path $currentDir ".venv"

# Check if virtual environment exists, if not create it
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv $venvPath
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & "$venvPath\Scripts\pip" install -r (Join-Path $currentDir "backend\requirements.txt")
}

# Activate the virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
try {
    & "$venvPath\Scripts\Activate.ps1"
}
catch {
    Write-Host "Error activating virtual environment. Make sure Python is installed correctly." -ForegroundColor Red
    exit 1
}

# Navigate to the backend directory
Set-Location (Join-Path $currentDir "backend")

# Add the backend directory to PYTHONPATH to allow relative imports
$env:PYTHONPATH = (Join-Path $currentDir "backend")
    
# Start the backend server
Write-Host "Starting backend server at http://localhost:8000..." -ForegroundColor Green
Write-Host "GraphQL endpoint: http://localhost:8000/graphql" -ForegroundColor Cyan
Write-Host "API documentation: http://localhost:8000/docs" -ForegroundColor Cyan
& "$venvPath\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
