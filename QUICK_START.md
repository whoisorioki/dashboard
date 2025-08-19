# Quick Start Guide - Sales Analytics Dashboard

## **🚀 Get Started in 3 Steps**

### **Step 1: Start Services**

```bash
docker-compose up -d
```

### **Step 2: Access the Dashboard**

Open your browser and go to: **http://localhost:5173**

### **Step 3: Upload Data**

- Use the file upload interface in the dashboard
- Or use the API: `curl -X POST http://localhost:8000/api/ingest/upload -F "file=@data.csv" -F "datasource_name=test"`

## **📊 What You'll See**

### **Frontend Dashboard** (http://localhost:5173)

- File upload area
- Task status tracking
- Data visualizations (when data is loaded)
- Connection status indicators

### **Backend API** (http://localhost:8000)

- File upload endpoint: `/api/ingest/upload`
- Task status endpoint: `/api/ingest/status/{task_id}`
- Health check: `/`

### **Druid Services**

- Coordinator: http://localhost:8081
- Router: http://localhost:8888

## **🔧 Troubleshooting**

### **If Frontend Won't Load:**

```bash
# Check if frontend is running
docker-compose ps frontend

# Restart frontend
docker-compose restart frontend

# Check logs
docker-compose logs frontend
```

### **If Backend Won't Respond:**

```bash
# Check backend status
docker-compose ps backend

# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs backend
```

### **If Upload Hangs:**

- The backend is processing the file
- Check logs: `docker-compose logs backend --tail=20`
- Wait for processing to complete

## **📁 Important Files**

- `data.csv` - Your sample data file
- `docker-compose.yml` - Service orchestration
- `frontend/` - React dashboard code
- `backend/` - FastAPI server code
- `druid/` - Druid configuration

## **🎯 Current Status**

✅ **Working**: Frontend, Backend, Database, File Upload  
⚠️ **Needs Fix**: Druid data ingestion (S3 configuration)  
📈 **Next**: Complete the data pipeline to visualization

**Last Updated**: August 19, 2025
