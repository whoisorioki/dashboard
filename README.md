# Sales Analytics Dashboard

A modern, real-time sales analytics dashboard with data ingestion pipeline.

## **🚀 Quick Start**

1. **Start Services:**

   ```bash
   docker-compose up -d
   ```

2. **Access Dashboard:**
   Open http://localhost:5173 in your browser

3. **Upload Data:**
   Use the file upload interface or API endpoint

## **📊 Architecture**

```
Frontend (React) → Backend (FastAPI) → S3 → Druid → PostgreSQL
```

## **🔧 Services**

| Service           | URL                   | Status     |
| ----------------- | --------------------- | ---------- |
| Frontend          | http://localhost:5173 | ✅ Running |
| Backend           | http://localhost:8000 | ✅ Running |
| Druid Coordinator | http://localhost:8081 | ✅ Running |
| PostgreSQL        | localhost:5433        | ✅ Running |

## **📁 Project Structure**

```
dashboard/
├── frontend/          # React dashboard
├── backend/           # FastAPI server
├── druid/            # Druid configuration
├── docker-compose.yml # Service orchestration
├── data.csv          # Sample data
├── QUICK_START.md    # Quick start guide
└── IMPLEMENTATION_STATUS.md # Current status
```

## **🎯 Current Status**

✅ **Working:**

- Frontend dashboard
- Backend API
- File upload to S3
- Database operations
- Task tracking

⚠️ **Needs Fix:**

- Druid data ingestion (S3 configuration)

## **📚 Documentation**

- [Quick Start Guide](QUICK_START.md) - Get started in 3 steps
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current state and issues

## **🔍 Troubleshooting**

### **Check Service Status:**

```bash
docker-compose ps
```

### **View Logs:**

```bash
# Frontend logs
docker-compose logs frontend

# Backend logs
docker-compose logs backend

# All services
docker-compose logs
```

### **Restart Services:**

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
```

## **📈 Next Steps**

1. Fix Druid S3 configuration
2. Complete data pipeline
3. Verify dashboard visualizations

---

**Last Updated**: August 19, 2025
