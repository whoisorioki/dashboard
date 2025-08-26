.PHONY: help build up down dev logs clean restart test

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build all Docker images"
	@echo "  up        - Start all services (production)"
	@echo "  down      - Stop all services"
	@echo "  dev       - Start development environment"
	@echo "  logs      - View logs from all services"
	@echo "  clean     - Clean up containers, networks, and volumes"
	@echo "  restart   - Restart all services"
	@echo "  test      - Run data quality tests"

# Build all images
build:
	docker-compose build

# Start production environment
up:
	docker-compose up -d

# Start development environment
dev:
	docker-compose -f docker-compose.dev.yml up -d

# Stop all services
down:
	docker-compose down

# Stop development services
dev-down:
	docker-compose -f docker-compose.dev.yml down

# View logs
logs:
	docker-compose logs -f

# View development logs
dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Clean up everything
clean:
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

# Restart services
restart: down up

# Restart development services
dev-restart: dev-down dev

# Run tests
test:
	docker-compose exec backend python test_with_druid_data.py

# Check status
status:
	docker-compose ps

# View backend logs
backend-logs:
	docker-compose logs -f backend

# View frontend logs
frontend-logs:
	docker-compose logs -f frontend

# Enter backend container
backend-shell:
	docker-compose exec backend bash

# Enter frontend container
frontend-shell:
	docker-compose exec frontend sh
