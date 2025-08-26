# Troubleshooting Guide

## **🎯 CRITICAL ISSUES AND SOLUTIONS**

**Date**: 8/20/2025
**Status**: Active troubleshooting guide for current system issues

---

## **⚠️ CRITICAL ISSUE #1: Druid S3 Configuration**

### **Problem Description**

- Tasks are submitted to Druid but failing due to S3 configuration issues
- Data not reaching Druid for analytics
- Error messages in Druid logs related to S3 access

### **Root Cause Analysis**

The issue is likely related to:

1. **S3 Credentials**: AWS credentials not properly configured in Druid
2. **Bucket Permissions**: S3 bucket permissions not allowing Druid access
3. **Environment Variables**: Missing or incorrect environment variables
4. **Druid Configuration**: Incorrect S3 input source configuration

### **Diagnostic Steps**

#### **1. Check Druid Environment Configuration**

```bash
# Review current Druid environment settings
cat druid/environment

# Check for S3-related environment variables
grep -i s3 druid/environment
grep -i aws druid/environment
```

#### **2. Verify S3 Bucket Access**

```bash
# Test S3 bucket access from backend
curl -X GET "http://localhost:8000/api/health"

# Check S3 bucket permissions
aws s3 ls s3://sales-analytics-01 --profile default
```

#### **3. Check Druid Logs**

```bash
# Check MiddleManager logs for S3 errors
docker-compose logs middlemanager | grep -i s3
docker-compose logs middlemanager | grep -i error

# Check Coordinator logs
docker-compose logs coordinator | grep -i s3
```

#### **4. Test Druid S3 Connectivity**

```bash
# Check Druid task status
curl -X GET "http://localhost:8081/druid/indexer/v1/tasks"

# Check specific task details
curl -X GET "http://localhost:8081/druid/indexer/v1/task/{task_id}/status"
```

### **Solutions**

#### **Solution 1: Fix S3 Credentials**

```bash
# Add AWS credentials to Druid environment
echo "AWS_ACCESS_KEY_ID=your_access_key" >> druid/environment
echo "AWS_SECRET_ACCESS_KEY=your_secret_key" >> druid/environment
echo "AWS_REGION=us-east-1" >> druid/environment

# Restart Druid services
docker-compose restart middlemanager coordinator
```

#### **Solution 2: Update S3 Bucket Permissions**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DruidS3Access",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:role/druid-role"
      },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::sales-analytics-01",
        "arn:aws:s3:::sales-analytics-01/*"
      ]
    }
  ]
}
```

#### **Solution 3: Update Druid Configuration**

```properties
# Add to druid/environment
druid.extensions.loadList=["druid-s3-extensions"]
druid.s3.accessKey=your_access_key
druid.s3.secretKey=your_secret_key
druid.s3.region=us-east-1
```

#### **Solution 4: Test with Sample Data**

```bash
# Upload a small test file
curl -X POST http://localhost:8000/api/ingest/upload \
  -F "file=@data.csv" \
  -F "datasource_name=test_ingestion"

# Monitor the task
curl -X GET "http://localhost:8000/api/ingest/status/{task_id}"
```

---

## **⚠️ CRITICAL ISSUE #2: Frontend Dependencies**

### **Problem Description**

- Some chart libraries not loading properly
- Missing npm dependencies
- Limited visualization capabilities

### **Diagnostic Steps**

#### **1. Check Frontend Dependencies**

```bash
# Navigate to frontend directory
cd frontend

# Check for missing dependencies
npm list @apollo/client
npm list @tanstack/react-query-persist-client
npm list @mui/material
```

#### **2. Check Browser Console**

```javascript
// Open browser developer tools
// Check for JavaScript errors in Console tab
// Look for missing module errors
```

#### **3. Verify Package Installation**

```bash
# Check if node_modules exists
ls -la frontend/node_modules

# Check package-lock.json
cat frontend/package-lock.json | grep -i apollo
```

### **Solutions**

#### **Solution 1: Install Missing Dependencies**

```bash
# Navigate to frontend directory
cd frontend

# Install missing dependencies
npm install @apollo/client @tanstack/react-query-persist-client

# Install additional chart libraries if needed
npm install @nivo/core @nivo/line @nivo/bar @nivo/pie

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Solution 2: Update Docker Frontend**

```bash
# Rebuild frontend container
docker-compose build frontend

# Restart frontend service
docker-compose restart frontend

# Check logs
docker-compose logs frontend
```

#### **Solution 3: Clear Browser Cache**

```javascript
// In browser developer tools
// Application tab -> Storage -> Clear storage
// Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

---

## **🔧 COMMON ISSUES AND SOLUTIONS**

### **Issue 1: Database Connection Problems**

#### **Symptoms**

- Backend fails to start
- Database connection errors
- Migration failures

#### **Solutions**

```bash
# Check database status
docker-compose ps sales_analytics_db

# Restart database
docker-compose restart sales_analytics_db

# Run migrations
docker-compose exec backend alembic upgrade head

# Check database logs
docker-compose logs sales_analytics_db
```

### **Issue 2: GraphQL Schema Errors**

#### **Symptoms**

- GraphQL playground not loading
- Schema validation errors
- Type errors in frontend

#### **Solutions**

```bash
# Check GraphQL endpoint
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# Restart backend
docker-compose restart backend

# Check backend logs
docker-compose logs backend
```

### **Issue 3: File Upload Failures**

#### **Symptoms**

- File uploads failing
- S3 upload errors
- Validation errors

#### **Solutions**

```bash
# Check S3 credentials
aws sts get-caller-identity

# Test S3 upload manually
aws s3 cp data.csv s3://sales-analytics-01/test/

# Check backend logs
docker-compose logs backend | grep -i s3
```

### **Issue 4: Druid Service Failures**

#### **Symptoms**

- Druid services not starting
- Coordinator/Broker connection issues
- Query failures

#### **Solutions**

```bash
# Check all Druid services
docker-compose ps | grep druid

# Restart Druid services
docker-compose restart coordinator broker historical middlemanager router

# Check Druid logs
docker-compose logs coordinator
docker-compose logs broker
docker-compose logs historical
```

---

## **📊 PERFORMANCE TROUBLESHOOTING**

### **Slow Query Performance**

#### **Diagnostic Steps**

```bash
# Check Druid query logs
curl -X GET "http://localhost:8081/druid/indexer/v1/tasks"

# Monitor system resources
docker stats

# Check database performance
docker-compose exec sales_analytics_db psql -U postgres -d sales_analytics -c "SELECT * FROM pg_stat_activity;"
```

#### **Solutions**

```bash
# Optimize Druid configuration
# Add to druid/environment
druid.processing.numThreads=4
druid.processing.buffer.sizeBytes=268435456

# Restart services
docker-compose restart coordinator broker historical
```

### **Memory Issues**

#### **Diagnostic Steps**

```bash
# Check memory usage
docker stats --no-stream

# Check container memory limits
docker-compose exec backend free -h
```

#### **Solutions**

```bash
# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

---

## **🔍 DEBUGGING TECHNIQUES**

### **Backend Debugging**

#### **Enable Debug Logging**

```python
# Add to backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### **Check API Endpoints**

```bash
# Test health endpoint
curl -X GET "http://localhost:8000/"

# Test upload endpoint
curl -X POST http://localhost:8000/api/ingest/upload \
  -F "file=@data.csv" \
  -F "datasource_name=test"

# Test GraphQL endpoint
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getIngestionTaskStatus(taskId: \"test\") { status } }"}'
```

### **Frontend Debugging**

#### **Enable Debug Mode**

```typescript
// Add to frontend/src/main.tsx
if (process.env.NODE_ENV === "development") {
  console.log("Debug mode enabled");
}
```

#### **Check Network Requests**

```javascript
// In browser developer tools
// Network tab -> Check for failed requests
// Console tab -> Check for JavaScript errors
```

### **Database Debugging**

#### **Check Database Connections**

```bash
# Connect to database
docker-compose exec sales_analytics_db psql -U postgres -d sales_analytics

# Check active connections
SELECT * FROM pg_stat_activity;

# Check table structure
\d ingestion_tasks
```

---

## **🚨 EMERGENCY PROCEDURES**

### **Complete System Reset**

```bash
# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v
docker system prune -a

# Rebuild and start
docker-compose up -d --build

# Run migrations
docker-compose exec backend alembic upgrade head
```

### **Data Recovery**

```bash
# Backup database
docker-compose exec sales_analytics_db pg_dump -U postgres sales_analytics > backup.sql

# Restore database
docker-compose exec -T sales_analytics_db psql -U postgres sales_analytics < backup.sql
```

### **Service Recovery**

```bash
# Restart specific service
docker-compose restart [service_name]

# Check service health
docker-compose ps

# View service logs
docker-compose logs [service_name]
```

---

## **📞 SUPPORT INFORMATION**

### **Log Locations**

- **Backend**: `docker-compose logs backend`
- **Frontend**: `docker-compose logs frontend`
- **Database**: `docker-compose logs sales_analytics_db`
- **Druid**: `docker-compose logs coordinator broker historical middlemanager router`

### **Configuration Files**

- **Docker**: `docker-compose.yml`
- **Environment**: `docker.env`
- **Druid**: `druid/environment`
- **Backend**: `backend/main.py`
- **Frontend**: `frontend/package.json`

### **Useful Commands**

```bash
# Check all services status
docker-compose ps

# View all logs
docker-compose logs

# Restart all services
docker-compose restart

# Check system resources
docker stats

# Access service shell
docker-compose exec [service_name] bash
```

---

**Last Updated**: December 2024  
**Status**: Active troubleshooting guide  
**Next Review**: After resolving critical issues
