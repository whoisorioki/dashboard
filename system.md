# Sales Analytics Dashboard: System Design & Architecture


## 1. Introduction & Business Goal

This document outlines the system design and architecture of the Sales Analytics Dashboard, a full-stack application engineered to provide real-time, interactive analytics for a Kenyan business.

**Primary Business Goal:** The primary objective is to transform raw sales data into actionable insights. This enables data-driven decision-making to improve sales performance, enhance profitability, and optimize operational efficiency. The project is divided into two strategic phases.

### Phase 1 Goal: Maximize Value from Existing Sales Data

The immediate goal is to build a "State of the Business" analysis using the current sales data. This demonstrates analytical capability and establishes a performance baseline that highlights what's missing.

**Key Business Questions (Phase 1):** The dashboard must provide clear, data-backed answers to the following:

1.  **Salesperson Performance:**
    -   Who are our most profitable salespeople, ranked by Gross Profit, not just sales volume?
    -   What is the product mix for each salesperson?
    -   Who excels at selling high-margin products (i.e., has the highest average profit margin per sale)?

2.  **Product & Product Line Profitability:**
    -   What are our most profitable products and product lines?
    -   Are sales and marketing efforts aligned with our most profitable offerings?

3.  **Branch Performance:**
    -   How are different branches performing against each other and over time in terms of sales and profitability?

4.  **Customer Profile:**
    -   What is the profile of our most valuable customers based on total sales and gross profit? This will help build an initial Ideal Customer Profile (ICP).

---

## 2. System Architecture

The system follows a classic three-tier architecture, ensuring a clear separation of concerns between presentation, logic, and data storage.

```
Frontend (React/Vite) ←-- (API Calls) --→ Backend (FastAPI) ←-- (Druid SQL) --→ Database (Apache Druid)
      :5173                                  :8000                           :8888 (Router)
```

-   **Frontend**: A modern SPA built with React and Vite. It is responsible for the user interface, data visualization, and all user interactions. **All analytics pages use a reusable `DataStateWrapper` for unified loading, error, and empty states. Spacing and layout are standardized using Material-UI's `Box` and `Grid`.**
-   **Backend**: A high-performance API server built with FastAPI. It serves as an API gateway and business logic layer, processing requests, querying the database, performing complex calculations, and serving structured data to the frontend. **All GraphQL resolvers now fetch real data from Druid, and argument names/types are kept in sync with frontend queries. Redis cache initialization is conditional on environment.**
-   **Database**: An Apache Druid cluster, a high-performance, real-time analytics database optimized for fast slice-and-dice queries on large datasets.

---

## 3. Technology Stack

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
