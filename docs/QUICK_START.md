# 🚀 Quick Start Guide - Sales Analytics Dashboard

## **🎯 Get Started in 5 Minutes**

### **Prerequisites**

- **Docker & Docker Compose** (recommended)
- **Python 3.8+** with pip (for local development)
- **Node.js 16+** with npm (for local development)
- **AWS CLI** configured with S3 access (for data ingestion)

---

## **🚀 Option 1: Docker (Recommended)**

### **Step 1: Environment Setup**

```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Copy environment template
cp config/.env.example .env

# Edit .env with your actual values
# POSTGRES_PASSWORD=your_secure_password
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
```

### **Step 2: Start All Services**

```bash
# Start all services
docker-compose -f config/docker-compose.yml up -d

# Check status
docker-compose -f config/docker-compose.yml ps

# View logs
docker-compose -f config/docker-compose.yml logs -f
```

### **Step 3: Access Applications**

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **GraphQL**: http://localhost:8000/graphql
- **Druid Console**: http://localhost:8081

---

## **🔧 Option 2: Local Development**

### **Backend Setup**

```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend Endpoints:**

- **API**: http://localhost:8000
- **GraphQL**: http://localhost:8000/graphql
- **Documentation**: http://localhost:8000/docs

### **Frontend Setup**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Generate GraphQL types (requires backend running)
npm run codegen

# Start development server
npm run dev
```

**Frontend Endpoints:**

- **Application**: http://localhost:3000
- **Data Ingestion**: http://localhost:3000/data-ingestion

---

## **📊 What You'll See**

### **🎯 Core Dashboard Features**

- **Real-time KPIs**: Sales, revenue, profitability metrics
- **Interactive Charts**: Line, bar, pie, and geographic visualizations
- **Data Filtering**: Date ranges, branches, product lines
- **Responsive Design**: Mobile-friendly interface

### **🚀 Data Ingestion (Add-on Feature)**

- **File Upload Interface**: Drag-and-drop file upload
- **Task Status Tracking**: Real-time progress monitoring
- **Multi-format Support**: CSV, Excel (.xlsx, .xls), Parquet files
- **Data Validation**: Automatic schema validation

---

## **🔧 Troubleshooting**

### **If Frontend Won't Load:**

```bash
# Check if frontend is running
docker-compose -f config/docker-compose.yml ps frontend

# Restart frontend
docker-compose -f config/docker-compose.yml restart frontend

# Check logs
docker-compose -f config/docker-compose.yml logs frontend
```

### **If Backend Won't Respond:**

```bash
# Check backend status
docker-compose -f config/docker-compose.yml ps backend

# Restart backend
docker-compose -f config/docker-compose.yml restart backend

# Check logs
docker-compose -f config/docker-compose.yml logs backend
```

### **If Upload Hangs:**

- The backend is processing the file
- Check logs: `docker-compose -f config/docker-compose.yml logs backend --tail=20`
- Wait for processing to complete

---

## **📁 Important Files**

- `config/.env.example` - Environment variables template
- `config/docker-compose.yml` - Service orchestration
- `frontend/` - React dashboard code
- `backend/` - FastAPI server code
- `data/` - Sample data files

---

## **🎯 Current Status**

✅ **Working**: Frontend, Backend, Database, File Upload  
✅ **Complete**: Data Pipeline, Real-time Analytics, Component Consistency  
🚀 **Ready**: Production deployment with minor optimization

---

## **📚 Next Steps**

1. **Explore the Dashboard**: Navigate through different pages and features
2. **Upload Sample Data**: Use the data ingestion interface
3. **Customize Configuration**: Modify environment variables as needed
4. **Read Documentation**: Check `COMPREHENSIVE_SYSTEM_REPORT.md` for detailed information

**Last Updated**: August 26, 2025  
**Status**: **PRODUCTION READY** 🚀
