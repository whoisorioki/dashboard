Sales Analytics Dashboard ![MIT License](https://img.shields.io/badge/license-MIT-green.svg)

> **A modern, robust, and fully localized sales analytics platform for Kenyan businesses built with React, FastAPI, and Apache Druid.**

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
  - [Backend](#backend-1)
  - [Analytics Database](#analytics-database)
  - [Infrastructure \& Observability](#infrastructure--observability)
  - [Data Flow](#data-flow)

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

- **Framework:** React 18 + TypeScript

- **UI Library:** Material-UI (MUI) v5

- **Charts:** Apache ECharts (primary) and Nivo for data visualization

- **State Management:** React Context + Custom Hooks + React Query

- **Build Tool:** Vite for fast development

- **Styling:** Material-UI theming with Emotion support

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
