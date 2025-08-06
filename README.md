# 📊 Sales Analytics Dashboard 
![MIT License](https://img.shields.io/badge/license-MIT-green.svg) ![React](https://img.shields.io/badge/React-18.x-blue.svg) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104.x-green.svg) ![Python](https://img.shields.io/badge/Python-3.12+-blue.svg) ![Apache Druid](https://img.shields.io/badge/Apache%20Druid-0.23.0-orange.svg)

> **🇰🇪 A comprehensive, real-time sales analytics platform designed specifically for Kenyan businesses. Built with modern technologies including React 18, FastAPI, Apache Druid, and Google Maps integration for geographic insights.**

## 🌟 Key Highlights

- **🚀 Real-time Analytics** - Live KPI tracking with Apache Druid OLAP engine
- **🗺️ Geographic Intelligence** - 4 map visualization types with Google Maps integration  
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🔄 Robust Fallbacks** - Automatic mock data when systems are unavailable
- **🎯 Kenyan-Focused** - Localized for KSh currency, counties, and business context
- **⚡ High Performance** - Polars DataFrame processing and React Query caching
- **🔍 Full Observability** - Health monitoring, request tracing, and diagnostics

---

## Table of Contentsnalytics Dashboard ![MIT License](https://img.shields.io/badge/license-MIT-green.svg)

> **A modern, robust, and fully localized sales analytics platform for Kenyan businesses built with React, FastAPI, and Apache Druid.**

---

## Table of Contents

- [🌟 Key Highlights](#-key-highlights)
- [Table of Contents](#table-of-contents)
- [🏗️ System Architecture](#️-system-architecture)
- [✨ Core Features](#-core-features)
- [📱 User Interface](#-user-interface)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running the Application](#running-the-application)
- [🛠️ Technology Stack](#️-technology-stack)
- [📊 Analytics Capabilities](#-analytics-capabilities)
- [🗺️ Geographic Features](#️-geographic-features)
- [🔧 API Reference](#-api-reference)
- [🏛️ Architecture Deep Dive](#️-architecture-deep-dive)
- [📈 Performance & Scalability](#-performance--scalability)
- [🔍 Monitoring & Observability](#-monitoring--observability)
- [🌍 Localization & Regional Features](#-localization--regional-features)
- [🤝 Contributing](#-contributing)
- [📋 Troubleshooting](#-troubleshooting)
- [📜 License](#-license)

---

## 🏗️ System Architecture

The Sales Analytics Dashboard follows a modern, microservices-inspired architecture designed for scalability, reliability, and maintainability:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        🇰🇪  SALES ANALYTICS DASHBOARD                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│       FRONTEND              API LAYER               DATA LAYER                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   React 18      │    │   FastAPI       │    │    Apache Druid             │  │
│  │   TypeScript    │◄──►│   Python 3.12   │◄──►│    OLAP Engine              │  │
│  │   Material-UI   │    │   Polars        │    │    Real-time Analytics      │  │
│  │   Google Maps   │    │   Strawberry    │    │    Columnar Storage         │  │
│  │   Port 5174     │    │   Port 8000     │    │    Port 8888                │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│                                                                                 │
│  🔧 INFRASTRUCTURE                           📊 FEATURES                       │
│  • Docker Compose                           • Real-time KPI Dashboards          │
│  • Health Monitoring                        • Geographic Analytics              │
│  • Request Tracing                          • Advanced Date Filtering           │
│  • Auto-Fallbacks                           • Multi-dimensional Analysis        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## ✨ Core Features

### 📊 **Advanced Analytics Engine**
- **Real-time KPI Tracking** - Revenue, profit margins, sales velocity, and growth metrics
- **Multi-dimensional Analysis** - By branch, product line, salesperson, and time periods  
- **Geographic Intelligence** - County-level profitability mapping across Kenya
- **Predictive Insights** - Trend analysis and forecasting capabilities

### 🗺️ **Four Map Visualization Types**
1. **Enhanced County Map** - Aggregate profitability by Kenyan counties
2. **Basic Choropleth** - Simple color-coded regional performance
3. **Precise GPS Mapping** - Exact branch locations with Google Maps geocoding
4. **Interactive Google Maps** - Street view, satellite imagery, and real-time navigation

### 📅 **Smart Date Management**
- **Quick Presets** - This month, last month, last 7/30/90 days
- **Custom Range Selection** - Flexible date picker with validation
- **Business Context** - Kenyan fiscal calendar and holiday awareness
- **Data Range Constraints** - Automatic validation against available data

### 🎯 **Advanced Filtering System**
- **Branch Filtering** - 22+ locations across Kenya with exact coordinates
- **Product Line Analysis** - Toyota, Doosan, automotive parts, and services
- **Customer Segmentation** - Enterprise, SME, and individual customer analysis
- **Salesperson Performance** - Individual and team-based metrics

## 📱 User Interface

The dashboard provides an intuitive, responsive interface designed specifically for business analytics:

### 🎨 **Design Principles**
- **Material Design 3** - Modern, accessible UI components
- **Mobile-First** - Responsive design for all device types
- **Dark/Light Themes** - User preference support
- **Kenyan Localization** - KSh currency, Swahili place names, local business context

### 📱 **Navigation Structure**

#### **🏠 Dashboard (Main)** - `/`
- **Overview**: Real-time KPI cards with sparkline trends
- **Analytics**: Monthly sales trends with interactive filtering
- **Geography**: Four different map visualization options
- **Intelligence**: Branch-product heatmaps and performance insights

#### **💰 Sales Analytics** - `/sales`  
- **Performance**: Salesperson leaderboards and productivity metrics
- **Trends**: Historical sales performance with growth analysis
- **Targets**: Sales target attainment and goal tracking
- **Customers**: Top customer analysis and relationship insights

#### **🗺️ Branches** - `/branches`
- **Performance**: Branch-wise revenue and profit comparison
- **Growth**: Expansion metrics and market penetration analysis
- **Geography**: Location-based performance with map integration
- **Operations**: Branch efficiency and resource utilization

#### **📦 Products** - `/products`
- **Analytics**: Product line performance and profitability analysis
- **Trends**: Product lifecycle and seasonal performance patterns
- **Mix**: Product portfolio optimization and recommendations
- **Returns**: Product quality and customer satisfaction metrics

#### **📊 Profitability Analysis** - `/profitability`
- **Margins**: Gross profit analysis across multiple dimensions
- **Trends**: Profitability trends and cost optimization insights
- **Segments**: Customer and product segment profitability
- **Forecasting**: Predictive profitability modeling

#### **🔧 System Health** - `/alerts`
- **Monitoring**: Real-time system health and performance metrics
- **Diagnostics**: API connectivity and database status checks
- **Logs**: Request tracing and error tracking dashboard
- **Alerts**: System notifications and maintenance schedules

## 🚀 Getting Started

### 📋 **Prerequisites**

**Required Software:**
- **🐍 Python 3.12+** - Backend development and data processing
- **📦 Node.js 18+** - Frontend development and build tools
- **🐳 Docker & Docker Compose** - Container orchestration (recommended)
- **🗄️ Apache Druid** - Analytics database (optional - auto-fallback to mock data)

**Development Environment:**
- **VS Code** (Recommended) - Enhanced development experience
- **PowerShell/Bash** - Terminal access for script execution

### ⚡ **Quick Start (5 Minutes)**

#### **🐳 Docker Launch (Recommended)**
```bash
# Start complete system with one command
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose ps

# Access dashboard
open http://localhost:5173
```

#### **🛠️ Manual Development Setup**

**1. Clone & Setup**
```bash
git clone <repository-url>
cd dashboard
```

**2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.\.venv\Scripts\activate
# Activate virtual environment (Linux/macOS)  
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI development server
python main.py
# Backend available at: http://localhost:8000
```

**3. Frontend Setup**
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start Vite development server
npm run dev
# Frontend available at: http://localhost:5173
```

### 🔧 **Configuration**

#### **Environment Variables**
Create `.env` file in project root:
```env
# Google Maps API (Required for map visualizations)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend Configuration
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173

# Druid Configuration (Optional)
DRUID_BROKER_URL=http://localhost:8888
DRUID_ENABLE_FALLBACK=true

# Development Settings
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:8000
```

#### **🗺️ Google Maps API Setup**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing project
3. Enable **Maps JavaScript API**
4. Create API key with proper restrictions
5. Add API key to `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

**API Key Restrictions (Security):**
- **Application restrictions:** HTTP referrers
- **Allowed referrers:** `localhost:5173/*`, `your-domain.com/*`
- **API restrictions:** Maps JavaScript API only

### 🐳 **Docker Development**

#### **Available Compose Files**
- `docker-compose.yml` - Production deployment
- `docker-compose.dev.yml` - Development with hot reload
- `druid/docker-compose.yml` - Druid-only analytics engine

#### **Development Commands**
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose -f docker-compose.dev.yml up --build

# Stop all services
docker-compose down

# Complete cleanup (removes volumes)
docker-compose down -v --remove-orphans
```

### 📝 **Development Scripts**

#### **PowerShell Scripts (Windows)**
```powershell
# Start backend only
.\start-backend.ps1

# Start frontend only  
.\start-frontend.ps1

# Docker management utility
.\docker-manager.ps1
```

#### **Manual Commands**
```bash
# Backend development
cd backend && python main.py

# Frontend development
cd frontend && npm run dev

# Install new backend package
cd backend && pip install package-name
pip freeze > requirements.txt

# Install new frontend package
cd frontend && npm install package-name
```

### ✅ **Verification Steps**

#### **🔍 System Health Check**
1. **Backend API**: Visit `http://localhost:8000/docs` for OpenAPI documentation
2. **Frontend Application**: Visit `http://localhost:5173` for dashboard
3. **API Health**: Check `http://localhost:8000/api/health` for system status
4. **Druid Health**: Check `http://localhost:8000/api/health/druid` for analytics engine

#### **🧪 Feature Testing**
- **Navigation**: Verify all 6 main pages load without errors
- **Data Loading**: Check that KPI cards display data (mock or real)
- **Charts**: Ensure visualizations render properly across different chart types
- **Maps**: Verify Google Maps components load with proper API key
- **Responsive Design**: Test dashboard on different screen sizes

### 🚨 **Common Issues & Solutions**

#### **Issue: Google Maps not loading**
```bash
# Solution 1: Check API key configuration
echo $VITE_GOOGLE_MAPS_API_KEY

# Solution 2: Verify API key permissions in Google Cloud Console
# - Enable "Maps JavaScript API"
# - Check referrer restrictions allow localhost:5173
# - Ensure API key has no usage limits exceeded
```

#### **Issue: Backend connection failed**
```bash
# Solution 1: Verify backend is running
curl http://localhost:8000/api/health

# Solution 2: Check Docker containers status
docker-compose ps

# Solution 3: View backend logs
docker-compose logs backend
```

#### **Issue: Charts not rendering**
```bash
# Solution 1: Clear browser cache and restart
# - Open Developer Tools (F12)
# - Right-click refresh button → "Empty Cache and Hard Reload"

# Solution 2: Reinstall frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Solution 3: Check for console errors
# - Open Developer Tools → Console tab
# - Look for errors related to chart libraries
```

#### **Issue: Druid connection failed**
```bash
# Solution 1: Start Druid cluster manually
cd druid
docker-compose up -d

# Solution 2: Check Druid service health
curl http://localhost:8888/druid/v2/datasources

# Solution 3: Use mock data fallback (automatic)
# System automatically switches to mock data when Druid is unavailable
# Check for "usingMockData: true" in API responses
```

#### **Issue: Port conflicts**
```bash
# Solution 1: Check which process is using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# Solution 2: Kill conflicting process
taskkill /PID <process_id> /F  # Windows
kill -9 <process_id>           # macOS/Linux

# Solution 3: Use different ports
# Edit docker-compose.yml or .env file to use alternative ports
```

#### **Issue: Memory/Performance problems**
```bash
# Solution 1: Increase Docker memory allocation
# - Docker Desktop → Settings → Resources → Memory (8GB+)

# Solution 2: Monitor resource usage
docker stats

# Solution 3: Optimize development environment
# - Close unnecessary applications
# - Use production build for testing: npm run build
```

---

## 🛠️ Technology Stack

### 🎨 **Frontend Technologies**
- **⚛️ React 18.3.1** - Modern component framework with concurrent features and automatic batching
- **📘 TypeScript** - Type safety and enhanced developer experience with strict mode
- **🎨 Material-UI v5.17.1** - Google's Material Design 3 components with custom theming
- **📊 Nivo 0.99.0** - Declarative charting library with animated data visualizations
- **📈 ECharts 5.6.0** - Apache ECharts for advanced interactive visualizations  
- **🗺️ Google Maps JavaScript API** - Interactive mapping with geocoding and satellite imagery
- **⚡ Vite** - Next-generation frontend build tool with hot module replacement
- **�️ React Query 5.83.0** - Server state management with intelligent caching and synchronization
- **🧠 Zustand** - Lightweight state management for client-side application state
- **� MUI X Date Pickers** - Advanced date range selection with business calendar support

### 🐍 **Backend Technologies**
- **🚀 FastAPI 0.100+** - High-performance Python web framework with automatic API documentation
- **🐻‍❄️ Polars 0.19+** - Lightning-fast DataFrame library for data processing (10x faster than pandas)
- **🍓 Strawberry GraphQL 0.209+** - Modern GraphQL library with code-first approach
- **🔧 Uvicorn 0.23+** - Lightning-fast ASGI server for production deployment
- **🗄️ Apache Druid** - Real-time analytics database with columnar storage
- **✅ Pandera** - Data validation and quality assurance for DataFrames
- **📊 PyDruid 0.6.5+** - Python client for Apache Druid queries
- **🌐 HTTPX 0.24+** - Modern HTTP client for async API communications

### 🏗️ **Infrastructure & DevOps**
- **🐳 Docker & Docker Compose** - Containerization for consistent development and deployment
- **� Health Monitoring** - Comprehensive service health checks and observability
- **📝 Structured Logging** - Request tracing and error tracking across all services
- **🔄 Auto-Fallback Systems** - Intelligent mock data fallback when services are unavailable
- **⚙️ Environment Configuration** - Flexible configuration management via environment variables

### 📊 **Analytics & Data Processing**
- **🗄️ Apache Druid 0.23.0** - OLAP engine for real-time analytics with sub-second query performance
- **🎯 PostgreSQL** - Metadata storage for Druid coordination
- **� Apache Zookeeper** - Distributed coordination for Druid cluster management
- **📈 Time-Series Analytics** - Optimized for time-based sales and performance data
- **🔄 Real-Time Ingestion** - Support for streaming data updates and real-time dashboards

---

## 📊 Analytics Capabilities

### 💰 **Financial KPIs**
- **Revenue Tracking** - Real-time revenue monitoring with YoY/MoM growth
- **Profit Analysis** - Gross profit, margins, and profitability trends
- **Cost Management** - COGS tracking and cost optimization insights
- **Target Attainment** - Sales target vs. actual performance

### 📈 **Sales Performance**
- **Sales Velocity** - Deal closure rates and sales cycle analysis
- **Product Performance** - Best-performing products and categories
- **Salesperson Leaderboards** - Individual and team performance metrics
- **Customer Analytics** - Customer lifetime value and retention analysis

### 🗺️ **Geographic Intelligence**
- **County-Level Analysis** - Performance breakdown by Kenyan counties
- **Branch Comparison** - Multi-location performance comparison
- **Territory Management** - Geographic territory optimization
- **Location Insights** - Traffic patterns and accessibility analysis

### 📅 **Time-Series Analysis**
- **Trend Identification** - Long-term and seasonal patterns
- **Forecasting** - Predictive analytics for planning
- **Period Comparison** - YoY, MoM, WoW analysis
- **Seasonality** - Business cycle and seasonal trend analysis

---

## 🗺️ Geographic Features

### 🗺️ **Map Visualization Types**

#### 1. 🎨 **Enhanced Geographic Map** *(Primary)*
- **Technology**: Nivo Geo with TopoJSON for Kenyan counties
- **Features**: Interactive county-level profitability visualization with color gradients
- **Data Source**: Real-time profit aggregation by geographic regions
- **Interactions**: Hover details, click-to-drill-down, and export capabilities
- **Performance**: Optimized for fast rendering with large datasets

#### 2. 📊 **Basic Choropleth Map** *(Lightweight)*  
- **Technology**: Nivo Geo with simplified geometry
- **Features**: Fast-loading regional performance overview with minimal styling
- **Use Case**: Mobile devices and low-bandwidth scenarios
- **Benefits**: Reduced memory footprint and faster initial load times

#### 3. 📍 **Precise Google Maps** *(GPS-Accurate)*
- **Technology**: Google Maps JavaScript API with Geocoding API
- **Features**: Exact branch locations with real-time geocoding validation
- **Accuracy**: GPS coordinates verified against Google's location database
- **Intelligence**: Distance calculations and accessibility analysis
- **Markers**: Custom profit-based marker colors and detailed info windows

#### 4. 🛰️ **Simple Google Maps Test** *(Development)*
- **Technology**: Google Maps with GoogleMapsManager singleton
- **Purpose**: Testing and development of map functionality
- **Features**: Basic map rendering with test markers for major Kenyan cities
- **Reliability**: Enhanced error handling and retry logic for stable loading

### 🏢 **Branch Network Coverage**

The system accurately tracks **22+ branch locations** across Kenya with exact GPS coordinates:

#### **🏙️ Major Urban Centers**
- **Nairobi Trading** - New Cargen House, Lusaka Road, Industrial Area
- **Mombasa Trading** - Mbaraki Road, Coastal operations hub
- **Kisumu Trading** - Obote Road, Western Kenya regional center
- **Nakuru Trading & Distribution** - Nairobi-Eldoret Highway corridor

#### **🌍 Regional Hubs**
- **Eldoret** - Uganda Road, Yana Building (Northern corridor)
- **Thika** - Saleh Building, strategic location near Nairobi
- **Kitengela** - Yukos Station area, satellite town coverage
- **Malindi** - Lamu Road, coastal tourism and logistics hub

#### **📍 Specialized Locations**
- **Doosan Center** - Heavy machinery and equipment hub
- **Toyota Showrooms** - Multiple locations with automotive focus
- **Service Centers** - Distributed across major highways and urban areas

Each location includes:
- **Exact GPS coordinates** for precise mapping
- **Business context** (product lines, specializations)
- **Performance metrics** (revenue, profit, growth trends)
- **Geographic insights** (county, accessibility, market coverage)

---

## 🔧 API Reference

### 📚 **Interactive Documentation**
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **GraphQL Playground**: [http://localhost:8000/graphql](http://localhost:8000/graphql)

### 🚀 **Core API Endpoints**

#### **📊 KPI Analytics Endpoints**
All KPI endpoints are prefixed with `/api/kpis/` and return standardized response envelopes:

- **`GET /api/kpis/monthly-sales-growth`** - Monthly sales growth trends and historical data
- **`GET /api/kpis/sales-target-attainment`** - Sales target vs actual performance metrics
- **`GET /api/kpis/product-performance`** - Top performing products by revenue and profit
- **`GET /api/kpis/branch-product-heatmap`** - Product performance heatmap by branch location
- **`GET /api/kpis/branch-performance`** - Branch-wise performance metrics and comparisons
- **`GET /api/kpis/branch-list`** - Complete list of branch locations with metadata
- **`GET /api/kpis/branch-growth`** - Branch growth trends and expansion metrics
- **`GET /api/kpis/sales-performance`** - Salesperson and team performance analytics
- **`GET /api/kpis/product-analytics`** - Detailed product line analysis and insights
- **`GET /api/kpis/revenue-summary`** - Comprehensive revenue breakdown and summaries
- **`GET /api/kpis/customer-value`** - Customer lifetime value and segmentation analysis
- **`GET /api/kpis/employee-performance`** - Employee productivity and performance metrics
- **`GET /api/kpis/top-customers`** - High-value customer analysis and rankings
- **`GET /api/kpis/margin-trends`** - Profit margin trends and cost analysis
- **`GET /api/kpis/profitability-by-dimension`** - Multi-dimensional profitability analysis
- **`GET /api/kpis/returns-analysis`** - Returns, refunds, and customer satisfaction metrics

#### **🔍 System & Health Endpoints**
- **`GET /api/health`** - Backend API health status and system metrics
- **`GET /api/health/druid`** - Apache Druid connectivity and performance status
- **`GET /api/druid/datasources`** - Available Druid datasources and metadata
- **`GET /api/sales`** - Raw sales data with filtering capabilities
- **`GET /api/data-range`** - Available data date ranges for proper filtering
- **`POST /api/user-activity`** - User activity tracking for analytics

#### **🎯 GraphQL Unified Endpoint**
- **`POST /graphql`** - Unified GraphQL endpoint for complex queries and data batching

### 📋 **Request/Response Format**

All API endpoints return a consistent envelope structure:

```json
{
  "data": { /* Your actual data */ },
  "error": null | { "message": "Error description", "code": "ERROR_CODE" },
  "metadata": {
    "requestId": "uuid-v4-request-id",
    "timestamp": "2025-01-15T10:30:00Z",
    "usingMockData": false,
    "executionTimeMs": 145
  }
}
```

### 🔧 **Query Parameters**

Most endpoints support these common filters:
- **`startDate`** - Start date for time-based filtering (YYYY-MM-DD)
- **`endDate`** - End date for time-based filtering (YYYY-MM-DD)
- **`branch`** - Specific branch filter (exact match)
- **`productLine`** - Product line filter (e.g., "Toyota", "Doosan")
- **`itemGroups`** - Item group filtering (array of item groups)
- **`target`** - Sales target for attainment calculations

---

## 🏛️ Architecture Deep Dive

### 🔄 **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DATA FLOW PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   DATA SOURCES    ▶️    PROCESSING    ▶️    API LAYER    ▶️      UI            │
│                                                                                 │
│  ┌─────────────┐     ┌─────────────────┐    ┌─────────────────┐    ┌─────────┐  │
│  │ CSV Files   │  ─▶ │ Apache Druid    │ ─▶│ FastAPI         │ ─▶│ React   │  │
│  │ Real-time   │     │ OLAP Engine     │    │ Polars/Pandera  │    │ TS      │  │
│  │ Databases   │     │ Columnar Store  │    │ GraphQL/REST    │    │ MUI     │  │
│  └─────────────┘     └─────────────────┘    └─────────────────┘    └─────────┘  │
│                                                                                 │
│  🔄 FALLBACK SYSTEM: Mock Data Generator ────────────────────────────────────▶ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 🏗️ **Backend Architecture**

#### **📊 Data Processing Layer**
- **Polars DataFrames** - High-performance data manipulation (10x faster than pandas)
- **Pandera Validation** - Schema validation and data quality assurance
- **Type Safety** - Strict typing with Pydantic models for all data structures
- **Error Handling** - Global exception handlers with detailed error reporting

#### **🚀 API Layer**
- **FastAPI Framework** - Automatic OpenAPI documentation and validation
- **Dual API Support** - REST endpoints for simple queries, GraphQL for complex data fetching
- **Request Envelope** - Standardized response format with metadata and error handling
- **Authentication Ready** - JWT token support and user activity tracking

#### **🗄️ Analytics Engine**
- **Apache Druid Integration** - Real-time OLAP queries with sub-second performance
- **Connection Pooling** - Efficient database connection management
- **Retry Logic** - Exponential backoff for failed queries (1s, 2s, 4s intervals)
- **Graceful Degradation** - Automatic fallback to mock data when Druid unavailable

### 🎨 **Frontend Architecture**

#### **⚛️ Component Structure**
- **Page Components** - Route-level components for major dashboard sections
- **Chart Components** - Reusable visualization components with consistent APIs
- **Layout Components** - Navigation, headers, and responsive grid systems
- **Utility Components** - Date pickers, filters, and common UI elements

#### **🔄 State Management**
- **Zustand Store** - Global state for filters, user preferences, and application state
- **React Query** - Server state management with intelligent caching and invalidation
- **Local State** - Component-specific state using React hooks
- **Persistence** - LocalStorage integration for user preferences

#### **📊 Data Visualization**
- **Nivo Charts** - Primary charting library with responsive design
- **ECharts Integration** - Advanced visualizations for complex data
- **Google Maps** - Geographic visualization with custom markers and overlays
- **Responsive Design** - Mobile-first approach with breakpoint-specific layouts

### 🐳 **Infrastructure Architecture**

#### **🏗️ Container Orchestration**
```yaml
# Docker Compose Services:
services:
  backend:          # FastAPI application server
  frontend:         # React development server  
  druid-broker:     # Query coordination service
  druid-historical: # Data storage and retrieval
  druid-middleman:  # Real-time data ingestion
  postgres:         # Metadata storage
  zookeeper:        # Distributed coordination
```

#### **🔍 Observability Stack**
- **Health Endpoints** - `/api/health` and `/api/health/druid` for monitoring
- **Request Tracing** - Unique request IDs for end-to-end tracking  
- **Structured Logging** - JSON logs with correlation IDs
- **Performance Metrics** - Query execution times and resource utilization

### 📡 **API Design Patterns**

#### **🎯 Unified Response Envelope**
```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  metadata: {
    requestId: string;
    timestamp: string;
    usingMockData: boolean;
    executionTimeMs: number;
  };
}
```

#### **🔧 Error Handling Strategy**
- **Global Exception Handlers** - Consistent error formatting across all endpoints
- **User-Friendly Messages** - Clear, actionable error descriptions
- **Error Classifications** - Validation, business logic, and system errors
- **Fallback Mechanisms** - Graceful degradation with mock data

### 🛡️ **Security & Performance**

#### **🔒 Security Measures**
- **CORS Configuration** - Proper cross-origin resource sharing setup
- **Input Validation** - Pydantic models for request validation
- **SQL Injection Prevention** - Parameterized queries and ORM usage
- **Environment Security** - Secure handling of API keys and credentials

#### **⚡ Performance Optimizations**
- **Database Indexing** - Optimized Druid segments for fast querying
- **Caching Strategy** - React Query with intelligent cache invalidation
- **Code Splitting** - Lazy loading of components and routes
- **Compression** - Gzip compression for API responses and static assets

---

## System & Integrations Overview

### 1. System Architecture & Data Flow

- **Frontend:**

- Built with React 18, TypeScript, and Material-UI, using Recharts for data visualization (with a roadmap to migrate to Apache ECharts).

- Data is fetched using custom React hooks and React Query, with global state managed via React Context for filters (date range, branch, product line) and data mode (mock/real).

- All monetary values are displayed in Kenyan Shillings (KES), with proper localization and formatting.

- Robust error boundaries and unified empty/error/loading states ensure a consistent user experience.

- **Backend:**

- FastAPI (Python) serves as the API layer, exposing both REST and GraphQL endpoints for analytics and health checks.

- Data processing uses Polars for high-performance DataFrame operations and Pandera for schema validation.

- All API responses are wrapped in a standardized envelope:

```json

{ "data": ..., "error": ..., "metadata": { "requestId": ... } }

```

- Robust error handling includes global exception handlers, logging, and request ID tracing for observability.

- Automatic fallback to realistic mock data if Druid is unavailable, ensuring dashboard availability.

- **Analytics Database:**

- Apache Druid is the OLAP engine, storing all sales data in the `sales_analytics` datasource.

- Data is ingested from CSV via a backend script, with dimensions and metrics mapped for analytics.

- Druid is queried directly by the backend for all analytics endpoints, supporting real-time and historical queries.

- **Infrastructure:**

- Docker Compose orchestrates the full stack (backend, frontend, Druid, Zookeeper, PostgreSQL).

- Health endpoints and logs provide observability and diagnostics for all services.

- Environment variables and config files manage deployment and connectivity for different environments.

---

### 2. API & Integration Patterns

- **REST & GraphQL APIs:**

- REST endpoints are provided for each KPI (e.g., `/api/kpis/monthly-sales-growth`, `/api/kpis/product-performance`).

- A unified GraphQL endpoint (`/graphql`) allows the frontend to batch queries and fetch only the needed data for each dashboard view.

- All endpoints accept flexible filters (date range, branch, product line, etc.) for tailored analytics.

- API contracts and TypeScript types are kept in sync via code generation and mapping documentation.

- **Frontend–Backend Mapping:**

- Each dashboard component maps to a specific API endpoint and TypeScript interface, ensuring type safety and contract alignment.

- All error and loading states are handled consistently, with banners or warnings if mock data is being used.

- **Data Pipeline:**

- Data flows from CSV → Druid → Backend (Polars) → API → Frontend (React).

- Schema validation and error handling are enforced at every stage to ensure data quality and reliability.

---

### 3. Best Practices & Operational Checklists

- **API Consistency:**

- All endpoints use a standardized envelope and error structure, with clear codes and messages.

- Naming conventions: snake_case in Python backend, camelCase in GraphQL/TypeScript.

- TypeScript types are generated from the GraphQL schema to avoid manual mismatches and ensure contract integrity.

- **Observability & Monitoring:**

- Health endpoints (`/api/health`, `/api/health/druid`) and logs are available for all services.

- Recommendations include integrating with monitoring tools for production (e.g., Prometheus, Grafana, Sentry).

- **Automation:**

- Scripts and recommendations are provided for automating Druid health checks, ingestion job tracking, and alerting.

- Persistent job tracking and scheduled ingestion are supported for robust data operations.

- **Deployment:**

- The system is fully Dockerized for both development and production, with environment-specific configuration via `.env` files.

- Troubleshooting guides and health checks are available for all major services.

- **Data Quality & Validation:**

- Pandera schemas validate all incoming data from Druid, and completeness checks are recommended for ingestion scripts.

- All calculations are robust to empty data, NaN/infinite values, and missing columns.

- **Documentation & Communication:**

- All endpoints, data contracts, and error codes are documented and kept in sync between backend and frontend teams.

- Checklists for stabilization, refactoring, and scaling are maintained for operational excellence.

---

### 4. Business Alignment & Roadmap

- **Phase 1:**

- The system maximizes insights from the current Sales table, answering key business questions such as most profitable salespeople, products, and customers.

- Dashboards and reports are built to demonstrate value and support business decision-making.

- **Phase 2:**

- The system is designed to make a strong business case for integrating CRM/inquiry data, enabling advanced analytics such as win rates, sales funnel analysis, and sales cycle efficiency.

- **Future Enhancements:**

- Planned migration to GraphQL-first data fetching for efficiency and flexibility.

- Migration to Apache ECharts for advanced charting capabilities.

- Integration of geospatial analytics, role-based access control, and advanced state management as the system scales.

---

### 5. Troubleshooting & Support

- **Common Issues:**

- Druid or backend unavailability, CORS errors, API contract mismatches, and filter issues are common and have clear troubleshooting steps.

- Health endpoints and logs are the first line of defense for diagnosing issues.

- **Error Handling:**

- All errors are logged and surfaced to the frontend in a user-friendly way, with request IDs for traceability.

- Mock data fallback ensures the dashboard remains usable even if Druid is down.

- **Support & Contribution:**

- Clear guidelines are provided for contributing, testing, and extending the system.

- All changes to data contracts or endpoints should be documented and communicated to both frontend and backend teams.

---

### 6. Key Integration Points Summary

| Layer        | Technology        | Integration/Contract              |

| ------------ | ----------------- | --------------------------------- |

| Frontend     | React, TypeScript | API hooks, TypeScript types       |

| API Layer    | FastAPI, GraphQL  | REST/GraphQL endpoints, error env |

| Data Engine  | Apache Druid      | Ingestion spec, scan queries      |

| Data Quality | Pandera, Polars   | Schema validation, error handling |

| Deployment   | Docker Compose    | .env files, health endpoints      |

| Monitoring   | Logging, Health   | /api/health, /api/health/druid    |

---

This overview provides a self-contained summary of the system’s architecture, data flow, integration patterns, best practices, and troubleshooting approach, suitable for onboarding, stakeholder review, or technical reference.

---

## Localization

- **Currency:** All monetary values displayed as `KSh` (Kenyan Shillings)

- **Number Formatting:** Uses `en-KE` locale for proper Kenyan formatting

- **Date Formatting:** Consistent date display across all components

- **Mock Data:** Realistic Kenyan business data (branches, products, companies)

---

## 🛡️ **Error Handling & System Robustness**

### 🔧 **Frontend Error Management**
- **Error Boundaries** - React error boundaries catch and display user-friendly error messages
- **Loading States** - Skeleton components and progressive loading indicators
- **Fallback UI** - ChartEmptyState components for graceful degradation
- **Type Safety** - Strict TypeScript configuration prevents runtime errors
- **Defensive Programming** - Null checks and default values throughout component tree

### 📡 **API Response Envelope**
**Unified Response Format:**
```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  metadata: {
    requestId: string;           // Unique identifier for request tracing
    timestamp: string;           // ISO timestamp for debugging
    usingMockData: boolean;      // Indicates if fallback data is being used
    executionTimeMs: number;     // Performance monitoring
  };
}
```

**Error Classification:**
- **Validation Errors** - Invalid input data with specific field errors
- **Business Logic Errors** - Domain-specific errors with actionable messages
- **System Errors** - Infrastructure failures with fallback mechanisms
- **Network Errors** - Connection issues with retry logic

### 🔄 **Resilience Features**
- **Automatic Fallback** - Seamless switch to mock data when Druid unavailable
- **Retry Logic** - Exponential backoff for failed database queries (1s, 2s, 4s intervals)
- **Circuit Breaker** - Prevents cascade failures in distributed system
- **Health Monitoring** - Real-time service health checks and alerting
- **Request Tracing** - End-to-end request tracking with correlation IDs

### 🎯 **User Experience**
- **Clear Error Messages** - Human-readable error descriptions with suggested actions
- **Progress Indicators** - Visual feedback for long-running operations
- **Graceful Degradation** - System remains functional even when some services fail
- **Consistent UI** - Standardized error states across all components
- **Accessibility** - Screen reader compatible error announcements

---

## 🛠️ **Development Tools & Workflow**

### 🎨 **Frontend Development**
- **React 18.3.1** - Component framework with concurrent features
- **TypeScript 5.5** - Static type checking and IDE support
- **Vite** - Fast development server with hot module replacement
- **ESLint + Prettier** - Code quality and formatting enforcement
- **React DevTools** - Component inspection and performance profiling

### 🐍 **Backend Development**  
- **FastAPI** - Interactive API documentation with Swagger UI
- **Python 3.12** - Latest Python features and performance improvements
- **Poetry/pip** - Dependency management and virtual environments
- **Black + isort** - Code formatting and import organization
- **Pytest** - Comprehensive testing framework with fixtures

### 🐳 **DevOps & Infrastructure**
- **Docker & Docker Compose** - Containerized development and deployment
- **Health Endpoints** - Service monitoring and alerting capabilities
- **Structured Logging** - JSON logs with correlation IDs and request tracing
- **Environment Management** - Flexible configuration via environment variables
- **CI/CD Ready** - Dockerized builds and deployment automation

### 🔍 **Monitoring & Observability**
- **Request Tracing** - Unique request IDs for end-to-end debugging
- **Performance Metrics** - Query execution times and resource utilization
- **Health Checks** - Real-time service status monitoring
- **Error Tracking** - Comprehensive error logging with stack traces
- **User Analytics** - Dashboard usage patterns and performance insights

---

## 📖 **Additional Resources**

### 📚 **Documentation**
- **API Documentation** - Interactive Swagger UI at `/docs` endpoint
- **Component Storybook** - Isolated component development and testing
- **Architecture Diagrams** - System design and data flow documentation
- **Development Guides** - Setup instructions and best practices

### 🌐 **External Dependencies**
- **Google Maps Platform** - [Setup Guide](https://developers.google.com/maps/gmp-get-started)
- **Apache Druid** - [Official Documentation](https://druid.apache.org/docs/latest/)
- **Material-UI** - [Component Library](https://mui.com/material-ui/)
- **FastAPI** - [Framework Documentation](https://fastapi.tiangolo.com/)

### 🤝 **Community & Support**
- **GitHub Issues** - Bug reports and feature requests
- **Development Team** - Internal support and code reviews
- **Code Standards** - ESLint/Prettier configurations and style guides
- **Testing Guidelines** - Unit, integration, and end-to-end testing strategies



- **Apache Druid** (OLAP analytics engine)

- **Zookeeper** (Druid coordination)

- **PostgreSQL** (Druid metadata storage)

- **Docker** (containerization)

- **Persistent Volumes** (data durability)

- **Environment Variables & Config Files** (in `druid/`)

### Observability & Health

- **API Envelope** (standardized error/data/metadata)

- **Request ID Tracing** (for all API calls)

- **Health Endpoints** (`/api/health`, `/api/health/druid`)

- **Alerts & Diagnostics Page** (frontend system health)

- **Logging** (all API requests, errors, and retries)

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request

### Development Guidelines

- Follow TypeScript and Python best practices

- Use Material-UI components consistently

- Add proper error handling for all API calls

- Include loading and empty states

- Test with both mock and real data

- Ensure all endpoints return the API envelope

- Write clear, actionable error messages

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors & Acknowledgments

- **Lead Developer:** [Your Name](https://github.com/yourusername)

- **Special Thanks:** Kenyan analytics and business community for feedback and requirements

- **Technologies:** Built with React, FastAPI, Apache Druid, and Material-UI

---

## FAQ

**Q: Is this dashboard production-ready?**

A: Yes, it's robust, extensible, and includes comprehensive error handling, observability, and fallback mechanisms.

**Q: How do I add a new KPI?**

A: Add a backend endpoint in `backend/api/kpi_routes.py` and a corresponding frontend hook following the existing pattern.

**Q: Can I use this without Apache Druid?**

A: Yes, the system automatically falls back to realistic mock data when Druid is unavailable.

**Q: How do I customize the mock data?**

A: Edit the `generate_large_mock_sales_data` function in `backend/services/sales_data.py`.

**Q: Is the dashboard responsive?**

A: Yes, it's fully responsive and works on desktop, tablet, and mobile devices.

**Q: How do I reset the welcome tour?**

A: Use the "Reset Tour" option in the user menu (bottom-left of the sidebar).
