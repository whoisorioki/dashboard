# ⚙️ Configuration Guide - Sales Analytics Dashboard

## **📋 Overview**

This guide consolidates all configuration information including Docker setup, Druid configuration, AWS S3 setup, and environment variables for the Sales Analytics Dashboard.

---

## **🐳 DOCKER CONFIGURATION**

### **Docker Compose Services**

#### **Main Services Configuration**

```yaml
# config/docker-compose.yml
version: "3.8"

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
      - REACT_APP_GRAPHQL_URL=http://localhost:8000/graphql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_HOST=postgres
      - DRUID_COORDINATOR_URL=http://druid-coordinator:8081
    depends_on:
      - postgres
      - druid-coordinator

  postgres:
    image: postgres:15
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_DB=sales_analytics
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  druid-coordinator:
    image: apache/druid:33.0.0
    ports:
      - "8081:8081"
    environment:
      - DRUID_XMS=256m
      - DRUID_XMX=256m
    volumes:
      - ./config/druid:/opt/shared/druid

  druid-broker:
    image: apache/druid:33.0.0
    ports:
      - "8082:8082"
    environment:
      - DRUID_XMS=512m
      - DRUID_XMX=512m
    depends_on:
      - druid-coordinator

  druid-historical:
    image: apache/druid:33.0.0
    ports:
      - "8083:8083"
    environment:
      - DRUID_XMS=1g
      - DRUID_XMX=1g
    depends_on:
      - druid-coordinator

  druid-middlemanager:
    image: apache/druid:33.0.0
    ports:
      - "8091:8091"
    environment:
      - DRUID_XMS=512m
      - DRUID_XMX=512m
    depends_on:
      - druid-coordinator

  druid-router:
    image: apache/druid:33.0.0
    ports:
      - "8888:8888"
    environment:
      - DRUID_XMS=256m
      - DRUID_XMX=256m
    depends_on:
      - druid-coordinator

volumes:
  postgres_data:
```

### **Docker Environment Variables**

```bash
# config/docker.env
# Database Configuration
POSTGRES_DB=sales_analytics
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Enter@321

# Druid Configuration
DRUID_XMS=256m
DRUID_XMX=256m
DRUID_COORDINATOR_URL=http://localhost:8081
DRUID_ROUTER_URL=http://localhost:8888

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
```

---

## **⚙️ DRUID CONFIGURATION**

### **Druid Services Configuration**

#### **Coordinator Configuration**

```properties
# config/druid/coordinator/runtime.properties
druid.service=coordinator
druid.port=8081
druid.coordinator.startDelay=PT30S
druid.coordinator.period=PT30S
druid.coordinator.periodIndexingPeriod=PT1800S

# Metadata Storage
druid.metadata.storage.type=postgresql
druid.metadata.storage.connector.connectURI=jdbc:postgresql://postgres:5432/sales_analytics
druid.metadata.storage.connector.user=postgres
druid.metadata.storage.connector.password=${POSTGRES_PASSWORD}

# Deep Storage
druid.storage.type=s3
druid.s3.accessKey=${AWS_ACCESS_KEY_ID}
druid.s3.secretKey=${AWS_SECRET_ACCESS_KEY}
druid.s3.region=${AWS_REGION}
druid.s3.bucket=your-druid-storage-bucket
```

#### **Broker Configuration**

```properties
# config/druid/broker/runtime.properties
druid.service=broker
druid.port=8082
druid.broker.http.numConnections=5
druid.broker.http.readTimeout=PT15M
druid.broker.http.numMaxThreads=4

# Query Processing
druid.processing.buffer.sizeBytes=256000000
druid.processing.numMergeBuffers=2
druid.processing.numThreads=1
```

#### **Historical Configuration**

```properties
# config/druid/historical/runtime.properties
druid.service=historical
druid.port=8083
druid.historical.cache.useCache=true
druid.historical.cache.populateCache=true
druid.historical.cache.unCacheable=[]"

# Segment Storage
druid.segmentCache.locations=[{"path":"/opt/shared/druid/segments","maxSize":"10g"}]
druid.segmentCache.infoDir=/opt/shared/druid/segment-info-cache
```

#### **MiddleManager Configuration**

```properties
# config/druid/middlemanager/runtime.properties
druid.service=middlemanager
druid.port=8091
druid.worker.capacity=2
druid.worker.version=33.0.0
druid.worker.ip=druid-middlemanager
druid.worker.startTimeout=PT90S

# Task Processing
druid.indexer.runner.javaOpts=-server -Xmx1g -Xms1g
druid.indexer.fork.property.druid.processing.buffer.sizeBytes=256000000
```

#### **Router Configuration**

```properties
# config/druid/router/runtime.properties
druid.service=router
druid.port=8888
druid.router.defaultBrokerServiceName=druid/broker
druid.router.defaultHistoricalServiceName=druid/historical
druid.router.defaultCoordinatorServiceName=druid/coordinator
druid.router.defaultOverlordServiceName=druid/overlord
```

---

## **☁️ AWS S3 CONFIGURATION**

### **S3 Bucket Setup**

#### **Bucket Configuration**

```bash
# Create S3 bucket for file storage
aws s3 mb s3://your-sales-analytics-bucket --region us-east-1

# Create S3 bucket for Druid deep storage
aws s3 mb s3://your-druid-storage-bucket --region us-east-1

# Set bucket policies for security
aws s3api put-bucket-policy --bucket your-sales-analytics-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDashboardAccess",
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"},
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-sales-analytics-bucket/*"
    }
  ]
}'
```

#### **IAM User Configuration**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-sales-analytics-bucket",
        "arn:aws:s3:::your-sales-analytics-bucket/*",
        "arn:aws:s3:::your-druid-storage-bucket",
        "arn:aws:s3:::your-druid-storage-bucket/*"
      ]
    }
  ]
}
```

#### **S3 Folder Structure**

```
your-sales-analytics-bucket/
├── uploads/
│   ├── datasource1/
│   │   ├── file1.csv
│   │   └── file2.xlsx
│   └── datasource2/
│       └── data.parquet
└── processed/
    ├── sales_analytics/
    │   └── segments/
    └── metadata/
        └── ingestion_specs/
```

---

## **🔧 ENVIRONMENT VARIABLES**

### **Environment Template**

```bash
# config/.env.example
# Database Configuration
POSTGRES_DB=sales_analytics
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# S3 Configuration
S3_BUCKET_NAME=your-sales-analytics-bucket
S3_UPLOAD_PREFIX=uploads
S3_DRUID_BUCKET=your-druid-storage-bucket

# Druid Configuration
DRUID_COORDINATOR_URL=http://localhost:8081
DRUID_ROUTER_URL=http://localhost:8888
DRUID_BROKER_URL=http://localhost:8082
DRUID_HISTORICAL_URL=http://localhost:8083
DRUID_MIDDLEMANAGER_URL=http://localhost:8091

# Application Configuration
APP_ENV=development
LOG_LEVEL=INFO
MAX_FILE_SIZE=500MB
SUPPORTED_FORMATS=csv,xlsx,xls,parquet

# Security Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Performance Configuration
DATABASE_POOL_SIZE=10
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=3600
```

### **Environment Setup Scripts**

#### **Linux/Mac Setup**

```bash
#!/bin/bash
# scripts/setup-env.sh

echo "Setting up environment variables..."

# Copy environment template
cp config/.env.example .env

# Export variables for current session
export $(cat .env | xargs)

echo "Environment variables exported successfully!"
echo "Remember to edit .env file with your actual values."
```

#### **Windows Setup**

```batch
@echo off
REM scripts/setup-env.bat

echo Setting up environment variables...

REM Copy environment template
copy config\.env.example .env

echo Environment template copied to .env
echo Please edit .env file with your actual values.
pause
```

---

## **🚀 DEPLOYMENT CONFIGURATION**

### **Production Environment**

```bash
# Production environment variables
APP_ENV=production
LOG_LEVEL=WARNING
DATABASE_POOL_SIZE=20
CACHE_TTL_SECONDS=1800

# Security (use secrets management in production)
JWT_SECRET_KEY=${JWT_SECRET_KEY}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
```

### **Docker Production Override**

```yaml
# config/docker-compose.prod.yml
version: "3.8"

services:
  frontend:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  backend:
    environment:
      - APP_ENV=production
      - LOG_LEVEL=WARNING
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  postgres:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

---

## **🔍 CONFIGURATION VALIDATION**

### **Health Check Scripts**

```bash
#!/bin/bash
# scripts/validate-config.sh

echo "Validating configuration..."

# Check environment variables
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ POSTGRES_PASSWORD not set"
    exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "❌ AWS_ACCESS_KEY_ID not set"
    exit 1
fi

# Check Docker services
docker-compose -f config/docker-compose.yml ps

# Check Druid connectivity
curl -f http://localhost:8081/status || echo "❌ Druid Coordinator not accessible"
curl -f http://localhost:8888/status || echo "❌ Druid Router not accessible"

echo "✅ Configuration validation complete!"
```

---

## **📚 Related Documentation**

- **[COMPREHENSIVE_SYSTEM_REPORT.md](COMPREHENSIVE_SYSTEM_REPORT.md)** - Complete system status
- **[QUICK_START.md](QUICK_START.md)** - Getting started guide
- **[TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md)** - API and technical details
- **[ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md)** - System architecture

---

**Last Updated**: August 26, 2025  
**Status**: **CONSOLIDATED CONFIGURATION GUIDE** ⚙️
