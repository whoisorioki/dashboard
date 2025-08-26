# Deployment & Setup Guide

## Overview

This guide provides step-by-step instructions for deploying and setting up the Sales Analytics Dashboard system, including the Dynamic CSV Ingestion System.

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Docker**: Docker Desktop 4.0+ or Docker Engine 20.10+
- **Docker Compose**: Version 2.0+
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Internet access for Docker image downloads

### Software Dependencies

- **Git**: For cloning the repository
- **Python 3.8+**: For local development and testing
- **AWS CLI**: For S3 integration (optional)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dashboard
```

### 2. Set Environment Variables

```bash
# Copy the environment template
cp docker.env docker.env.local

# Edit the file with your values
nano docker.env.local

# Or use the setup script
chmod +x setup-env-complete.sh
source setup-env-complete.sh
```

### 3. Start the System

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access the System

- **Frontend**: http://localhost:3000 (or 5173)
- **Backend API**: http://localhost:8000
- **GraphQL**: http://localhost:8000/graphql
- **Druid Console**: http://localhost:8888
- **Druid Coordinator**: http://localhost:8081

## Detailed Setup Instructions

### 1. Environment Configuration

#### Required Environment Variables

```bash
# AWS Configuration (for S3 uploads)
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_REGION="your_region"

# Druid Configuration
export DRUID_BROKER_HOST="router"
export DRUID_BROKER_PORT="8888"
export DRUID_DATASOURCE="SalesAnalytics"

# Application Configuration
export USE_MOCK_DATA="false"
export FORCE_MOCK_DATA="false"
```

#### Environment File Structure

```bash
# docker.env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
DRUID_BROKER_HOST=router
DRUID_BROKER_PORT=8888
DRUID_DATASOURCE=SalesAnalytics
USE_MOCK_DATA=false
FORCE_MOCK_DATA=false
```

### 2. Docker Services Configuration

#### Service Dependencies

```yaml
# docker-compose.yml
services:
  zookeeper:
    # Starts first - coordinates other services

  coordinator:
    depends_on:
      - zookeeper
    # Manages Druid tasks and metadata

  historical:
    depends_on:
      - zookeeper
    # Stores and processes data segments

  middlemanager:
    depends_on:
      - zookeeper
    # Handles data ingestion tasks

  broker:
    depends_on:
      - coordinator
      - historical
    # Routes and executes queries

  router:
    depends_on:
      - broker
    # Load balances queries

  backend:
    depends_on:
      - router
      - coordinator
    # API and business logic

  frontend:
    depends_on:
      - backend
    # User interface
```

### 3. Service Startup Order

#### Phase 1: Infrastructure

```bash
# Start Zookeeper first
docker-compose up -d zookeeper
sleep 10

# Start Druid core services
docker-compose up -d coordinator historical middlemanager
sleep 30
```

#### Phase 2: Query Services

```bash
# Start broker and router
docker-compose up -d broker router
sleep 20
```

#### Phase 3: Application Services

```bash
# Start backend and frontend
docker-compose up -d backend frontend
sleep 15
```

#### Phase 4: Verification

```bash
# Check all services are running
docker-compose ps

# Verify Druid is ready
curl "http://localhost:8888/druid/v2/datasources"

# Check backend health
curl "http://localhost:8000/health"
```

## Configuration Files

### 1. Docker Compose Configuration

#### Memory Allocation

```yaml
# Recommended memory settings for production
services:
  coordinator:
    environment:
      - DRUID_XMS=2g
      - DRUID_XMX=4g

  historical:
    environment:
      - DRUID_XMS=4g
      - DRUID_XMX=8g

  middlemanager:
    environment:
      - DRUID_XMS=2g
      - DRUID_XMX=4g

  broker:
    environment:
      - DRUID_XMS=2g
      - DRUID_XMX=4g
```

#### Volume Mounts

```yaml
services:
  backend:
    volumes:
      - ./data:/app/data
      - druid_shared:/opt/shared

  coordinator:
    volumes:
      - druid_shared:/opt/shared
      - druid_metadata:/opt/shared/metadata

  historical:
    volumes:
      - druid_shared:/opt/shared
      - druid_segments:/opt/shared/segments
```

### 2. Druid Configuration

#### Coordinator Settings

```properties
# coordinator/runtime.properties
druid.zk.service.host=zookeeper:2181
druid.coordinator.startDelay=PT30S
druid.coordinator.period=PT30S
druid.coordinator.period.indexingPeriod=PT30S
```

#### Historical Settings

```properties
# historical/runtime.properties
druid.zk.service.host=zookeeper:2181
druid.server.maxSize=8g
druid.processing.buffer.sizeBytes=256000000
druid.processing.numThreads=2
```

#### MiddleManager Settings

```properties
# middlemanager/runtime.properties
druid.zk.service.host=zookeeper:2181
druid.indexer.runner.javaOpts=-server -Xmx2g -Xms2g
druid.indexer.fork.property.druid.processing.buffer.sizeBytes=256000000
```

### 3. Backend Configuration

#### FastAPI Settings

```python
# backend/main.py
app = FastAPI(
    title="Sales Analytics Dashboard",
    description="Dynamic CSV Ingestion and Analytics System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)
```

#### CORS Configuration

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Data Ingestion Setup

### 1. Prepare Your CSV Data

#### Data Format Requirements

- **File Format**: CSV (Comma Separated Values)
- **Encoding**: UTF-8 (recommended) or UTF-8 with BOM
- **Headers**: First row should contain column names
- **Date Format**: DD/MM/YYYY (will be automatically converted)

#### Sample Data Structure

```csv
DocDate,Branch,SalesPerson,ItemGroup,ItemName,AcctName,CardName,SalesAmount,SalesQty,DocType,CostOfSales
15/03/2023,Kitengela,Walk In Customers-Showroom,Units,TVS Apache RTR 160 4V,Cash sales,John Doe,150000,1,AR Invoice,120000
```

### 2. Ingestion Process

#### Step 1: Upload and Analyze

```bash
# Upload CSV for schema analysis
curl -X POST "http://localhost:8000/api/ingest/analyze-schema" \
  -F "file=@your_data.csv" \
  -F "datasource_name=YourDatasource"
```

#### Step 2: Review Schema

```json
{
  "success": true,
  "analysis": {
    "timestamp_column": "DocDate",
    "recommended_dimensions": ["Branch", "SalesPerson", "ItemGroup"],
    "recommended_metrics": ["SalesAmount", "SalesQty", "CostOfSales"]
  }
}
```

#### Step 3: Start Ingestion

```bash
# Start the ingestion process
curl -X POST "http://localhost:8000/api/ingest/local-upload" \
  -F "file=@your_data.csv" \
  -F "datasource_name=YourDatasource"
```

#### Step 4: Monitor Progress

```bash
# Check ingestion status
curl "http://localhost:8000/api/ingest/status/your_task_id"

# Monitor Druid tasks
curl "http://localhost:8081/druid/indexer/v1/tasks"
```

## Troubleshooting

### 1. Common Issues

#### Service Won't Start

```bash
# Check Docker status
docker --version
docker-compose --version

# Check available resources
docker system df
docker system prune -f

# View detailed logs
docker-compose logs service_name
```

#### Port Conflicts

```bash
# Check what's using a port
netstat -ano | findstr :8888  # Windows
lsof -i :8888                  # macOS/Linux

# Kill process using port
taskkill //PID <PID> //F       # Windows
kill -9 <PID>                  # macOS/Linux
```

#### Memory Issues

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory

# Restart Docker Desktop
# Windows: Restart Docker Desktop
# macOS: Restart Docker Desktop
```

### 2. Druid-Specific Issues

#### Coordinator Connection Refused

```bash
# Wait for Zookeeper to be ready
docker-compose logs zookeeper

# Check coordinator logs
docker-compose logs coordinator

# Verify Zookeeper connection
docker exec -it coordinator ping zookeeper
```

#### Ingestion Tasks Failing

```bash
# Check task status
curl "http://localhost:8081/druid/indexer/v1/tasks"

# View task logs
curl "http://localhost:8081/druid/indexer/v1/task/{task_id}/log"

# Check segment status
curl "http://localhost:8888/druid/v2/datasources"
```

#### Query Performance Issues

```bash
# Check segment sizes
curl "http://localhost:8888/druid/v2/datasources/{datasource}/segments"

# Monitor query performance
curl "http://localhost:8888/druid/v2/sql" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM YourDatasource"}'
```

### 3. Backend Issues

#### Import Errors

```bash
# Check Python dependencies
docker exec -it backend pip list

# Install missing packages
docker exec -it backend pip install package_name

# Rebuild backend container
docker-compose build backend
docker-compose up -d backend
```

#### File Upload Issues

```bash
# Check file permissions
ls -la your_file.csv

# Verify file format
file your_file.csv

# Check backend logs
docker-compose logs backend
```

## Performance Tuning

### 1. Druid Optimization

#### Segment Configuration

```yaml
# In ingestion spec
tuningConfig:
  type: index_parallel
  maxRowsPerSegment: 5000000
  maxRowsInMemory: 100000
  maxTotalRows: 1000000
```

#### Memory Settings

```bash
# Adjust based on available RAM
export DRUID_XMS="2g"
export DRUID_XMX="4g"
export DRUID_MAX_DIRECT_MEMORY_SIZE="4g"
```

### 2. Backend Optimization

#### Caching Configuration

```python
# backend/core/druid_client.py
REDIS_CACHE_TTL = 300  # 5 minutes
REDIS_MAX_CONNECTIONS = 10
```

#### Connection Pooling

```python
# backend/core/database.py
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 30
```

### 3. Frontend Optimization

#### React Query Configuration

```typescript
// frontend/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

## Monitoring & Maintenance

### 1. Health Checks

#### Service Health

```bash
# Check all services
docker-compose ps

# Health check endpoints
curl "http://localhost:8000/health"
curl "http://localhost:8888/status"
```

#### Data Health

```bash
# Check data freshness
curl -X POST "http://localhost:8888/druid/v2/sql" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT MAX(__time) FROM SalesAnalytics"}'

# Check data quality
curl -X POST "http://localhost:8888/druid/v2/sql" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM SalesAnalytics WHERE grossRevenue < 0"}'
```

### 2. Backup & Recovery

#### Data Backup

```bash
# Backup Druid segments
docker exec -it historical tar -czf /opt/shared/backup_$(date +%Y%m%d).tar.gz /opt/shared/segments

# Backup PostgreSQL data
docker exec -it postgres pg_dump -U postgres sales_analytics > backup_$(date +%Y%m%d).sql
```

#### Configuration Backup

```bash
# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  docker.env \
  backend/config/ \
  setup-env-complete.sh
```

### 3. Log Management

#### Log Rotation

```yaml
# docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Log Analysis

```bash
# Search for errors
docker-compose logs | grep -i error

# Monitor specific service
docker-compose logs -f --tail=100 backend

# Export logs
docker-compose logs > system_logs_$(date +%Y%m%d).log
```

## Production Deployment

### 1. Production Considerations

#### Security

- Enable HTTPS/TLS
- Implement authentication
- Use secrets management
- Network segmentation

#### Scalability

- Load balancing
- Horizontal scaling
- Auto-scaling groups
- CDN integration

#### Monitoring

- Application performance monitoring
- Infrastructure monitoring
- Log aggregation
- Alert systems

### 2. Production Environment Variables

```bash
# Production settings
export NODE_ENV=production
export LOG_LEVEL=info
export CACHE_TTL=600
export MAX_FILE_SIZE=100MB
export RATE_LIMIT=1000
```

### 3. Production Docker Configuration

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  backend:
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
```

## Conclusion

This deployment guide provides comprehensive instructions for setting up and maintaining the Sales Analytics Dashboard system. The system is designed to be robust, scalable, and easy to deploy.

For additional support:

1. Check the troubleshooting section
2. Review system logs
3. Consult the API documentation
4. Contact the development team

The system is production-ready and provides a solid foundation for scalable data analytics workflows.
