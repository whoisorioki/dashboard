# Dashboard Docker Setup

This project has been fully Dockerized for easy development and deployment.

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Start the Application

#### For Development (recommended for testing)
```bash
# Using PowerShell script (Windows)
.\docker-manager.ps1 dev

# Or using docker-compose directly
docker-compose -f docker-compose.dev.yml up -d
```

#### For Production (with full Druid stack)
```bash
# Using PowerShell script (Windows)
.\docker-manager.ps1 up

# Or using docker-compose directly
docker-compose up -d
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Backend Docs**: http://localhost:8000/docs
- **Druid Console**: http://localhost:8081 (production mode only)

## Available Commands

### Using PowerShell Script (Windows)
```powershell
.\docker-manager.ps1 <command>
```

### Using Make (Linux/Mac)
```bash
make <command>
```

### Available Commands:
- `build` - Build all Docker images
- `up` - Start production environment
- `dev` - Start development environment
- `down` - Stop all services
- `logs` - View logs from all services
- `clean` - Clean up containers, networks, and volumes
- `restart` - Restart all services
- `test` - Run data quality tests
- `status` - Check service status

## Development vs Production

### Development Mode
- Frontend runs with Vite dev server (hot reload)
- Backend runs with uvicorn reload
- Uses external Druid (configure DRUID_BROKER_HOST)
- Faster startup, better for development

### Production Mode
- Complete Druid stack included
- Frontend served via Nginx
- All services optimized for production
- Longer startup time but full system

## Testing the Data Pipeline

Once the services are running, test the data cleaning pipeline:

```bash
# Using PowerShell script
.\docker-manager.ps1 test

# Or manually
docker-compose exec backend python test_with_druid_data.py
```

## Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
# Druid Configuration
DRUID_BROKER_HOST=druid-broker
DRUID_BROKER_PORT=8888
DRUID_DATASOURCE=sales_data

# Database Configuration
POSTGRES_DB=druid
POSTGRES_USER=druid
POSTGRES_PASSWORD=druid
```

## Troubleshooting

### Services won't start
```bash
# Check logs
.\docker-manager.ps1 logs

# Clean and rebuild
.\docker-manager.ps1 clean
.\docker-manager.ps1 build
.\docker-manager.ps1 up
```

### Backend connection issues
```bash
# Check backend logs
.\docker-manager.ps1 backend-logs

# Check backend health
curl http://localhost:8000/health
```

### Druid connection issues
```bash
# Check if Druid services are running
.\docker-manager.ps1 status

# Wait for Druid to fully start (can take 2-3 minutes)
curl http://localhost:8888/druid/v2/datasources
```

## File Structure

```
dashboard/
├── backend/
│   ├── Dockerfile              # Production backend image
│   └── ...
├── frontend/
│   ├── Dockerfile              # Production frontend image
│   ├── Dockerfile.dev          # Development frontend image
│   ├── nginx.conf              # Nginx configuration
│   └── ...
├── docker-compose.yml          # Production stack
├── docker-compose.dev.yml      # Development stack
├── docker-manager.ps1          # Windows management script
├── Makefile                    # Linux/Mac management
├── .dockerignore               # Docker ignore file
└── init-db.sql                 # Database initialization
```

## Data Pipeline Features

The Dockerized setup includes:

✅ **Complete data cleaning pipeline**
✅ **RESTful API endpoints**
✅ **Real-time data processing**
✅ **Health checks and monitoring**
✅ **Logging and debugging**
✅ **Development hot-reload**
✅ **Production optimization**

The data cleaning pipeline handles:
- Schema consolidation
- Text normalization
- Type correction
- Business rule enforcement
- Outlier filtering

API endpoints available:
- `/cleaning-report` - Data quality metrics
- `/schema-info` - Data schema information
- `/sample-cleaning` - Text cleaning samples
