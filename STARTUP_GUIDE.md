# 🚀 **Startup Guide - Sales Analytics Dashboard**

## **Overview**

This guide explains how to start the Sales Analytics Dashboard with our refactored backend and GraphQL integration.

## **Prerequisites**

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Docker** (optional, for full stack deployment)

## **Quick Start**

### **Option 1: Individual Services (Recommended for Development)**

#### **1. Start Backend Server**

**Windows Command Prompt:**
```cmd
start-backend.bat
```

**Windows PowerShell:**
```powershell
.\start-backend.ps1
```

**Windows Git Bash / Linux/Mac:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Manual:**
```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Navigate to backend
cd backend

# Start server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend Endpoints:**
- **API**: http://localhost:8000
- **GraphQL**: http://localhost:8000/graphql
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

#### **2. Start Frontend Server**

**Windows Command Prompt:**
```cmd
start-frontend.bat
```

**Windows PowerShell:**
```powershell
.\start-frontend.ps1
```

**Windows Git Bash / Linux/Mac:**
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

**Manual:**
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if needed)
npm install

# Generate GraphQL types (requires backend running)
npm run codegen

# Start development server
npm run dev
```

**Frontend Endpoints:**
- **Application**: http://localhost:5173
- **Data Ingestion**: http://localhost:5173/data-ingestion

### **Option 2: Docker Compose (Full Stack)**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Docker Services:**
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5433
- **Druid**: http://localhost:8888

## **Platform-Specific Instructions**

### **Windows Users**

**Command Prompt (Recommended):**
```cmd
# Backend
start-backend.bat

# Frontend (in new Command Prompt window)
start-frontend.bat
```

**PowerShell:**
```powershell
# Backend
.\start-backend.ps1

# Frontend (in new PowerShell window)
.\start-frontend.ps1
```

**Git Bash:**
```bash
# Backend
./start-backend.sh

# Frontend (in new Git Bash window)
./start-frontend.sh
```

### **Linux/Mac Users**

```bash
# Make scripts executable
chmod +x start-backend.sh start-frontend.sh

# Backend
./start-backend.sh

# Frontend (in new terminal)
./start-frontend.sh
```

## **Development Workflow**

### **1. Backend Development**

```bash
# Start backend with auto-reload
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Test GraphQL endpoint
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### **2. Frontend Development**

```bash
# Start frontend with auto-reload
cd frontend
npm run dev

# Generate GraphQL types (when schema changes)
npm run codegen
```

### **3. GraphQL Development**

**GraphQL Playground:**
- Visit: http://localhost:8000/graphql
- Test queries and mutations
- View schema documentation

**Example Queries:**

```graphql
# Get task status
query GetTaskStatus($taskId: String!) {
  getIngestionTaskStatus(taskId: $taskId) {
    taskId
    status
    datasourceName
    originalFilename
    fileSize
    createdAt
  }
}

# Upload file
mutation UploadFile($file: Upload!, $dataSourceName: String!) {
  uploadSalesData(file: $file, dataSourceName: $dataSourceName) {
    taskId
    status
    datasourceName
    originalFilename
    fileSize
    createdAt
  }
}
```

## **Troubleshooting**

### **Common Issues**

#### **1. Backend Import Errors**
```bash
# Ensure PYTHONPATH is set correctly
export PYTHONPATH=/path/to/backend

# Or run from backend directory
cd backend
python -m uvicorn main:app --reload
```

#### **2. GraphQL Codegen Fails**
```bash
# Ensure backend is running
curl http://localhost:8000/graphql

# Run codegen manually
cd frontend
npm run codegen
```

#### **3. Virtual Environment Issues**
```bash
# Recreate virtual environment
rm -rf .venv
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r backend/requirements.txt
```

#### **4. Frontend Dependencies**
```bash
# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### **5. Windows Git Bash Issues**
If you're using Git Bash on Windows and encounter path issues:

```bash
# Use the Windows batch files instead
start-backend.bat
start-frontend.bat

# Or use PowerShell
.\start-backend.ps1
.\start-frontend.ps1
```

### **Port Conflicts**

If ports are already in use:

```bash
# Check what's using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Kill the process or use different ports
python -m uvicorn main:app --port 8001  # Backend
npm run dev -- --port 5174              # Frontend
```

## **Environment Configuration**

### **Backend Environment Variables**

Create `backend/.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/sales_analytics

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=sales-analytics-01

# Druid
DRUID_URL=http://localhost:8888

# Development
DEBUG=true
ENV=development
```

### **Frontend Environment Variables**

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_GRAPHQL_URL=http://localhost:8000/graphql
```

## **Production Deployment**

### **Docker Deployment**
```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### **Manual Deployment**
```bash
# Backend
cd backend
pip install -r requirements.txt
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd frontend
npm run build
npx serve -s dist -l 3000
```

## **Monitoring & Logs**

### **Backend Logs**
```bash
# View backend logs
tail -f backend/logs/app.log

# Docker logs
docker-compose logs -f backend
```

### **Frontend Logs**
```bash
# Browser developer tools
# Network tab for API calls
# Console for JavaScript errors
```

## **Testing**

### **Backend Tests**
```bash
cd backend
python -m pytest tests/
```

### **Frontend Tests**
```bash
cd frontend
npm test
```

### **End-to-End Tests**
```bash
# Start both services
./start-backend.sh &
./start-frontend.sh &

# Run E2E tests
npm run test:e2e
```

## **Support**

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Test individual components
4. Check the GraphQL Playground for API issues

---

**Last Updated**: December 2024  
**Version**: 2.0 - GraphQL Integration Complete
