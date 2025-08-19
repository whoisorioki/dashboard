# Sales Analytics Dashboard - Architecture & Data Flow

## **🎯 Current System vs Proposed System**

---

## **📊 CURRENT SYSTEM ARCHITECTURE**

```
┌─────────────────┐    ┌──────────────────────────────────────────────────────────┐    ┌─────────────────┐
│                 │    │                    Backend API (FastAPI)                 │    │                 │
│  Frontend       │───▶│ ┌──────────────────┐  ┌───────────────────────────────┐  │    │  Apache Druid   │
│  (React)        │    │ │ REST Endpoints   │  │    Data Ingestion Service     │  │    │  (OLAP DB)      │
│  Port: 5173     │◀───┤ └──────────────────┘  │ ┌───────────▶┌──────────────┐ │  │    │                 │
└─────────────────┘    │ ┌──────────────────┐  │ │ Upload EP  │ Validation   │ │  ├────▶│ ┌───────────┐   │
      ▲                │ │ Dashboard Queries│◀─┼─┤ (Polars)   │ │  (Pandera)   │ │  │    │ │ Query API │   │
      │                │ └──────────────────┘  │ │            └──────────────┘ │  │    │ └───────────┘   │
      │                │         │             │ │                  │            │  │    │      ▲          │
      │                │         ▼             │ │                  ▼            │  │    │      │          │
      │                │ ┌──────────────────┐  │ │ ┌──────────────┐ ┌──────────┐ │  ├────▶│ ┌───────────┐   │
      │                │ │ Data Processing  │  │ │ │ Druid Spec Gen │ │ Task Mgmt│ │  │    │ │ Ingest API│   │
      │                │ │ (Polars)         │  │ │ └──────────────┘ └──────────┘ │  │    │ │ (Overlord)│   │
      │                │ └──────────────────┘  │ └───────────────────────────────┘  │    │ └───────────┘   │
      │                └──────────────────────────────────────────────────────────┘    └─────────────────┘
      │                                                      │ ▲
      │                                                      │ │
      ▼                                                      ▼ │
┌─────────────────┐                                    ┌─────────────┐  ┌──────────────────┐
│ Shared Storage  │◀────────────────────────────────────┤ Operational ├─▶│                  │
│ (AWS S3)        │                                    │ DB (PostgreSQL)│  │ User             │
└─────────────────┘───────────────────────────────────▶└─────────────┘  │ (via Frontend)   │
                                                                       └──────────────────┘
```

### **Current Data Flow:**

1. **File Upload Flow:**

   ```
   User → Frontend (5173) → Backend (8000) → S3 Storage → PostgreSQL (metadata)
   ```

2. **Data Processing Flow:**

   ```
   S3 File → Backend Validation → Druid Ingestion Spec → Druid Overlord → Task Status
   ```

3. **Dashboard Query Flow:**
   ```
   Frontend → Backend REST API → Druid Query API → Response → Frontend Display
   ```

---

## **🚀 PROPOSED SYSTEM ARCHITECTURE**

```
┌─────────────────┐    ┌──────────────────────────────────────────────────────────┐    ┌─────────────────┐
│                 │    │                    Backend API (FastAPI)                 │    │                 │
│  Frontend       │───▶│ ┌──────────────────┐  ┌───────────────────────────────┐  │    │  Apache Druid   │
│  (React)        │    │ │ GraphQL Endpoint │  │    Data Ingestion Service     │  │    │  (OLAP DB)      │
│  Port: 5173     │◀───┤ └──────────────────┘  │ ┌───────────▶┌──────────────┐ │  │    │                 │
└─────────────────┘    │ ┌──────────────────┐  │ │ Upload EP  │ Validation   │ │  ├────▶│ ┌───────────┐   │
      ▲                │ │ Query Resolvers  │◀─┼─┤ (Polars)   │ │  (Pandera)   │ │  │    │ │ Query API │   │
      │                │ └──────────────────┘  │ │            └──────────────┘ │  │    │ └───────────┘   │
      │                │         │             │ │                  │            │  │    │      ▲          │
      │                │         ▼             │ │                  ▼            │  │    │      │          │
      │                │ ┌──────────────────┐  │ │ ┌──────────────┐ ┌──────────┐ │  ├────▶│ ┌───────────┐   │
      │                │ │ Data Processing  │  │ │ │ Druid Spec Gen │ │ Task Mgmt│ │  │    │ │ Ingest API│   │
      │                │ │ (Polars)         │  │ │ └──────────────┘ └──────────┘ │  │    │ │ (Overlord)│   │
      │                │ └──────────────────┘  │ └───────────────────────────────┘  │    │ └───────────┘   │
      │                └──────────────────────────────────────────────────────────┘    └─────────────────┘
      │                                                      │ ▲
      │                                                      │ │
      ▼                                                      ▼ │
┌─────────────────┐                                    ┌─────────────┐  ┌──────────────────┐
│ Shared Storage  │◀────────────────────────────────────┤ Operational ├─▶│                  │
│ (AWS S3)        │                                    │ DB (PostgreSQL)│  │ User             │
└─────────────────┘───────────────────────────────────▶└─────────────┘  │ (via Frontend)   │
                                                                       └──────────────────┘
```

### **Proposed Data Flow:**

1. **File Upload Flow:**

   ```
   User → Frontend (5173) → GraphQL Mutation → Backend (8000) → S3 Storage → PostgreSQL (metadata)
   ```

2. **Data Processing Flow:**

   ```
   S3 File → Backend Validation → Druid Ingestion Spec → Druid Overlord → Task Status
   ```

3. **Dashboard Query Flow:**
   ```
   Frontend → GraphQL Query → Backend Resolvers → Druid Query API → Response → Frontend Display
   ```

---

## **🔄 DETAILED DATA FLOW COMPARISON**

### **Current System Data Flow:**

#### **1. File Upload Process:**

```
User Upload → Frontend (React)
    ↓
Backend REST API (/api/ingest/upload)
    ↓
File Validation (Polars + Pandera)
    ↓
S3 Upload (AWS S3)
    ↓
PostgreSQL (Task Metadata)
    ↓
Druid Ingestion Spec Generation
    ↓
Druid Overlord API (Task Submission)
    ↓
Task Status Tracking (PostgreSQL)
    ↓
Frontend Status Updates
```

#### **2. Dashboard Query Process:**

```
Frontend Request → Backend REST API
    ↓
Druid Query API
    ↓
Data Processing (Polars)
    ↓
Response Formatting
    ↓
Frontend Display
```

### **Proposed System Data Flow:**

#### **1. File Upload Process:**

```
User Upload → Frontend (React)
    ↓
GraphQL Mutation (uploadSalesData)
    ↓
Backend Resolver
    ↓
File Validation (Polars + Pandera)
    ↓
S3 Upload (AWS S3)
    ↓
PostgreSQL (Task Metadata)
    ↓
Druid Ingestion Spec Generation
    ↓
Druid Overlord API (Task Submission)
    ↓
Task Status Tracking (PostgreSQL)
    ↓
GraphQL Query (getIngestionTaskStatus)
    ↓
Frontend Status Updates
```

#### **2. Dashboard Query Process:**

```
Frontend Request → GraphQL Query
    ↓
Backend Resolvers
    ↓
Druid Query API
    ↓
Data Processing (Polars)
    ↓
GraphQL Response
    ↓
Frontend Display
```

---

## **📊 COMPONENT DETAILS**

### **Frontend (React)**

- **Port**: 5173 (Vite dev server)
- **Technology**: React 18 + TypeScript + Material-UI
- **State Management**: React Context + Custom Hooks
- **API Communication**:
  - **Current**: REST API calls
  - **Proposed**: GraphQL queries/mutations

### **Backend (FastAPI)**

- **Port**: 8000
- **Technology**: FastAPI + Python 3.12
- **Data Processing**: Polars (DataFrames)
- **Validation**: Pandera (Schema validation)
- **API Type**:
  - **Current**: REST endpoints
  - **Proposed**: GraphQL (Strawberry)

### **Apache Druid**

- **Coordinator**: Port 8081
- **Router**: Port 8888
- **Broker**: Port 8082
- **Historical**: Port 8083
- **MiddleManager**: Port 8091
- **Function**: OLAP database for analytics

### **PostgreSQL**

- **Port**: 5433
- **Function**: Operational database for task tracking and metadata

### **AWS S3**

- **Function**: File storage for uploaded data files
- **Organization**: `uploads/{datasource_name}/{filename}`

---

## **🎯 KEY DIFFERENCES**

| Aspect                   | Current System   | Proposed System                 |
| ------------------------ | ---------------- | ------------------------------- |
| **API Type**             | REST endpoints   | GraphQL queries/mutations       |
| **File Upload**          | REST POST        | GraphQL mutation                |
| **Status Tracking**      | REST GET         | GraphQL query                   |
| **Dashboard Queries**    | REST endpoints   | GraphQL resolvers               |
| **Type Safety**          | Manual           | Auto-generated TypeScript types |
| **Query Flexibility**    | Fixed endpoints  | Dynamic GraphQL queries         |
| **Frontend Integration** | Manual API calls | GraphQL Code Generator          |

---

## **🚧 CURRENT STATUS**

### **✅ Working Components:**

- Frontend dashboard (React)
- Backend API (FastAPI)
- File upload to S3
- PostgreSQL database
- Druid services (all running)
- Task tracking system

### **⚠️ Issues to Resolve:**

- Druid S3 configuration for ingestion
- GraphQL implementation (proposed)
- Frontend dependency installation
- Complete data pipeline testing

### **📈 Next Steps:**

1. Fix Druid S3 configuration
2. Implement GraphQL layer (optional)
3. Test complete data pipeline
4. Verify dashboard visualizations

---

**Last Updated**: August 19, 2025
