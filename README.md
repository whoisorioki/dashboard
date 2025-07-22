Sales Analytics Dashboard ![MIT License](https://img.shields.io/badge/license-MIT-green.svg)

> **A modern, robust, and fully localized sales analytics platform for CARGEN built with React, FastAPI, and Apache Druid.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Configuration](#configuration)
  - [Running the App](#running-the-app)
    - [Quick Start (Windows)](#quick-start-windows)
    - [Manual Start](#manual-start)
    - [Docker Compose (Recommended for Full Stack)](#docker-compose-recommended-for-full-stack)
    - [Access the Application](#access-the-application)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Architecture](#architecture)
  - [Frontend](#frontend-1)
  - [Architecture Document](#architecture-document)
  - [Backend](#backend-1)
  - [Analytics Database](#analytics-database)
  - [Infrastructure \& Observability](#infrastructure--observability)
  - [Data Flow](#data-flow)
- [System \& Integrations Overview](#system--integrations-overview)
  - [1. System Architecture \& Data Flow](#1-system-architecture--data-flow)
  - [2. API \& Integration Patterns](#2-api--integration-patterns)
  - [3. Best Practices \& Operational Checklists](#3-best-practices--operational-checklists)
  - [4. Business Alignment \& Roadmap](#4-business-alignment--roadmap)
  - [5. Troubleshooting \& Support](#5-troubleshooting--support)
  - [6. Key Integration Points Summary](#6-key-integration-points-summary)
- [Localization](#localization)
- [Error Handling, API Envelope \& Robustness](#error-handling-api-envelope--robustness)
- [Tools Used](#tools-used)
  - [Frontend](#frontend-2)
  - [Backend](#backend-2)
  - [Analytics \& Infrastructure](#analytics--infrastructure)
  - [Observability \& Health](#observability--health)
- [Contributing](#contributing)
  - [Development Guidelines](#development-guidelines)
- [License](#license)
- [Authors \& Acknowledgments](#authors--acknowledgments)
- [FAQ](#faq)

---

## Overview

The Sales Analytics Dashboard is a full-stack analytics platform built with React (Vite, Material-UI) and FastAPI (Python, Druid, Polars). It provides real-time and historical sales insights, interactive visualizations, and robust KPI tracking, fully localized for the Kenyan market with all monetary values in Kenyan Shillings (KSh).

The platform supports both real-time data from Apache Druid and comprehensive mock data for development and testing scenarios. It is designed for reliability, observability, and user-friendly error handling.

---

## Features

- **📊 Modern Analytics UI:** Material-UI cards, charts, and controls with unified error/loading/empty states

- **📅 Smart Date Range Picker:** Modern, validated date range picker with Kenyan business context

- **🎯 Comprehensive KPIs:** Top Customers, Margin Trends, Profitability by Dimension, Returns Analysis, and more

- **🔄 Robust Error Handling:** Unified ChartEmptyState for all error/empty scenarios with user-friendly messages and request IDs

- **🧪 Mock Data Support:** Toggle between mock/real data with clear visual indicators

- **📱 Responsive Design:** Optimized for desktop and mobile devices

- **⚡ Real-time Updates:** Live data from Apache Druid with automatic fallback to mock data

- **🔧 Extensible Architecture:** Easy to add new KPIs, charts, or data sources

- **🩺 System Health & Observability:** Alerts & Diagnostics page, health endpoints, and request tracing

---

## Screenshots

> _Add screenshots or GIFs here to showcase the dashboard UI, charts, and key features._

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

## Usage

1. **Welcome Tour:** New users get an interactive tour of the dashboard features

2. **Date Range Selection:** Use the global date range picker to filter all analytics

3. **Branch & Product Filtering:** Filter data by specific branches and product lines

4. **Mock Data Toggle:** Switch between real and mock data for testing

5. **Real-time Analytics:** View live KPIs, charts, and performance metrics

6. **Export & Share:** Use the floating action menu for data export and sharing

7. **Alerts & Diagnostics:** Monitor system health and troubleshoot issues in real time

---

## API Reference

- **Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

- **Key Endpoints:**

- `/api/kpis/monthly-sales-growth` - Monthly sales growth trends

- `/api/kpis/sales-target-attainment` - Sales target attainment

- `/api/kpis/product-performance` - Top performing products

- `/api/kpis/branch-product-heatmap` - Product heatmap by branch

- `/api/kpis/branch-performance` - Branch performance metrics

- `/api/kpis/branch-list` - List of branches

- `/api/kpis/branch-growth` - Branch growth trends

- `/api/kpis/sales-performance` - Salesforce performance

- `/api/kpis/product-analytics` - Product analytics

- `/api/kpis/revenue-summary` - Revenue summary

- `/api/kpis/customer-value` - Customer value analysis

- `/api/kpis/employee-performance` - Employee performance

- `/api/kpis/top-customers` - Top customer analysis

- `/api/kpis/margin-trends` - Profitability trends

- `/api/kpis/profitability-by-dimension` - Multi-dimensional profitability

- `/api/kpis/returns-analysis` - Returns and refunds analysis

- `/api/health` - API health

- `/api/health/druid` - Druid connectivity

- `/api/druid/datasources` - Druid data sources

---

## Architecture

### Frontend

For a detailed breakdown of the system architecture, please see the [ARCHITECTURE.md](ARCHITECTURE.md) file.

---

- **Framework:** React 18 + TypeScript

- **UI Library:** Material-UI (MUI) v5

- **Charts:** Recharts for data visualization

- **State Management:** React Context + Custom Hooks + React Query

- **Build Tool:** Vite for fast development

- **Styling:** Emotion (CSS-in-JS)

- **API Tools:**

- Custom hooks (`useApi`, `useDynamicApi`) for all data fetching

- Unified error handling and observability

- Error boundaries and request ID tracing

### Backend

- **Framework:** FastAPI (Python)

- **Data Processing:** Polars for high-performance DataFrame operations

- **Validation:** Pandera for DataFrame schema validation

- **Analytics Engine:** Apache Druid for real-time analytics

- **API Envelope:** All endpoints return `{ data, error, metadata: { requestId } }`

- **Error Handling:** Global exception handlers for HTTP errors, Polars errors, ValueErrors

- **Observability:**

- Logging of all API requests, errors, and Druid query attempts

- Request IDs for traceability

- Health endpoints for API and Druid

- **Retry Logic:** Exponential backoff for Druid queries (1s, 2s, 4s, up to 3 attempts)

- **Mock Data:** Realistic mock data fallback for all endpoints

### Analytics Database

- **Database:** Apache Druid (OLAP, columnar, real-time analytics)

- **Integration:** Backend queries Druid for all analytics; fallback to mock data if Druid is unavailable

- **Data Model:** Sales, product, branch, and customer analytics

- **Config:** All Druid config and extensions are under the `druid/` directory

### Infrastructure & Observability

- **Containerization:** Docker Compose for orchestrating FastAPI, Druid (multiple services), and Zookeeper

- **Volumes:** Persistent storage for Druid segments and metadata

- **Config Management:** Environment variables and config files in the `druid/` directory

- **System Health:**

- Alerts & Diagnostics page in the frontend

- Health endpoints in the backend

- Logs and request tracing for all errors and API calls

### Data Flow

1. Frontend requests data via React hooks and custom API tools

2. Backend processes requests with Polars and validates with Pandera

3. Real-time queries to Apache Druid (with retry logic)

4. Automatic fallback to realistic mock data if Druid unavailable

5. Data returned in a consistent envelope format with `using_mock_data` flag and request ID

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

## Error Handling, API Envelope & Robustness

- **Unified Error States:** ChartEmptyState and error boundaries for consistent error handling

- **API Envelope:** All API responses are wrapped in `{ data, error, metadata: { requestId } }` for traceability and user-friendly errors

- **Defensive Programming:** All data props are arrays to prevent runtime errors

- **Graceful Degradation:** Automatic fallback to mock data when Druid unavailable

- **User-Friendly Messages:** Clear, actionable error messages with request IDs

- **Loading States:** Skeleton components and loading indicators

- **Observability:** Logs, request IDs, and health endpoints for full-stack diagnostics

---

## Tools Used

### Frontend

- **React 18** (UI framework)

- **TypeScript** (type safety)

- **Material-UI (MUI) v5** (UI components)

- **Recharts** (charts and data visualization)

- **React Query** (data fetching and caching)

- **Emotion** (CSS-in-JS styling)

- **Vite** (build tool)

- **Custom API hooks** (`useApi`, `useDynamicApi`)

- **Error Boundaries** (robust error handling)

### Backend

- **FastAPI** (Python web framework)

- **Polars** (high-performance DataFrame library)

- **Pandera** (DataFrame schema validation)

- **Apache Druid** (analytics database)

- **Uvicorn** (ASGI server)

- **Logging** (Python logging module)

- **Docker Compose** (container orchestration)

- **Requests** (HTTP client for backend health checks)

### Analytics & Infrastructure

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
