# 🚀 Druid Configuration Guide - Current Working Setup

## **Overview**

This document describes the current working Druid configuration for the Sales Analytics Dashboard. After resolving multiple configuration issues, we now have a stable, fully functional Druid cluster.

## **Current Status: FULLY WORKING** ✅

- ✅ **Coordinator**: Running and managing the cluster
- ✅ **Broker**: Responding and ready for queries
- ✅ **Historical**: Running and ready for data storage
- ✅ **MiddleManager**: Registered as worker with capacity 4
- ✅ **Router**: Running and routing requests
- ✅ **PostgreSQL**: Healthy and storing metadata
- ✅ **Ingestion Pipeline**: Complete pipeline working

## **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   (Port 8000)   │◄──►│   (Port 5433)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Druid Router  │
                       │   (Port 8888)   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Coordinator   │
                       │   (Port 8081)   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Zookeeper     │
                       │   (Port 2181)   │
                       └─────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────────────────┐
        │                                                     │
        ▼                                                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Broker      │    │    Historical   │    │  MiddleManager  │
│   (Port 8082)   │    │   (Port 8083)   │    │   (Port 8091)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## **Configuration Details**

### **1. Metadata Storage**

All services use **PostgreSQL** for metadata storage:

```yaml
# Environment variables for all Druid services
- druid_metadata_storage_type=postgresql
- druid_metadata_storage_connector_connectURI=jdbc:postgresql://postgres:5432/sales_analytics
- druid_metadata_storage_connector_user=postgres
- druid_metadata_storage_connector_password=Enter@321
```

### **2. Deep Storage**

All services use **local storage** for segments:

```yaml
# Environment variables for all Druid services
- druid_storage_type=local
- druid_storage_storageDirectory=/opt/shared/segments
```

### **3. Extensions**

All services load the same extensions:

```yaml
# Environment variables for all Druid services
- druid_extensions_loadList=["druid-histogram", "druid-datasketches", "druid-lookups-cached-global", "postgresql-metadata-storage", "druid-multi-stage-query"]
```

### **4. Memory Configuration**

Properly configured Java memory settings (no duplicate prefixes):

```yaml
# Broker, Historical, MiddleManager, Router
- DRUID_XMX=2g
- DRUID_XMS=2g
- DRUID_MAXNEWSIZE=512m
- DRUID_NEWSIZE=512m

# Coordinator
- DRUID_XMS=1g
- DRUID_XMX=2g
- DRUID_MAXDIRECTMEMORYSIZE=1g
```

### **5. Service Dependencies**

Proper startup order with health checks:

```yaml
# Coordinator depends on
depends_on:
  zookeeper:
    condition: service_healthy
  postgres:
    condition: service_healthy

# Other services depend on
depends_on:
  zookeeper:
    condition: service_healthy
  coordinator:
    condition: service_started
```

## **Volume Mounts**

### **Shared Volumes**

```yaml
volumes:
  druid_shared: {} # Shared storage for segments and data files
  druid_metadata: {} # Persistent metadata storage
  postgres_data: {} # PostgreSQL data
  frontend_node_modules: {} # Frontend dependencies
```

### **Service-Specific Mounts**

```yaml
# Coordinator & Historical
volumes:
  - druid_shared:/opt/shared
  - druid_metadata:/opt/druid/var

# Broker, MiddleManager, Router
volumes:
  - {service}_var:/opt/druid/var  # Individual service volumes
```

## **Recent Fixes Applied**

### **1. Memory Configuration Fix** ✅

**Problem**: Duplicate `-Xmx` prefixes causing JVM startup failures

```bash
# Before (BROKEN)
DRUID_XMX=-Xmx2g  # Would result in -Xmx-Xmx2g

# After (FIXED)
DRUID_XMX=2g      # Results in correct -Xmx2g
```

**Impact**: All Druid services now start successfully

### **2. Configuration Unification** ✅

**Problem**: Mixed Derby/PostgreSQL configurations causing conflicts
**Solution**: All services now use consistent PostgreSQL metadata storage

### **3. Volume Mount Fixes** ✅

**Problem**: Windows Bash volume mounting issues
**Solution**: Proper volume paths and named volumes

### **4. Service Dependencies** ✅

**Problem**: Startup race conditions causing service failures
**Solution**: Proper health checks and dependency ordering

### **5. Frontend Configuration** ✅

**Problem**: Port conflicts and dependency issues
**Solution**: Fixed to run on port 3000 with persistent node_modules

## **Testing the Configuration**

### **1. Check Service Status**

```bash
# All services should be running
docker-compose ps

# Expected output: All services showing "Up" status
```

### **2. Verify Worker Registration**

```bash
# Check if middlemanager is registered as a worker
curl -s "http://localhost:8081/druid/indexer/v1/workers"

# Expected output: JSON array with worker information
[{"worker":{"host":"172.18.0.x:8091","capacity":4}}]
```

### **3. Test Ingestion Pipeline**

```bash
# Upload a test file
curl -X POST http://localhost:8000/api/ingest/upload \
  -F "file=@data.csv" \
  -F "datasource_name=test_data"

# Check task status
curl -s "http://localhost:8081/druid/indexer/v1/task/{TASK_ID}/status"
```

### **4. Verify Data Sources**

```bash
# Check registered datasources
curl -s "http://localhost:8081/druid/coordinator/v1/datasources"

# Expected output: Array of datasource names
["test_data"]
```

## **Monitoring and Troubleshooting**

### **Service Logs**

```bash
# View specific service logs
docker-compose logs -f coordinator
docker-compose logs -f broker
docker-compose logs -f middlemanager
docker-compose logs -f historical
```

### **Health Checks**

```bash
# Check service health
curl -s http://localhost:8082/status  # Broker
curl -s http://localhost:8083/status  # Historical
curl -s http://localhost:8091/status  # MiddleManager
```

### **Common Issues and Solutions**

#### **Service Not Starting**

1. Check memory configuration (no duplicate `-Xmx` prefixes)
2. Verify PostgreSQL is healthy
3. Check volume mounts are correct
4. Review service dependencies

#### **Worker Not Registering**

1. Ensure coordinator is running
2. Check middlemanager logs for errors
3. Verify ZooKeeper connectivity
4. Check memory settings

#### **Ingestion Tasks Failing**

1. Verify worker is registered
2. Check task logs in coordinator
3. Ensure shared volume is accessible
4. Verify file permissions

## **Scaling the Cluster**

### **Adding More Workers**

To add more middlemanager workers:

1. **Duplicate the middlemanager service** in `docker-compose.yml`
2. **Update the service name** and container name
3. **Assign unique ports** for the new service
4. **Restart the stack**

```yaml
middlemanager2:
  image: apache/druid:33.0.0
  container_name: middlemanager2
  ports:
    - "8092:8091" # Different host port
    - "8110-8115:8100-8105" # Different host ports
  # ... rest of configuration same as middlemanager
```

### **Memory Tuning**

Adjust memory settings based on available resources:

```yaml
# For high-memory systems
- DRUID_XMX=4g
- DRUID_XMS=4g

# For low-memory systems
- DRUID_XMX=1g
- DRUID_XMS=1g
```

## **Next Steps**

With the current working configuration, you can now:

1. **Upload more data** through the API
2. **Query the data** using Druid's SQL interface
3. **Build dashboards** with the ingested data
4. **Scale the cluster** by adding more workers if needed

## **Configuration Files**

- **Main Configuration**: `docker-compose.yml` (contains all Druid environment variables)
- **Legacy Files**: `druid/environment` and `druid/_common/` (no longer used)
- **Database**: PostgreSQL configuration in `docker-compose.yml`

---

**Last Updated**: August 20, 2025  
**Status**: Fully working Druid cluster  
**Configuration**: Unified PostgreSQL metadata + Local storage
