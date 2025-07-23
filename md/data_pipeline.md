# Data Pipeline: From Druid to Dashboard

This document provides an up-to-date, end-to-end overview of the data flow within the Sales Analytics Dashboard. It traces the journey of data from its source in Apache Druid, through the backend processing layer, to its final visualization on the frontend.

---

## Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Data Source"
        A[Apache Druid: sales_analytics]
    end

    subgraph "Backend (FastAPI)"
        B[1. Data Fetching Service<br>(sales_data.py, kpi_service.py)]
        C[2. Druid SQL & Polars Processing]
        D[3. KPI Calculation Service<br>(kpi_service.py)]
        E[4. API Layer<br>(GraphQL Schema)]
    end

    subgraph "Frontend (React)"
        F[5. GraphQL Client & Codegen<br>(graphql-request, .generated.ts)]
        G[6. Data Fetching Hooks<br>(React Query)]
        H[7. UI Components<br>(Nivo/ECharts, Tables, KPIs)]
    end

    A -- Druid SQL/JSON Query --> B
    B -- Aggregated Data --> C
    C -- DataFrame/Dict --> D
    D -- Aggregated Insights --> E
    E -- GraphQL API (/graphql) --> F
    F -- Typed Hooks --> G
    G -- Cached Data, Loading/Error States --> H
```

---

## Stage 1: Data Source (Apache Druid)

-   **Source of Truth:** All analytical data resides in **Apache Druid**.
-   **Datasource:** The primary table is `sales_analytics`.
-   **Schema:** See [druid_pipeline.md](druid_pipeline.md) for details.

## Stage 2: Backend Data Fetching (Service Layer)

-   **Initiation:** API requests trigger Druid SQL queries for heavy aggregations (e.g., monthly sales growth) or scan queries for raw data.
-   **Service:** `backend/services/sales_data.py` and `kpi_service.py` contain the main logic.
-   **Mechanism:**
    - For time-series and summary KPIs, Druid SQL is used for fast, scalable aggregation.
    - For more complex or filtered queries, Polars is used for in-memory processing.
-   **Output:** Aggregated results are returned as dicts or DataFrames.

## Stage 3: Backend Data Processing & Transformation (KPI Service)

-   **Input:** Aggregated data from Druid SQL or Polars DataFrame.
-   **Service:** `kpi_service.py` contains business logic for all KPIs.
-   **Mechanism:**
    - Uses Druid SQL for most aggregations (e.g., monthly, leaderboard, profitability).
    - Falls back to Polars for advanced filtering or legacy endpoints.
-   **Output:** Clean, aggregated dicts for API response.

## Stage 4: Backend API Layer (GraphQL)

-   **Primary Interface:** The GraphQL API (`/graphql`) is the main contract for the frontend. REST endpoints are deprecated.
-   **Schema Definition:** See `backend/schema/schema.py`.
-   **Resolvers:** Call KPI service functions and return camelCase fields (auto-converted by Strawberry).
-   **Response Envelope:** All responses use `{ data, error, metadata }`.
-   **Reference:** See [api.md](api.md), [frontend_mapping.md](frontend_mapping.md).

## Stage 5: Frontend Data Fetching (GraphQL Client & Codegen)

-   **Contract Synchronization:** GraphQL Code Generator produces TypeScript types and hooks from the backend schema.
-   **Client:** Uses `graphql-request` and React Query for all data fetching.

## Stage 6: Frontend State Management (React Query)

-   **Hooks:** All data is fetched via generated hooks and managed by React Query.
-   **Global Filters:** Provided by `FilterContext`.
-   **Persistence:** Uses localStorage for offline support.
-   **Reference:** See [data_loading.md](data_loading.md).

## Stage 7: Frontend Rendering (React Components)

-   **Visualization:** UI components use Nivo and ECharts for charts, Material-UI for layout, and standardized error/loading states.
-   **Conditional Rendering:** Skeletons for loading, error banners for failures, and empty states as needed.

---

**Note:**
- All API contracts and data flows are now documented in [api.md](api.md) and [frontend_mapping.md](frontend_mapping.md).
- This pipeline ensures high performance, robust error handling, and type safety from Druid to the dashboard.