# Sales Analytics Dashboard - System Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SALES ANALYTICS DASHBOARD                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    API Calls     ┌─────────────────┐    Druid SQL       │
│  │     FRONTEND    │ ◄──────────────► │     BACKEND     │ ◄──────────────►   │
│  │                 │  (HTTP/JSON)     │                 │   (Analytics)      │
│  │   React + TS    │                  │    FastAPI      │                    │
│  │   Material-UI   │                  │    Python       │  ┌───────────────┐ │
│  │   Vite Dev      │                  │    Polars       │  │ APACHE DRUID  │ │
│  │   Port: 5174    │                  │    Port: 8000   │  │   Database    │ │
│  └─────────────────┘                  └─────────────────┘  │  (Analytics)  │ │
│                                                            │  Port: 8888   │ │
│                                                            └───────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Component Architecture

### Frontend Structure (React + TypeScript)
```
src/
├── 🎨 components/           # UI Components
│   ├── FilterBar.tsx       # Date/Branch/Product Filters
│   ├── DashboardCards/     # KPI Display Cards
│   ├── GeographicMaps/     # 4 Map Visualization Types
│   └── DatePickers/        # Enhanced Date Selection
│
├── 🔗 hooks/               # Data Fetching
│   ├── useApi.ts           # Generic API Hook
│   ├── useDynamicApi.ts    # Dynamic Endpoint Hook
│   └── useDataRange.ts     # Date Range Logic
│
├── 📡 queries/             # API Contracts
│   ├── kpiQueries.ts       # KPI Endpoints
│   └── salesQueries.ts     # Sales Data Endpoints
│
├── 🗃️ store/              # State Management
│   └── filterStore.ts      # Zustand Global State
│
└── 📄 pages/               # Route Components
    └── Dashboard.tsx       # Main Analytics View
```

### Backend Structure (FastAPI + Python)
```
backend/
├── 🚀 main.py              # FastAPI Application Entry
├── 📡 api/                 # API Routes
│   ├── routes.py           # Core Endpoints
│   └── kpi_routes.py       # KPI-Specific Routes
│
├── 💼 services/            # Business Logic
│   ├── sales_data.py       # Mock/Real Data Service
│   └── kpi_service.py      # KPI Calculations
│
├── 🔌 core/               # Infrastructure
│   └── druid_client.py     # Apache Druid Integration
│
├── 📋 schema/             # Data Validation
│   └── schema.py           # Pandera Schemas
│
└── 🛠️ utils/              # Utilities
    └── response_envelope.py # Standard API Response
```

## 🔄 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW PIPELINE                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📊 CSV Data  ──►  🗄️ Apache Druid  ──►  🐍 Backend Processing  ──►  📱 UI │
│      Input           (Analytics DB)        (Polars + FastAPI)        (React) │
│                                                                              │
│  ┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌──────────┐ │
│  │   Raw CSV   │   │   Druid Store   │   │  API Envelope    │   │ Frontend │ │
│  │   Files     │──►│   - Time Series │──►│  - Data          │──►│ Charts & │ │
│  │   - Sales   │   │   - Aggregates  │   │  - Error         │   │ Maps     │ │
│  │   - KPIs    │   │   - Fast Query  │   │  - Metadata      │   │ - Recharts│ │
│  │   - Geo     │   │   - Rollups     │   │  - Request ID    │   │ - Google  │ │
│  └─────────────┘   └─────────────────┘   └──────────────────┘   │   Maps   │ │
│                                                                  └──────────┘ │
│                                                                              │
│  📍 Fallback Path: Mock Data Service ──────────────────────────────────────► │
│      (When Druid Unavailable)                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components Deep Dive

### 1. 📊 Dashboard Components
| Component | Purpose | Data Source | Key Features |
|-----------|---------|-------------|--------------|
| `RevenueCard` | Revenue KPIs | `/api/kpi/revenue` | Real-time revenue tracking |
| `SalesCard` | Sales metrics | `/api/kpi/sales` | Volume & growth trends |
| `ProfitCard` | Profit analysis | `/api/kpi/profit` | Margin calculations |
| `GeographicMap` | Location analysis | `/api/geographic-data` | 4 visualization modes |

### 2. 🗺️ Geographic Visualization Types
```
┌─────────────────────────────────────────────────────────────────┐
│                    GEOGRAPHIC MAP TYPES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣ ENHANCED MAP      │  2️⃣ BASIC CHOROPLETH                   │
│     - County Aggregate │     - Simple Color Coding             │
│     - Profit Density   │     - Regional Overview               │
│                        │                                       │
│  3️⃣ PRECISE GPS       │  4️⃣ GOOGLE MAPS INTERACTIVE           │
│     - Real Coordinates │     - Street View Integration         │
│     - Geocoding API    │     - Satellite/Terrain Views         │
│                        │                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 3. 🔧 Enhanced Date Range Picker
```
┌─────────────────────────────────────────────────────────────────┐
│                 ENHANCED DATE PICKER FEATURES                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚡ Quick Presets     │  📅 Custom Range Selection             │
│    - This Month       │    - Start/End Date Pickers           │
│    - Last Month       │    - Visual Calendar Interface        │
│    - This Year        │    - Date Validation                  │
│    - 7/30/90 Days     │    - Error Handling                   │
│                       │                                        │
│  ✅ Validation        │  📊 Data Range Constraints             │
│    - Date Order       │    - Min: 2020-01-01                  │
│    - Future Dates     │    - Max: Current Date                │
│    - Required Fields  │    - Duration Limits                  │
│                       │                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 API Integration Patterns

### Standard API Envelope
```typescript
interface ApiResponse<T> {
  data: T;                    // Actual response data
  error?: string;             // Error message if any
  metadata: {
    requestId: string;        // Unique request identifier
    timestamp?: string;       // Response timestamp
    duration?: number;        // Processing time
  };
}
```

### Data Fetching Hooks Pattern
```typescript
// Generic API Hook
const { data, isLoading, error } = useApi<SalesData>('/api/sales');

// Dynamic Endpoint Hook
const { data } = useDynamicApi<KPIData>((filters) => 
  `/api/kpi/revenue?startDate=${filters.startDate}&endDate=${filters.endDate}`
);
```

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 User Action  ──►  🎛️ FilterBar  ──►  🗃️ filterStore        │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────────┐   │
│  │ Date Change │────►│ Component   │────►│ Global State     │   │
│  │ Branch Pick │     │ Handler     │     │ - startDate      │   │
│  │ Product Sel │     │ - Validate  │     │ - endDate        │   │
│  └─────────────┘     │ - Transform │     │ - selectedBr...  │   │
│                      └─────────────┘     │ - selectedPr...  │   │
│                                          └──────────────────┘   │
│                                                   │               │
│                                                   ▼               │
│  📊 Dashboard Components  ◄─────────────────  📡 API Calls       │
│  - Auto Re-render                           - Filtered Data      │
│  - Loading States                           - Error Handling     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🏃‍♂️ Development Workflow

### Quick Start Commands
```powershell
# 🚀 Start Backend (Port 8000)
.\start-backend.ps1

# 🎨 Start Frontend (Port 5174)
.\start-frontend.ps1

# 🐳 Full Stack with Docker
docker compose up -d

# 🧹 Development Reset
npm run dev:reset
```

### Environment Configuration
| Component | Config File | Key Settings |
|-----------|-------------|--------------|
| Frontend | `frontend/.env` | `VITE_API_URL=http://localhost:8000` |
| Backend | `backend/.env` | `DRUID_HOST=localhost:8888` |
| Druid | `druid/environment` | Database connection settings |

## 🛠️ Technology Stack

### Frontend Technologies
- **⚛️ React 18** - Component framework
- **📘 TypeScript** - Type safety
- **🎨 Material-UI (MUI)** - Component library
- **📊 Recharts** - Data visualization
- **🗺️ Google Maps API** - Geographic mapping
- **⚡ Vite** - Build tool & dev server
- **🐻 Zustand** - State management

### Backend Technologies
- **🐍 FastAPI** - Python web framework
- **🐻‍❄️ Polars** - DataFrame library
- **✅ Pandera** - Data validation
- **🗄️ Apache Druid** - Analytics database
- **📊 Uvicorn** - ASGI server

### Infrastructure
- **🐳 Docker** - Containerization
- **📦 Docker Compose** - Multi-container orchestration
- **🔍 Logging** - Request tracing & monitoring
- **🏥 Health Checks** - System status monitoring

## 🔧 Monitoring & Observability

### Health Endpoints
```
GET /api/health              # Backend health status
GET /api/health/druid        # Druid connection status
GET /api/metrics             # System metrics
```

### Logging Strategy
- **Request IDs** - Trace requests across services
- **Error Logging** - Comprehensive error tracking
- **Performance Metrics** - Response time monitoring
- **Debug Mode** - Development debugging

## 📈 Analytics Capabilities

### Real-Time KPIs
- 💰 Revenue tracking with growth rates
- 📊 Sales volume and conversion metrics
- 💹 Profit margins and cost analysis
- 🗺️ Geographic performance distribution
- 📅 Time-series trend analysis

### Geographic Analytics
- **County-level** aggregation for Kenya
- **Branch-specific** performance tracking
- **Google Maps** integration for precise locations
- **Profit distribution** visualization
- **22+ Branch locations** with exact coordinates

---

## 🚀 Quick Reference

| Need | Command | URL |
|------|---------|-----|
| **Start Development** | `.\start-frontend.ps1` | http://localhost:5174 |
| **API Documentation** | `.\start-backend.ps1` | http://localhost:8000/docs |
| **Druid Console** | `docker compose up -d` | http://localhost:8888 |
| **Health Check** | - | http://localhost:8000/api/health |

---

*This system provides a comprehensive analytics platform for Kenyan businesses with real-time data processing, interactive visualizations, and robust geographic mapping capabilities.*

| Layer       | Technology                                                              |
|-------------|-------------------------------------------------------------------------|
| **Frontend**  | React, TypeScript, Material-UI, Vite, React Query, Apache ECharts, `graphql-request` |
| **Backend**   | Python, FastAPI, Polars, Strawberry (GraphQL), PyDruid, Pandera         |
| **Database**  | Apache Druid                                                            |
| **DevOps**    | Docker, Docker Compose, PowerShell, Makefile                            |

---

## 4. Data Flow & Pipeline

The data pipeline is designed for robustness and data quality, from ingestion to visualization.

1.  **Ingestion**: A Python script (`ingest_data.py`) reads a source `sales_data.csv`, validates its structure, and ingests it into the Druid `sales_analytics` datasource.
2.  **Querying**: The FastAPI backend queries Druid using its native JSON-over-HTTP API, wrapped by the `PyDruid` library.
3.  **Processing**: The backend leverages the **Polars** library for all data manipulation. Polars' lazy evaluation and highly optimized engine provide significant performance benefits for aggregations and KPI calculations.
4.  **Validation**: **Pandera** is used to define and enforce strict data schemas on the Polars DataFrames fetched from Druid, ensuring data quality and preventing errors before they reach the API layer.
5.  **Serving**: Processed data is exposed to the frontend via both REST and GraphQL endpoints. **All major queries now accept the four main filter arguments: `startDate`, `endDate`, `branch`, and `productLine`.**
6.  **Visualization**: The React frontend fetches data using **React Query** and **graphql-codegen**-generated hooks for sophisticated caching, state management, and background updates. Data is then rendered in interactive charts and tables using **Apache ECharts**. **All filterable components/pages propagate filters in a type-safe manner.**

---

## 5. API Design Philosophy

-   **GraphQL-First**: The primary and recommended API is GraphQL (`/graphql`). This allows the frontend to request exactly the data it needs for a given view in a single round trip, preventing the common REST issues of over-fetching and under-fetching.
-   **REST Compatibility**: A full suite of REST endpoints (`/api/kpis/*`) is maintained for specific use cases, simple queries, or legacy compatibility.
-   **Standardized Response Envelope**: All API responses, both REST and GraphQL, are wrapped in a consistent envelope for predictable error and data handling on the client side.
    ```json
    {
      "data": "...",
      "error": { "code": "...", "message": "..." } | null,
      "metadata": { "requestId": "..." }
    }
    ```
-   **Naming Conventions & Argument Consistency**: A strict contract is enforced to reduce friction between Python and TypeScript ecosystems:
    -   **Backend (Python/Polars)**: `snake_case`
    -   **GraphQL Schema & Frontend (TypeScript)**: `camelCase`
    -   The `strawberry-graphql` library handles this case conversion automatically.
    -   **All major queries and resolvers now accept and propagate the same filter arguments, ensuring end-to-end consistency.**
-   **Error Handling:** Improved error handling and response envelope standardization for both REST and GraphQL endpoints.

---

## 6. Backend Design

-   **Framework**: FastAPI provides a modern, high-performance, async-first foundation with automatic OpenAPI and JSON Schema generation.
-   **Service-Oriented Structure**: Logic is cleanly separated into services (e.g., `kpi_service.py`, `sales_data.py`) for better organization, reusability, and testability.
-   **Global Error Handling**: FastAPI middleware intercepts all exceptions and formats them into the standard error envelope, ensuring consistent and predictable error responses across the entire API.
-   **Configuration**: Environment variables (`.env`) are used to manage all configuration, allowing for easy setup across different environments (development, staging, production).
-   **GraphQL Resolvers:** All resolvers now fetch real data from Druid (no more hardcoded values), and argument names/types are kept in sync with frontend queries.
-   **Redis Caching:** Redis cache initialization is now conditional based on the environment, preventing local development errors.
-   **Date Handling:** All date handling uses correct imports and types (`from datetime import date, timezone`), fixing previous runtime errors.

---

## 7. Frontend Design

-   **Framework**: React with Vite provides an extremely fast and modern development experience with hot-module replacement.
-   **Component Library**: Material-UI is used for a comprehensive set of accessible, well-designed, and ready-to-use UI components.
-   **State Management**:
    -   **Server State**: **React Query** is the cornerstone of frontend data management. It handles all data fetching, caching, background refetching, and synchronization with the backend API.
    -   **Global UI State**: React Context is used for managing global UI state, such as filters (date range, branch) and user settings.
-   **Data Fetching**: `graphql-request` is used as a lightweight and efficient client for the GraphQL API. It is paired with `graphql-codegen` to automatically generate typed hooks and interfaces from the backend schema, ensuring end-to-end type safety. **All analytics pages use a reusable `DataStateWrapper` for unified loading, error, and empty states. Spacing and layout are standardized using Material-UI's `Box` and `Grid`.**
-   **Filter Propagation:** All filterable components/pages accept and propagate global and local filters in a type-safe manner, matching backend arguments.

---

## 8. Development & Deployment

-   **Dockerization**: The entire stack (frontend, backend, Druid cluster) is fully containerized using Docker and managed with Docker Compose. This guarantees a consistent, isolated, and reproducible environment for both development and production.
-   **Management Scripts**: `docker-manager.ps1` (Windows) and a `Makefile` (Linux/Mac) provide a simple and unified command-line interface for common tasks like starting, stopping, cleaning, and testing the system.
-   **Environments**: Separate `docker-compose.dev.yml` and `docker-compose.yml` files define distinct configurations for development (with features like hot-reloading) and production.
-   **Backend Startup Script:** The PowerShell script for backend startup (`start-backend.ps1`) now reliably creates/activates the virtual environment in the project root, installs dependencies, and ensures `uvicorn` is available.

---

## 9. Observability & Monitoring

-   **Health Checks**: The backend provides dedicated health check endpoints for itself (`/api/health`) and its connection to the Druid database (`/api/health/druid`). These are surfaced on a dedicated diagnostics page in the frontend for easy debugging.
-   **Structured Logging**: A standardized logging configuration (`logging_config.py`) is used across the backend to ensure consistent, structured log formats. All API requests and errors are logged with a unique `requestId` for easy traceability through the system.

---

## 10. Project Roadmap

The project follows a two-phase strategic plan to deliver incremental value and build a business case for expanded data access.

### Phase 1 (Complete): Reveal the "What" with Sales Data

This phase focuses on extracting maximum value from the existing `sales_analytics` datasource. It answers critical questions about business performance based on *successful* deals.

-   **Status:** Complete
-   **Key Deliverables:**
    -   A **Salesperson Leaderboard** ranking reps by Gross Profit and other key metrics.
    -   A **Product Analytics** view showing profitability by product line and item.
    -   A **Branch Performance** dashboard for comparing locations over time.
    -   A **Customer Value** analysis to identify top accounts.
-   **Strategic Outcome:** Provides a comprehensive "State of the Business" dashboard, demonstrating the value of data analytics and establishing a baseline of current performance.

### Phase 2 (Future): Unlock the "Why" with CRM Data

This phase aims to build an undeniable business case for integrating CRM or inquiry data. The core argument is that the current data, while valuable, contains no record of failure and thus cannot explain why the vast majority of inquiries do not convert to sales.

-   **Status:** Proposed
-   **Business Case:** By integrating CRM data (which includes both "Successful" and "Unsuccessful" outcomes), we can move from analyzing *what* we won to understanding *why* we lose.
-   **Key Questions to Answer:**
    -   **What is our true Win Rate?** (Successful / Total Inquiries) per salesperson, product, etc.
    -   **Where is our sales funnel leaking?** Are we losing deals early (poor qualification) or late (poor closing)?
    -   **How efficient is our sales process?** What is the average sales cycle length per rep?
    -   **Are we assigning the right leads to the right people?** Are our best closers working on low-quality leads?
-   **Technical Requirements:**
    -   New data ingestion pipelines for CRM data.
    -   Expanded backend services and API endpoints.
    -   New frontend visualizations for funnel analysis, win/loss rates, and sales cycle trends.
