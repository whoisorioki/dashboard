# Sales Analytics Dashboard ![MIT License](https://img.shields.io/badge/license-MIT-green.svg)

> **A modern, robust, and fully localized sales analytics platform for Kenyan businesses built with React, FastAPI, and Apache Druid.**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Data Pipeline](#data-pipeline)
- [Metric Standardization](#metric-standardization)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Sales Analytics Dashboard is a full-stack analytics platform built with React (Vite, Material-UI) and FastAPI (Python, Druid, Polars). It provides real-time and historical sales insights, interactive visualizations, and robust KPI tracking, fully localized for the Kenyan market with all monetary values in Kenyan Shillings (KSh).

The platform supports both real-time data from Apache Druid and comprehensive mock data for development and testing scenarios. It is designed for reliability, observability, and user-friendly error handling.

---

## Features

- **📊 Modern Analytics UI:** Material-UI cards, charts, and controls with unified error/loading/empty states
- **📅 Smart Date Range Picker:** Modern, validated date range picker with Kenyan business context
- **🎯 Comprehensive KPIs:** 20+ standardized metrics including revenue, profitability, and performance analytics
- **📤 Dynamic Data Ingestion:** Enterprise-grade file upload system supporting CSV, Excel, and Parquet files up to 500MB
- **✅ Data Validation:** Automated data quality checks using Polars and Pandera with comprehensive error reporting
- **🔄 Real-time Status Tracking:** Live monitoring of data ingestion progress with detailed status updates
- **🔄 Robust Error Handling:** Unified error handling with user-friendly messages and request ID tracing
- **🧪 Mock Data Support:** Toggle between mock/real data with clear visual indicators
- **📱 Responsive Design:** Optimized for desktop and mobile devices
- **⚡ Real-time Updates:** Live data from Apache Druid with automatic fallback to mock data
- **🔧 Extensible Architecture:** Easy to add new KPIs, charts, or data sources
- **🩺 System Health & Observability:** Alerts & Diagnostics page, health endpoints, and request tracing

---

## Architecture

### System Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Source   │ ─▶│   Backend API    │ ─▶ │   GraphQL API   │──▶│    Frontend     │
│   (Druid)       │    │   (FastAPI)      │    │  (Strawberry)   │    │   (React)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Raw Data       │    │  Data Processing │    │  Schema Types   │    │  UI Components  │
│  (14 columns)   │    │  (Polars)        │    │  (Strawberry)   │    │  (KPI Cards)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

- **Framework:** React 18 + TypeScript
- **UI Library:** Material-UI (MUI) v5
- **Charts:** Apache ECharts (primary) and Nivo for data visualization
- **State Management:** React Context + Custom Hooks + React Query
- **Build Tool:** Vite for fast development
- **Styling:** Material-UI theming with Emotion support
- **API Tools:** Custom hooks (`useApi`, `useDynamicApi`) for all data fetching

### Backend Architecture

- **Framework:** FastAPI (Python)
- **Data Processing:** Polars for high-performance DataFrame operations
- **Validation:** Pandera for DataFrame schema validation
- **Analytics Engine:** Apache Druid for real-time analytics
- **Data Ingestion:** Complete file upload, validation, and Druid integration pipeline
- **Storage:** AWS S3 for file storage with organized naming structure
- **Database:** PostgreSQL for operational data and task tracking
- **API Envelope:** All endpoints return `{ data, error, metadata: { requestId } }`
- **Error Handling:** Global exception handlers for HTTP errors, Polars errors, ValueErrors

### Data Pipeline

- **Analytics Database:** Apache Druid (OLAP, columnar, real-time analytics)
- **Operational Database:** PostgreSQL for task tracking and metadata
- **File Storage:** AWS S3 for uploaded data files with organized structure
- **Integration:** Backend queries Druid for all analytics; fallback to mock data if unavailable
- **Data Model:** Sales, product, branch, and customer analytics with 14 standardized columns
- **Processing:** Polars LazyFrames for efficient data aggregation and transformation
- **Ingestion:** Complete pipeline from file upload to Druid ingestion with validation and monitoring

---

## Getting Started

### Prerequisites

- **Python 3.12+** (backend)
- **Node.js 18+** (frontend)
- **Apache Druid** (analytics DB, port 8888) - optional for mock data mode
- **Docker** (for containerized setup)

### Installation

#### Backend

```bash
# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

#### Frontend

```bash
cd frontend
npm install
```

### Configuration

- **Frontend:** Configure API base URL in `frontend/.env` (defaults to `http://localhost:8000`)
- **Backend:** Configure Druid connection in `backend/.env` or `druid/environment` (optional for mock data mode)
- **Druid:** All Druid config and extensions are under the `druid/` directory

### Running the App

#### Quick Start (Windows)

```bash
# Start backend
./start-backend.ps1

# Start frontend (in new terminal)
./start-frontend.ps1
```

#### Manual Start

```bash
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (in new terminal)
cd frontend
npm run dev
```

#### Docker Compose (Recommended for Full Stack)

```bash
docker compose up -d
```

#### Access the Application

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Reference

### GraphQL Endpoints

The dashboard uses GraphQL (Strawberry) for all data queries with standardized response formats:

#### Core Metrics

- **Revenue Summary:** `revenueSummary` - Total revenue, net sales, gross profit, margins
- **Sales Growth:** `monthlySalesGrowth` - Monthly sales and profit trends
- **Profitability:** `profitabilityByDimension` - Multi-dimensional profitability analysis
- **Customer Analytics:** `topCustomers` - Top customer performance and value
- **Sales Performance:** `salespersonLeaderboard` - Employee performance metrics
- **Product Analytics:** `productAnalytics` - Product performance and profitability

#### Filtering & Parameters

All endpoints support consistent filtering:

- **Date Range:** `startDate`, `endDate` (ISO format)
- **Branch Filtering:** `branch` (specific branch or all)
- **Product Filtering:** `productLine`, `itemGroups` (product categories)
- **Limit Controls:** `n` (number of results)

#### Response Format

```typescript
interface ApiResponse<T> {
  data: T;
  error: string | null;
  metadata: {
    requestId: string;
    usingMockData: boolean;
    timestamp: string;
  };
}
```

### REST Endpoints

- **Health Check:** `/api/health` - API health status
- **Druid Health:** `/api/health/druid` - Druid connectivity status
- **Data Sources:** `/api/druid/datasources` - Available Druid data sources

---

## Data Pipeline

### Data Source Schema

The system processes data from Apache Druid with 14 standardized columns:

| Column          | Type     | Description            | Usage                   |
| --------------- | -------- | ---------------------- | ----------------------- |
| `__time`        | datetime | Transaction timestamp  | Time-based analysis     |
| `ProductLine`   | string   | Product line/category  | Product categorization  |
| `ItemGroup`     | string   | Product group          | Product grouping        |
| `Branch`        | string   | Branch/location        | Branch analysis         |
| `SalesPerson`   | string   | Salesperson name       | Salesperson performance |
| `AcctName`      | string   | Account/customer name  | Customer analysis       |
| `ItemName`      | string   | Product/item name      | Product analysis        |
| `CardName`      | string   | Customer card name     | Customer identification |
| `grossRevenue`  | float    | Gross revenue (KES)    | Revenue calculations    |
| `returnsValue`  | float    | Value of returns (KES) | Returns analysis        |
| `unitsSold`     | float    | Units sold             | Quantity metrics        |
| `unitsReturned` | float    | Units returned         | Returns quantity        |
| `totalCost`     | float    | Total cost (KES)       | Profitability metrics   |
| `lineItemCount` | int      | Line item count        | Transaction metrics     |

### Data Processing

- **Lazy Evaluation:** Polars LazyFrames for efficient processing
- **Standardized Aggregations:** Consistent calculation patterns for all metrics
- **Error Handling:** Graceful handling of empty datasets and calculation errors
- **Performance Optimization:** Optimized grouping and aggregation strategies

---

## Metric Standardization

### Standardized Metric Names

All metrics use consistent `camelCase` naming conventions:

```typescript
export const METRIC_NAMES = {
  TOTAL_REVENUE: "totalRevenue",
  NET_SALES: "netSales",
  GROSS_PROFIT: "grossProfit",
  GROSS_PROFIT_MARGIN: "grossProfitMargin",
  TOTAL_TRANSACTIONS: "totalTransactions",
  UNIQUE_PRODUCTS: "uniqueProducts",
  UNIQUE_BRANCHES: "uniqueBranches",
  UNIQUE_EMPLOYEES: "uniqueEmployees",
} as const;
```

### Metric Categories

- **Monetary Metrics:** Revenue, sales, profit, costs (formatted as KSh)
- **Percentage Metrics:** Margins, growth rates (formatted as percentages)
- **Count Metrics:** Transactions, products, customers (formatted with locale)

### Automatic Formatting

The system automatically formats metrics based on their type:

- **Monetary:** KSh abbreviation (e.g., "1.2M" for 1,200,000)
- **Percentage:** Decimal precision with % symbol
- **Count:** Locale-aware number formatting

---

## Development Guidelines

### Code Standards

- **TypeScript:** Strict typing for all frontend components
- **Python:** Type hints and proper error handling for backend
- **Naming:** Use standardized metric names and camelCase conventions
- **Error Handling:** Implement unified error states and user-friendly messages

### Adding New Features

1. **Backend:** Add endpoint in `backend/api/kpi_routes.py`
2. **GraphQL:** Update schema in `backend/schema/`
3. **Frontend:** Create component and add to appropriate page
4. **Testing:** Test with both mock and real data scenarios

### Performance Considerations

- **Lazy Loading:** Use Polars LazyFrames for efficient data processing
- **Caching:** Implement React Query caching for API responses
- **Optimization:** Combine similar aggregations where possible
- **Monitoring:** Use built-in health endpoints and logging

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

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
