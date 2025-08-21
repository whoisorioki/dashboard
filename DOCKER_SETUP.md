# 🐳 Docker Setup Guide

This guide explains how to run the Sales Analytics Dashboard using Docker Compose.

## 📋 Prerequisites

- Docker and Docker Compose installed
- AWS S3 bucket configured
- AWS credentials

## 🚀 Quick Start

### 1. Configure Environment Variables

Edit `docker.env` and update the AWS credentials:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_access_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name
```

### 2. Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Druid Router**: http://localhost:8888
- **Druid Coordinator**: http://localhost:8081

## 🏗️ Architecture

The Docker Compose setup includes:

### Core Services

- **PostgreSQL** (port 5433): Operational database for ingestion tasks
- **Zookeeper** (port 2181): Coordination service for Druid
- **Druid Coordinator** (port 8081): Manages Druid cluster
- **Druid Broker** (port 8082): Handles queries
- **Druid Historical** (port 8083): Stores and serves data segments
- **Druid MiddleManager** (port 8091): Handles data ingestion
- **Druid Router** (port 8888): Routes requests to appropriate services

### Application Services

- **Backend** (port 8000): FastAPI application with GraphQL
- **Frontend** (port 3000): React application

## 🔧 Service Dependencies

```
Frontend → Backend → PostgreSQL (healthy)
                ↓
              Druid Router → Coordinator → Zookeeper (healthy)
              ↓
              Broker, Historical, MiddleManager → Coordinator (started)
```

## 📁 File Structure

```
├── docker-compose.yml          # Main Docker Compose file
├── docker.env                  # Environment variables
├── backend/
│   ├── Dockerfile             # Backend production image
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── Dockerfile             # Frontend production image
│   ├── Dockerfile.dev         # Frontend development image
│   └── package.json           # Node.js dependencies
└── druid/
    ├── docker-compose.yml     # Original Druid setup (for reference)
    ├── environment            # Druid environment variables
    └── extensions/            # Druid extensions
```

## 🛠️ Development Workflow

### Development Mode

```bash
# Start with volume mounts for live code changes
docker-compose up -d

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## ✅ Current Working Configuration

### **Druid Services Configuration**

All Druid services now use unified configuration through environment variables in `docker-compose.yml`:

- **Metadata Storage**: PostgreSQL (sales_analytics database)
- **Deep Storage**: Local storage (`/opt/shared/segments`)
- **Extensions**: PostgreSQL metadata storage, histogram, datasketches, lookups, multi-stage query
- **Memory Settings**: Properly configured Java memory (2GB for most services)

### **Volume Mounts**

- **Shared Storage**: `druid_shared:/opt/shared` (for segments and data files)
- **Metadata**: `druid_metadata:/opt/druid/var` (for Druid metadata)
- **Service-specific**: Individual service volumes for temporary data

### **Health Checks**

- **PostgreSQL**: `pg_isready` health check
- **Zookeeper**: Custom health check for coordination service
- **Backend**: HTTP health check endpoint

### **Recent Fixes Applied**

1. ✅ **Memory Configuration**: Fixed duplicate `-Xmx` prefixes in Java options
2. ✅ **Service Dependencies**: Proper startup order with health checks
3. ✅ **Volume Mounts**: Fixed Windows Bash volume mounting issues
4. ✅ **Configuration Unification**: All services use consistent PostgreSQL metadata storage
5. ✅ **Frontend Port**: Fixed to run on port 3000 as configured

### Production Mode

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Druid S3 Extension Error**

   - Ensure `druid-s3-extensions` is in the extensions list
   - Restart Druid services after configuration changes

2. **Database Connection Issues**

   - Check PostgreSQL health status: `docker-compose ps postgres`
   - Verify database URL in `docker.env`

3. **Port Conflicts**
   - Ensure ports 3000, 8000, 5433, 8888 are available
   - Modify ports in `docker-compose.yml` if needed

### Useful Commands

```bash
# Check service status
docker-compose ps

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs backend

# Access service shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Clean up volumes
docker-compose down -v
```

## 🔐 Security Notes

- Never commit real AWS credentials to version control
- Use Docker secrets or environment files for sensitive data
- Consider using AWS IAM roles for production deployments

## 📊 Monitoring

### Health Checks

- PostgreSQL: Automatic health check on startup
- Backend: Health endpoint at `/health`
- Frontend: Built-in Vite dev server health

### Logs

```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100
```

## 🚀 Deployment

For production deployment:

1. Update `docker.env` with production values
2. Use production Dockerfiles
3. Configure proper networking and security
4. Set up monitoring and logging
5. Use Docker secrets for sensitive data

## 📝 Notes

- The S3 extension has been added to all Druid services
- PostgreSQL uses port 5433 to avoid conflicts
- All services are configured for development with hot reloading
- Environment variables are centralized in `docker.env`
