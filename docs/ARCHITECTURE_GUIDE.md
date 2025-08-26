# 🏗️ Architecture Guide - Sales Analytics Dashboard

## **📋 Overview**

This guide consolidates all architecture information including system architecture, data pipeline, and technical design for the Sales Analytics Dashboard.

---

## **🏗️ SYSTEM ARCHITECTURE**

### **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Data Layer    │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   (Druid + S3)  │
│   Material-UI   │    │   GraphQL       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**

#### **Frontend Layer**

- **Framework**: React 18.3.1 + TypeScript 5.8.3
- **UI Library**: Material-UI (MUI) v5.17.1
- **Charts**: Nivo, Recharts, ECharts
- **State Management**: Zustand + React Query
- **Build Tool**: Vite 6.3.5

#### **Backend Layer**

- **Framework**: FastAPI + Python 3.11+
- **GraphQL**: Strawberry GraphQL
- **Data Processing**: Polars 0.20.0 + Pandas 2.0.0
- **Validation**: Pandera schemas
- **Authentication**: JWT-based auth system

#### **Data Layer**

- **Analytics Engine**: Apache Druid 33.0.0
- **File Storage**: AWS S3
- **Metadata Storage**: PostgreSQL 15
- **Caching**: Redis
- **Migrations**: Alembic

---

## **🔄 DATA PIPELINE ARCHITECTURE**

### **Complete Data Flow**

```
1. User Uploads File (Frontend)
   ↓
2. Frontend Validation (File format, size, structure)
   ↓
3. Backend Processing (Polars validation, Pandera schemas)
   ↓
4. S3 Storage (Organized file structure with metadata)
   ↓
5. Database Tracking (PostgreSQL task status)
   ↓
6. Druid Ingestion (Dynamic spec generation)
   ↓
7. Real-time Analytics (GraphQL queries with caching)
   ↓
8. Frontend Visualization (Charts, KPIs, tables)
```

### **Data Processing Components**

#### **1. Data Validation Service**

```python
# backend/services/data_validation_service.py
class DataValidationService:
    def validate_file(self, file_path: str) -> ValidationResult:
        # Polars-based validation
        # Structure-based validation (flexible column names)
        # Multi-format support (CSV, XLSX, Parquet)
```

**Validation Features:**

- **Schema Validation**: Automatic column type detection
- **Data Quality Checks**: Missing value handling and data cleaning
- **Business Logic**: Sales and returns validation
- **Error Reporting**: Detailed validation error messages

#### **2. Dynamic Schema Service**

```python
# backend/services/dynamic_schema_service.py
class DynamicSchemaService:
    def analyze_csv_structure(self, file_path: str) -> Dict[str, Any]
    def generate_druid_ingestion_spec(self, file_path: str, datasource_name: str) -> Dict[str, Any]
    def validate_schema_compatibility(self, schema: Dict[str, Any]) -> bool
```

**Schema Features:**

- **Intelligent Column Type Detection**: Automatically identifies timestamp, dimension, and metric columns
- **Robust CSV Parsing**: Handles complex CSV structures with embedded commas and quotes
- **Polars LazyFrame Integration**: Uses Polars for efficient, memory-optimized data processing
- **Schema Validation**: Ensures compatibility with Druid requirements

#### **3. S3 Integration Service**

```python
# backend/services/s3_service.py
class S3Service:
    def upload_file_to_s3(self, file: UploadFile, object_name: str) -> bool:
        # AWS S3 upload with error handling
        # Organized file structure: uploads/{datasource_name}/{filename}
```

**Storage Features:**

- **Organized Structure**: `uploads/{datasource_name}/{filename}`
- **Metadata Storage**: PostgreSQL for task tracking
- **Error Handling**: Comprehensive error reporting and recovery
- **Multi-format Support**: CSV, Excel (.xlsx, .xls), Parquet files

---

## **📊 DATA ARCHITECTURE**

### **Data Storage Strategy**

#### **1. PostgreSQL (Metadata)**

```sql
-- Task tracking table
CREATE TABLE ingestion_tasks (
    id UUID PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    datasource_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data source metadata
CREATE TABLE data_sources (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. Apache Druid (Analytics Data)**

```json
{
  "type": "index_parallel",
  "spec": {
    "ioConfig": {
      "type": "index_parallel",
      "inputSource": {
        "type": "s3",
        "uris": ["s3://your-bucket/uploads/datasource/file.csv"]
      }
    },
    "dataSchema": {
      "dataSource": "sales_analytics",
      "timestampSpec": {
        "column": "date",
        "format": "yyyy-MM-dd"
      },
      "dimensionsSpec": {
        "dimensions": ["branch", "product", "customer"]
      },
      "metricsSpec": [
        { "name": "revenue", "type": "doubleSum", "fieldName": "revenue" },
        { "name": "profit", "type": "doubleSum", "fieldName": "profit" }
      ]
    }
  }
}
```

#### **3. AWS S3 (File Storage)**

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

## **🔧 COMPONENT ARCHITECTURE**

### **Frontend Component Structure**

```
App (Router)
├── Layout (Sidebar + Header)
├── Dashboard Pages
│   ├── Overview
│   ├── Sales Analytics
│   ├── Product Analytics
│   ├── Branch Analytics
│   ├── Profitability
│   └── Data Ingestion
└── Shared Components
    ├── KpiCard
    ├── ChartCard
    ├── DataTable
    └── FilterPanel
```

### **Backend Service Architecture**

```
FastAPI Application
├── API Routes
│   ├── /api/kpis/* - KPI endpoints
│   ├── /api/charts/* - Chart data endpoints
│   ├── /api/tables/* - Table data endpoints
│   ├── /api/filters/* - Filter endpoints
│   └── /api/ingest/* - Data ingestion endpoints
├── GraphQL Schema
│   ├── Queries - Data retrieval
│   ├── Mutations - Data modification
│   └── Subscriptions - Real-time updates
├── Services
│   ├── DataValidationService
│   ├── DynamicSchemaService
│   ├── S3Service
│   ├── DruidService
│   └── AnalyticsService
└── Models & Schemas
    ├── Database models
    ├── Pandera schemas
    └── GraphQL types
```

---

## **🚀 PERFORMANCE ARCHITECTURE**

### **Performance Optimizations**

#### **Frontend Performance**

- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtualization**: React-window for large datasets
- **Caching**: React Query for API response caching
- **Bundle Optimization**: Tree shaking and code splitting

#### **Backend Performance**

- **Async Processing**: Non-blocking file uploads
- **Connection Pooling**: Database connection optimization
- **Caching**: Redis-based caching layer
- **Data Processing**: Polars for high-performance data operations
- **Background Tasks**: Celery-like task processing

#### **Data Layer Performance**

- **Druid Optimization**: Columnar storage and indexing
- **Query Optimization**: Efficient SQL generation
- **Caching**: Multi-level caching strategy
- **Compression**: Data compression for storage efficiency

### **Scalability Features**

#### **Horizontal Scaling**

- **Docker Containers**: Easy horizontal scaling
- **Load Balancing**: Nginx-based load balancing
- **Database Sharding**: PostgreSQL read replicas
- **Druid Clustering**: Multiple historical nodes

#### **Performance Monitoring**

- **Health Checks**: Comprehensive health monitoring
- **Metrics Collection**: Performance metrics collection
- **Logging**: Structured logging with correlation IDs
- **Alerting**: Automated alerting for critical issues

---

## **🔒 SECURITY ARCHITECTURE**

### **Security Layers**

#### **1. Authentication & Authorization**

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: User role management
- **Session Management**: Secure session handling
- **API Security**: Rate limiting and throttling

#### **2. Data Security**

- **Encryption**: Data encryption at rest and in transit
- **Access Control**: Fine-grained access control
- **Audit Logging**: Comprehensive audit trails
- **Data Masking**: Sensitive data protection

#### **3. Infrastructure Security**

- **Network Security**: VPC and security groups
- **Container Security**: Docker security best practices
- **Secret Management**: Environment-based configuration
- **Regular Updates**: Security patch management

---

## **📈 MONITORING & OBSERVABILITY**

### **Monitoring Stack**

#### **1. Application Monitoring**

- **Health Endpoints**: `/health` endpoints for all services
- **Performance Metrics**: Response time, throughput, error rates
- **Business Metrics**: KPI tracking and alerting
- **User Experience**: Frontend performance monitoring

#### **2. Infrastructure Monitoring**

- **Container Health**: Docker container monitoring
- **Resource Usage**: CPU, memory, disk, network
- **Service Discovery**: Service health and availability
- **Log Aggregation**: Centralized logging and analysis

#### **3. Data Pipeline Monitoring**

- **Ingestion Status**: Real-time task monitoring
- **Data Quality**: Validation and quality metrics
- **Processing Latency**: End-to-end processing time
- **Error Tracking**: Comprehensive error monitoring

---

## **🔮 FUTURE ARCHITECTURE ENHANCEMENTS**

### **Short-term (Next 2-4 weeks)**

- **Performance Tuning**: Optimize Druid S3 configuration
- **Enhanced Monitoring**: Advanced system monitoring
- **Caching Strategy**: Multi-level caching implementation

### **Medium-term (Next 2-3 months)**

- **Real-time Streaming**: Kafka integration for live data
- **Microservices**: Service decomposition for scalability
- **Advanced Analytics**: Machine learning integration

### **Long-term (Next 6-12 months)**

- **Multi-tenant Architecture**: User management and permissions
- **Global Deployment**: Multi-region deployment
- **AI Integration**: Predictive analytics and forecasting

---

## **📚 Related Documentation**

- **[COMPREHENSIVE_SYSTEM_REPORT.md](COMPREHENSIVE_SYSTEM_REPORT.md)** - Complete system status
- **[QUICK_START.md](QUICK_START.md)** - Getting started guide
- **[TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md)** - API and technical details
- **[CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)** - Configuration setup

---

**Last Updated**: August 26, 2025
