# Deployment Guide

## System Architecture

```
Frontend (React/Vite) ←→ Backend (FastAPI) ←→ Druid Cluster
     :5173                    :8000              :8888 (Router)
```

## Prerequisites

### Running Services
Before starting the dashboard, ensure these services are running:

1. **Druid Cluster** (Docker)
   - Router: `localhost:8888`
   - Broker: `localhost:8082`
   - Coordinator: `localhost:8081`

2. **Python 3.12+** installed
3. **Node.js 18+** installed

## Quick Start

### Option 1: Use the Master Script (Recommended)

```powershell
# Start both backend and frontend
.\start-system.ps1 -Both

# Or start individually
.\start-system.ps1 -Backend
.\start-system.ps1 -Frontend

# Check system status
.\start-system.ps1 -Status

# Run connection tests
.\start-system.ps1 -Test
```

### Option 2: Manual Setup

#### 1. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Configuration

### Backend (.env)
```env
DRUID_BROKER_HOST=localhost
DRUID_BROKER_PORT=8888
DRUID_DATASOURCE=sales_data
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:5173
ENV=development
DEBUG=true
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
VITE_ENV=development
```

## Verification & Testing

### 1. Service Health Check

Visit these URLs to verify services:

- **Druid Console**: http://localhost:8888
- **Backend API Docs**: http://localhost:8000/docs
- **Frontend Dashboard**: http://localhost:5173
- **Debug Page**: http://localhost:5173/debug.html

### 2. Connection Test Script

Run the automated connection test:
```powershell
python test-connections.py
```

### 3. Manual API Tests

Test backend endpoints:
```bash
# Health check
curl http://localhost:8000/api/health

# Druid connection
curl http://localhost:8000/api/health/druid

# Available datasources
curl http://localhost:8000/api/druid/datasources
```

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start
- **Check Python version**: `python --version` (should be 3.12+)
- **Check virtual environment**: Ensure `.venv` is activated
- **Check dependencies**: Run `pip install -r backend/requirements.txt`
- **Check ports**: Ensure port 8000 is not in use

#### 2. Frontend Won't Start
- **Check Node version**: `node --version` (should be 18+)
- **Clear node_modules**: Delete `frontend/node_modules` and run `npm install`
- **Check ports**: Ensure port 5173 is not in use

#### 3. Druid Connection Issues
- **Verify Druid is running**: Check http://localhost:8888
- **Check Druid datasources**: Ensure you have data loaded
- **Network connectivity**: Test `curl http://localhost:8888/status`

#### 4. CORS Issues
- **Check frontend URL**: Verify `FRONTEND_URL` in backend `.env`
- **Browser console**: Check for CORS error messages
- **Backend logs**: Check uvicorn logs for CORS warnings

### Debug Mode

Start the debug page for detailed connection testing:
```powershell
# Open debug page
start http://localhost:5173/debug.html
```

## Production Deployment

### Environment Variables

Update environment files for production:

**Backend (.env.production)**:
```env
DRUID_BROKER_HOST=your-druid-host
DRUID_BROKER_PORT=8888
FRONTEND_URL=https://your-domain.com
ENV=production
DEBUG=false
```

**Frontend (.env.production)**:
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ENV=production
```

### Build Commands

```powershell
# Build frontend for production
cd frontend
npm run build

# The built files will be in frontend/dist/
```

### Deployment Options

1. **Docker**: Create Dockerfiles for both services
2. **Cloud Services**: Deploy to AWS, Azure, or GCP
3. **VPS**: Deploy to a virtual private server
4. **Reverse Proxy**: Use Nginx to serve both services

## Monitoring

### Health Endpoints

- Backend API: `GET /api/health`
- Druid Health: `GET /api/health/druid`
- System Status: Use the frontend connection status component

### Logs

- **Backend**: uvicorn logs in terminal
- **Frontend**: Browser console
- **Druid**: Docker container logs

## Performance Tips

1. **Druid Optimization**: Ensure proper indexing and segment optimization
2. **API Caching**: Implement Redis for API response caching
3. **Frontend Optimization**: Use React Query for intelligent data fetching
4. **Connection Pooling**: Configure database connection pools
