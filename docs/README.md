# 🚀 **Sales Analytics Dashboard**

A modern, scalable analytics dashboard built with React, FastAPI, and Apache Druid for real-time sales data analysis.

## **✨ Current Status: PRODUCTION READY** 🚀

- ✅ **Complete Data Pipeline**: From upload to query, fully functional
- ✅ **Dynamic Backend**: Automatically discovers and uses most recent datasources
- ✅ **Security Hardened**: No hardcoded secrets, environment-based configuration
- ✅ **Clean Architecture**: Streamlined, maintainable codebase
- ✅ **Comprehensive Documentation**: Streamlined setup and operation guides

## **🏗️ Architecture**

```
Frontend (React + TypeScript) → Backend (FastAPI + GraphQL) → S3 → Druid → PostgreSQL (metadata)
```

## **🚀 Quick Start**

### **Prerequisites**

- Docker & Docker Compose
- AWS CLI configured with S3 access
- Node.js 18+ (for local development)

### **1. Clone and Setup**

```bash
git clone <repository-url>
cd dashboard

# Copy environment template
cp config/.env.example .env

# Edit .env with your actual values
# POSTGRES_PASSWORD=your_secure_password
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
```

### **2. Start Services**

```bash
# Start all services
docker-compose -f config/docker-compose.yml up -d

# Check status
docker-compose -f config/docker-compose.yml ps

# View logs
docker-compose -f config/docker-compose.yml logs -f
```

### **3. Access Applications**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **GraphQL**: http://localhost:8000/graphql
- **Druid Console**: http://localhost:8081

## **📊 Services**

| Service             | Port | Purpose            | Status     |
| ------------------- | ---- | ------------------ | ---------- |
| Frontend            | 3000 | React Dashboard    | ✅ Running |
| Backend             | 8000 | FastAPI + GraphQL  | ✅ Running |
| Druid Coordinator   | 8081 | Cluster Management | ✅ Running |
| Druid Broker        | 8082 | Query Processing   | ✅ Running |
| Druid Historical    | 8083 | Data Storage       | ✅ Running |
| Druid MiddleManager | 8091 | Data Ingestion     | ✅ Running |
| Druid Router        | 8888 | Load Balancing     | ✅ Running |
| PostgreSQL          | 5433 | Metadata Storage   | ✅ Running |

## **🔒 Security Features**

- **Environment Variables**: All secrets configurable via environment
- **No Hardcoded Values**: Secure by default
- **Docker Secrets**: Ready for production deployment
- **Secure Defaults**: Development-friendly with production hardening

## **📁 Project Structure**

```
dashboard/
├── frontend/          # React dashboard (TypeScript + Material-UI)
├── backend/           # FastAPI server (Python + Strawberry GraphQL)
├── config/            # Configuration files (Docker, environment)
├── docs/              # Documentation
├── scripts/           # Utility and testing scripts
├── data/              # Sample data files
└── alembic/           # Database migrations
```

## **📚 Documentation Structure**

### **🎯 Essential Documents**

1. **[COMPREHENSIVE_SYSTEM_REPORT.md](COMPREHENSIVE_SYSTEM_REPORT.md)** ⭐ **MAIN SYSTEM REPORT**

   - Complete system status and technical details
   - Component consistency audit results
   - Implementation phases and current status
   - Performance metrics and system health

2. **[QUICK_START.md](QUICK_START.md)** 🚀 **Getting Started**

   - Essential setup instructions
   - Environment configuration
   - First-time user guide

3. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** 🚀 **Production Deployment**

   - Production environment setup
   - Docker configuration
   - Monitoring and maintenance

4. **[TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)** 🔧 **Problem Resolution**
   - Common issues and solutions
   - System maintenance
   - Performance optimization

### **🔧 Technical Reference**

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - GraphQL API reference
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - System architecture details
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker configuration guide
- **[DRUID_CONFIGURATION.md](DRUID_CONFIGURATION.md)** - Druid setup and configuration

### **📊 Data & Analytics**

- **[DATA_PIPELINE.md](DATA_PIPELINE.md)** - Data flow and processing
- **[METRICS_STANDARDIZATION.md](METRICS_STANDARDIZATION.md)** - KPIs and metrics guide
- **[FRONTEND_BACKEND_MAPPING.md](FRONTEND_BACKEND_MAPPING.md)** - Component mapping

## **🔧 Development**

### **Backend Development**

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Development**

```bash
# Install Node.js dependencies
cd frontend
npm install

# Run locally
npm run dev
```

## **📈 Core System Features**

### **🎯 Analytics Dashboard**

- **Real-time KPIs**: Sales, revenue, profitability metrics
- **Interactive Charts**: Line, bar, pie, and geographic visualizations
- **Data Filtering**: Date ranges, branches, product lines
- **Responsive Design**: Mobile-friendly interface

### **🔄 Data Processing**

- **Multi-format Support**: CSV, Excel (.xlsx, .xls), Parquet files
- **Data Validation**: Polars-based validation with Pandera schemas
- **Real-time Queries**: GraphQL queries with caching
- **Performance Optimization**: High-performance data processing

### **🚀 Data Ingestion (Add-on Feature)**

- **File Upload Interface**: Drag-and-drop file upload
- **S3 Integration**: AWS S3 file storage
- **Background Processing**: Async task processing
- **Status Monitoring**: Real-time progress tracking

## **🚀 Production Deployment**

- **Security**: ✅ Environment-based configuration
- **Monitoring**: ✅ Health checks and status endpoints
- **Scalability**: ✅ Docker-based, easily scalable
- **Documentation**: ✅ Streamlined operation guides

## **🤝 Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## **📄 License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: 2025-08-26  
**Status**: **PRODUCTION READY** 🚀  
**Documentation**: **CONSOLIDATED & STREAMLINED** 📚
