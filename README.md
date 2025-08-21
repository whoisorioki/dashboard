# 🚀 **Sales Analytics Dashboard**

A modern, scalable analytics dashboard built with React, FastAPI, and Apache Druid for real-time sales data analysis.

## **✨ Current Status: PRODUCTION READY** 🚀

- ✅ **Complete Data Pipeline**: From upload to query, fully functional
- ✅ **Dynamic Backend**: Automatically discovers and uses most recent datasources
- ✅ **Security Hardened**: No hardcoded secrets, environment-based configuration
- ✅ **Clean Architecture**: Streamlined, maintainable codebase
- ✅ **Comprehensive Documentation**: Complete setup and operation guides

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
cp docker.env .env

# Edit .env with your actual values
# POSTGRES_PASSWORD=your_secure_password
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
```

### **2. Start Services**

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
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
├── alembic/           # Database migrations
├── md/                # Documentation
├── docker-compose.yml # Service orchestration
├── docker.env         # Environment template
└── .env               # Your environment variables (create this)
```

## **📚 Documentation**

- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Current status and achievements
- **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** - Detailed setup instructions
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker configuration guide
- **[DRUID_CONFIGURATION.md](DRUID_CONFIGURATION.md)** - Druid setup and configuration
- **[QUICK_START.md](QUICK_START.md)** - Quick setup guide

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

## **📈 Data Pipeline**

1. **File Upload** → Frontend drag-and-drop interface
2. **Validation** → Polars-based data validation with Pandera schemas
3. **Storage** → AWS S3 file storage
4. **Ingestion** → Apache Druid data ingestion
5. **Query** → Real-time analytics via GraphQL
6. **Visualization** → Interactive charts and dashboards

## **🚀 Production Deployment**

- **Security**: ✅ Environment-based configuration
- **Monitoring**: ✅ Health checks and status endpoints
- **Scalability**: ✅ Docker-based, easily scalable
- **Documentation**: ✅ Complete operation guides

## **🤝 Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## **📄 License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: 2025-08-20  
**Status**: **PRODUCTION READY** 🚀
