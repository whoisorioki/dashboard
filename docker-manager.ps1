# Docker Management Script for Windows
param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

function Show-Help {
    Write-Host "Available commands:" -ForegroundColor Green
    Write-Host "  build     - Build all Docker images"
    Write-Host "  up        - Start all services (production)"
    Write-Host "  down      - Stop all services"
    Write-Host "  dev       - Start development environment"
    Write-Host "  logs      - View logs from all services"
    Write-Host "  clean     - Clean up containers, networks, and volumes"
    Write-Host "  restart   - Restart all services"
    Write-Host "  test      - Run data quality tests"
    Write-Host "  status    - Check service status"
}

switch ($Command.ToLower()) {
    "help" {
        Show-Help
    }
    "build" {
        Write-Host "Building all Docker images..." -ForegroundColor Yellow
        docker-compose build
    }
    "up" {
        Write-Host "Starting production environment..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "Services started! Frontend: http://localhost:3000, Backend: http://localhost:8000" -ForegroundColor Green
    }
    "down" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        docker-compose down
    }
    "dev" {
        Write-Host "Starting development environment..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml up -d
        Write-Host "Development environment started! Frontend: http://localhost:3000, Backend: http://localhost:8000" -ForegroundColor Green
    }
    "dev-down" {
        Write-Host "Stopping development environment..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml down
    }
    "logs" {
        docker-compose logs -f
    }
    "dev-logs" {
        docker-compose -f docker-compose.dev.yml logs -f
    }
    "clean" {
        Write-Host "Cleaning up Docker resources..." -ForegroundColor Red
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
    }
    "restart" {
        Write-Host "Restarting all services..." -ForegroundColor Yellow
        docker-compose down
        docker-compose up -d
    }
    "dev-restart" {
        Write-Host "Restarting development services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up -d
    }
    "test" {
        Write-Host "Running data quality tests..." -ForegroundColor Cyan
        docker-compose exec backend python test_with_druid_data.py
    }
    "status" {
        docker-compose ps
    }
    "backend-logs" {
        docker-compose logs -f backend
    }
    "frontend-logs" {
        docker-compose logs -f frontend
    }
    "backend-shell" {
        docker-compose exec backend bash
    }
    "frontend-shell" {
        docker-compose exec frontend sh
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
