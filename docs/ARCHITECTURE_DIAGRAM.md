# System Architecture Diagram

## Overview

This document describes the complete architecture of the Sales Analytics Dashboard system, including the newly implemented Dynamic CSV Ingestion System.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  React Application (Port 3000/5173)                                                │
│  ├── Dashboard Components                                                          │
│  ├── Data Ingestion UI                                                            │
│  ├── Sales Analytics Views                                                        │
│  └── Real-time Monitoring                                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/GraphQL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   API GATEWAY LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  FastAPI Backend (Port 8000)                                                      │
│  ├── REST API Endpoints                                                            │
│  │   ├── /api/ingest/upload (S3-based)                                           │
│  │   ├── /api/ingest/local-upload (Local processing)                             │
│  │   ├── /api/ingest/analyze-schema (Schema analysis)                            │
│  │   ├── /api/ingest/status/{task_id} (Status tracking)                          │
│  │   ├── /api/sales (Sales data)                                                 │
│  │   └── /api/kpi (KPI calculations)                                             │
│  │                                                                                 │
│  └── GraphQL Endpoints (Strawberry)                                               │
│      ├── /graphql (Main GraphQL endpoint)                                         │
│      └── GraphiQL Interface                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Internal API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                BUSINESS LOGIC LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Core Services                                                                     │
│  ├── DynamicSchemaService                                                          │
│  │   ├── CSV Structure Analysis                                                   │
│  │   ├── Column Type Detection                                                    │
│  │   ├── Druid Schema Generation                                                  │
│  │   └── Schema Validation                                                        │
│  │                                                                                 │
│  ├── DataTransformationService                                                    │
│  │   ├── Robust CSV Parsing (Polars)                                             │
│  │   ├── Date Format Handling (DD/MM/YYYY → ISO)                                  │
│  │   ├── Business Logic Application                                               │
│  │   └── Data Quality Validation                                                  │
│  │                                                                                 │
│  ├── SalesDataService                                                             │
│  │   ├── Dynamic Data Fetching                                                    │
│  │   ├── LazyFrame Processing                                                     │
│  │   └── Type Conversion & Validation                                            │
│  │                                                                                 │
│  ├── KPIService                                                                   │
│  │   ├── Monthly Sales Growth                                                     │
│  │   ├── Profitability Analysis                                                   │
│  │   └── Dynamic Aggregations                                                     │
│  │                                                                                 │
│  ├── S3Service                                                                    │
│  │   ├── File Upload Management                                                   │
│  │   └── AWS S3 Integration                                                       │
│  │                                                                                 │
│  └── FileProcessingService                                                        │
│      ├── File Validation                                                          │
│      └── Temporary Storage Management                                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Data Flow
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  DATA STORAGE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Apache Druid (OLAP Database)                                                     │
│  ├── Coordinator (Port 8081)                                                      │
│  │   ├── Task Management                                                          │
│  │   ├── Metadata Management                                                      │
│  │   └── Segment Management                                                       │
│  │                                                                                 │
│  ├── Broker (Port 8888)                                                           │
│  │   ├── Query Routing                                                            │
│  │   └── Result Aggregation                                                       │
│  │                                                                                 │
│  ├── Historical (Port 8083)                                                       │
│  │   ├── Data Storage                                                             │
│  │   └── Segment Processing                                                       │
│  │                                                                                 │
│  ├── MiddleManager (Port 8091)                                                    │
│  │   ├── Ingestion Tasks                                                          │
│  │   └── Data Processing                                                          │
│  │                                                                                 │
│  └── Router (Port 8888)                                                           │
│      ├── Load Balancing                                                           │
│      └── Query Distribution                                                       │
│                                                                                     │
│  PostgreSQL (Operational Database)                                                │
│  ├── Ingestion Task Metadata                                                      │
│  ├── User Management                                                              │
│  └── System Configuration                                                          │
│                                                                                     │
│  AWS S3 (Shared Storage)                                                          │
│  ├── Raw CSV Files                                                                │
│  ├── Processed Data                                                               │
│  └── Backup & Archive                                                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Infrastructure
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               INFRASTRUCTURE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Docker & Docker Compose                                                          │
│  ├── Container Orchestration                                                      │
│  ├── Service Discovery                                                            │
│  ├── Volume Management                                                            │
│  └── Network Configuration                                                        │
│                                                                                     │
│  Zookeeper (Port 2181)                                                            │
│  ├── Service Coordination                                                          │
│  └── Configuration Management                                                      │
│                                                                                     │
│  Redis (Port 6379)                                                                │
│  ├── Query Result Caching                                                         │
│  └── Session Management                                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. Data Ingestion Flow

```
CSV Upload → Backend Processing → Dynamic Schema Analysis → Data Transformation → Druid Ingestion
     │              │                    │                      │                    │
     ▼              ▼                    ▼                      ▼                    ▼
  Frontend    File Validation    Column Detection        Clean Data         Segment Creation
     │              │                    │                      │                    │
     ▼              ▼                    ▼                      ▼                    ▼
  User Input   S3 Storage       Schema Generation      Business Logic      Data Availability
```

### 2. Query Flow

```
Frontend Request → GraphQL/REST API → Business Logic → Druid Query → Result Processing → Response
      │                │                │              │              │                │
      ▼                ▼                ▼              ▼              ▼                ▼
   Dashboard      FastAPI Router    Service Layer   Druid Broker   Data Aggregation  UI Update
```

### 3. Real-time Data Flow

```
Druid Segments → Historical Nodes → Broker Queries → Cached Results → Frontend Display
      │              │                │              │              │
      ▼              ▼                ▼              ▼              ▼
   Data Storage   Data Processing   Query Routing   Performance    User Experience
```

## Key Features

### 1. Dynamic CSV Ingestion

- **Intelligent Schema Detection**: Automatically identifies column types
- **Robust Parsing**: Handles complex CSV structures with embedded commas
- **Automatic Ingestion Spec Generation**: Creates Druid-compatible schemas
- **Data Quality Validation**: Ensures data integrity and consistency

### 2. Polars Integration

- **LazyFrame Processing**: Memory-efficient data operations
- **Type Safety**: Strong typing for data validation
- **Performance Optimization**: Fast data processing and transformation
- **Schema Adaptation**: Dynamic column type handling

### 3. GraphQL & REST Hybrid

- **GraphQL**: Complex queries and real-time updates
- **REST API**: File uploads and simple operations
- **Unified Backend**: Single FastAPI application
- **Flexible Frontend**: Choose appropriate API for use case

### 4. Scalable Architecture

- **Microservices**: Independent service components
- **Containerization**: Docker-based deployment
- **Load Balancing**: Druid router for query distribution
- **Caching**: Redis for performance optimization

## Port Configuration

| Service             | Port      | Purpose                      |
| ------------------- | --------- | ---------------------------- |
| Frontend            | 3000/5173 | React Development/Production |
| Backend             | 8000      | FastAPI Application          |
| Druid Router        | 8888      | Query Interface              |
| Druid Coordinator   | 8081      | Task Management              |
| Druid Historical    | 8083      | Data Storage                 |
| Druid MiddleManager | 8091      | Ingestion Processing         |
| Zookeeper           | 2181      | Service Coordination         |
| Redis               | 6379      | Caching & Sessions           |
| PostgreSQL          | 5432      | Metadata Storage             |

## Environment Configuration

### Required Environment Variables

```bash
# AWS Configuration
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

## Security Features

### 1. Data Protection

- **Environment Variables**: No hardcoded secrets
- **S3 Security**: AWS IAM role-based access
- **Network Isolation**: Docker network segmentation
- **Input Validation**: Comprehensive data validation

### 2. Access Control

- **API Authentication**: Secure endpoint access
- **File Upload Validation**: Malicious file prevention
- **Query Sanitization**: SQL injection prevention
- **Rate Limiting**: API abuse prevention

## Performance Optimization

### 1. Data Processing

- **LazyFrame Operations**: Memory-efficient processing
- **Parallel Processing**: Concurrent task execution
- **Incremental Updates**: Delta processing capabilities
- **Smart Caching**: Intelligent result caching

### 2. Query Optimization

- **Druid Segments**: Optimized data partitioning
- **Index Optimization**: Fast data retrieval
- **Query Planning**: Intelligent query routing
- **Result Caching**: Redis-based caching

## Monitoring & Observability

### 1. System Health

- **Container Monitoring**: Docker health checks
- **Service Status**: API endpoint monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Comprehensive error logging

### 2. Data Quality

- **Ingestion Monitoring**: Task success/failure rates
- **Data Validation**: Schema compliance checks
- **Performance Metrics**: Processing time tracking
- **Quality Scores**: Automated data quality assessment

## Deployment

### 1. Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Production Considerations

- **Resource Allocation**: Optimize memory and CPU
- **Scaling**: Horizontal scaling for high load
- **Backup**: Regular data and configuration backups
- **Monitoring**: Production-grade monitoring tools

## Conclusion

This architecture provides a robust, scalable foundation for the Sales Analytics Dashboard with the following key benefits:

1. **Dynamic Data Ingestion**: Automated CSV processing with intelligent schema detection
2. **High Performance**: Polars LazyFrame processing and Druid optimization
3. **Flexible APIs**: GraphQL and REST endpoints for different use cases
4. **Scalable Infrastructure**: Docker-based microservices architecture
5. **Data Quality**: Comprehensive validation and monitoring
6. **Production Ready**: Security, monitoring, and error handling

The system is designed to handle complex data scenarios while maintaining high performance and reliability standards.
