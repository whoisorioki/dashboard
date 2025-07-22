# Data Pipeline: From Druid to Dashboard

This document provides a comprehensive, end-to-end overview of the data flow within the Sales Analytics Dashboard. It traces the journey of data from its source in Apache Druid, through the backend processing layer, to its final visualization on the frontend.

---

## Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Data Source"
        A[Apache Druid: sales_analytics]
    end

    subgraph "Backend (FastAPI)"
        B[1. Data Fetching Service<br>(sales_data.py)]
        C[2. Data Processing Layer<br>(Polars DataFrame)]
        D[3. KPI Calculation Service<br>(kpi_service.py)]
        E[4. API Layer<br>(GraphQL Schema)]
    end

    subgraph "Frontend (React)"
        F[5. GraphQL Client & Codegen<br>(graphql-request, .generated.ts)]
        G[6. Data Fetching Hooks<br>(React Query)]
        H[7. UI Components<br>(Charts, Tables, KPIs)]
    end

    A -- Druid SQL/JSON Query --> B
    B -- Raw Data --> C
    C -- DataFrame --> D
    D -- Aggregated Insights --> E
    E -- GraphQL API (/graphql) --> F
    F -- Typed Hooks --> G
    G -- Cached Data, Loading/Error States --> H
```

---

## Stage 1: Data Source (Apache Druid)

-   **Source of Truth:** All analytical data resides in an **Apache Druid** cluster.
-   **Datasource:** The primary table is `sales_analytics`.
-   **Schema:** This datasource contains raw, granular sales records with dimensions (like `Branch`, `SalesPerson`, `ProductLine`) and metrics (like `grossRevenue`, `totalCost`, `unitsSold`). The schema is defined during the ingestion process.
-   **Reference:** `md/druid_pipeline.md`

## Stage 2: Backend Data Fetching (Service Layer)

-   **Initiation:** When an API request hits the backend, the first step is to retrieve data from Druid.
-   **Service:** The `backend/services/sales_data.py` file contains the `fetch_sales_data` function.
-   **Mechanism:** This function constructs a native JSON-over-HTTP query (a `scan` query) and sends it to the Druid Broker endpoint (`localhost:8888`). It applies any filters passed from the API layer, such as date ranges, branches, or product lines.
-   **Output:** The raw JSON response from Druid is immediately converted into a **Polars DataFrame**. This high-performance DataFrame is the standard data structure for all subsequent processing within the backend.

## Stage 3: Backend Data Processing & Transformation (KPI Service)

-   **Input:** The raw Polars DataFrame from the previous stage.
-   **Service:** The `backend/services/kpi_service.py` file contains a suite of functions, each responsible for a specific business calculation (e.g., `calculate_monthly_sales_growth`, `get_sales_performance`).
-   **Mechanism:** These functions use the Polars library's powerful and memory-efficient lazy evaluation engine to perform complex aggregations, groupings, and calculations on the DataFrame. For example, it might group by `SalesPerson` and aggregate `grossRevenue` to create a leaderboard.
-   **Data Validation:** Before and after processing, **Pandera** schemas can be applied to the DataFrames to enforce data quality, ensuring that columns have the correct data types and that critical values are not null.
-   **Output:** The output is a clean, aggregated Polars DataFrame or a dictionary containing the specific insights required by an API endpoint.

## Stage 4: Backend API Layer (GraphQL)

-   **Philosophy:** The project follows a **GraphQL-first** approach. While a legacy REST API exists, the primary interface for the frontend is the GraphQL endpoint.
-   **Schema Definition:** The `backend/schema/schema.py` file defines the entire GraphQL API. It uses the `strawberry` library to create types (e.g., `SalesPerformance`, `RevenueSummary`) and resolvers.
-   **Resolvers:** Each field in the GraphQL schema is backed by a resolver function. These resolvers orchestrate the calls to the KPI service functions from Stage 3.
-   **Case Conversion:** The `strawberry` library is configured to automatically convert the backend's `snake_case` field names (e.g., `total_sales`) to the API's `camelCase` standard (e.g., `totalSales`), ensuring a consistent contract for the frontend.
-   **Response Envelope:** All data is wrapped in a standardized envelope, providing consistent `data`, `error`, and `metadata` fields for every response.
-   **Reference:** `md/api.md`, `md/log.md`

## Stage 5: Frontend Data Fetching (GraphQL Client & Codegen)

-   **Contract Synchronization:** The project uses **GraphQL Code Generator** to automatically generate TypeScript types and data-fetching hooks directly from the backend's GraphQL schema. This guarantees end-to-end type safety.
-   **Generated Files:** The output is typically a file like `queries/salesPageData.generated.ts`, which contains typed hooks (e.g., `useSalesPageDataQuery`).
-   **Client:** A lightweight `graphql-request` client is used to send the actual `POST` requests to the `/graphql` endpoint.

## Stage 6: Frontend State Management (React Query)

-   **Data Hooks:** The page components (e.g., `frontend/src/pages/Sales.tsx`) call the generated hooks from Stage 5.
-   **State Management:** These hooks are built on top of **React Query (`@tanstack/react-query`)**. React Query is responsible for:
    -   **Caching:** Storing the results of API calls to avoid redundant requests.
    -   **State Tracking:** Managing `isLoading`, `isError`, and `isSuccess` states automatically.
    -   **Background Refetching:** Keeping data fresh without blocking the UI.
    -   **Persistence:** The setup includes persistence to `localStorage`, allowing the dashboard to function offline with cached data.
-   **Global Filters:** A React Context (`FilterContext`) provides global filters (like date range and branch) to the data-fetching hooks. When a filter changes, React Query automatically refetches the relevant data.
-   **Reference:** `md/data_loading.md`

## Stage 7: Frontend Rendering (React Components)

-   **Data Consumption:** The UI components receive the data, loading state, and error state from the React Query hooks.
-   **Conditional Rendering:**
    -   If `isLoading` is true, a `CircularProgress` or skeleton loader is displayed.
    -   If `isError` is true, a standardized `ChartEmptyState` component is shown with an error message.
    -   If data is available, it's passed as props to visualization components (e.g., `MonthlySalesTrendChart`, tables).
-   **Visualization:** The components use libraries like **Apache ECharts** and **Material-UI** to render the final, interactive analytics for the user.

---

This multi-layered pipeline ensures a clear separation of concerns, high performance through Polars and React Query, and robust type-safety from the database to the display.