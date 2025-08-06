# Data Flow and Transformation Report: Druid → Polars → API → Frontend

## 1. Data Intake from Druid

### 1.1 Ingestion Script (`backend/scripts/ingest_data.py`)
- **Source:** CSV file (`sales_data.csv`)
- **Druid Datasource:** `sales_analytics`
- **Dimensions:**
  - ProductLine
  - ItemGroup
  - Branch
  - SalesPerson
  - AcctName
  - ItemName
  - CardName
- **Metrics:**
  - grossRevenue (doublesum)
  - returnsValue (doublesum)
  - unitsSold (doublesum)
  - unitsReturned (doublesum)
  - totalCost (doublesum)
  - lineItemCount (longsum)
- **Time Column:** `__time` (datetime)

### 1.2 Druid Schema (as used in backend and frontend)
```ts
interface DruidSalesData {
  __time: string;
  ProductLine: string;
  ItemGroup: string;
  Branch: string;
  SalesPerson: string;
  AcctName: string;
  ItemName: string;
  CardName: string;
  grossRevenue: number;
  returnsValue: number;
  unitsSold: number;
  unitsReturned: number;
  totalCost: number;
  lineItemCount: number;
}
```

## 2. Backend Data Processing (Druid SQL & Polars)

### 2.1 Data Fetching (`backend/services/sales_data.py`)
- **Function:** `fetch_sales_data`
  - Fetches data from Druid using Druid SQL for most aggregations, or scan query for raw data.
  - Filters by date, item names, sales persons, branch names.
  - Returns a Polars DataFrame or dict with the Druid schema.
  - If Druid is unavailable or mock data is requested, generates mock data with the same schema.
  - Handles empty results by returning an empty DataFrame with the correct schema.
  - **Error Handling:**
    - Raises HTTP 500 if Druid connection/query fails.
    - Logs warnings for all-NaN or missing `grossRevenue`.
    - Fallback to mock data if Druid fails (see API layer below).

### 2.2 Data Transformation (KPIs, Analytics)
- **KPI Calculation Functions:** (`backend/services/kpi_service.py`)
  - `calculate_monthly_sales_growth`: Returns array of `{date: string, sales: number}`.
  - `calculate_sales_target_attainment`: Returns `{totalSales: number, attainmentPercentage: number}`.
  - `get_product_performance`: Returns array of `{product: string, sales: number}`.
  - `create_branch_product_heatmap_data`: Returns DataFrame of `{branch: string, product: string, sales: number}`.
  - `calculate_branch_performance`: Returns DataFrame of branch metrics.
  - `get_sales_performance`: Returns DataFrame of salesperson metrics.
  - `get_product_analytics`: Returns DataFrame of product analytics.
  - `calculate_revenue_summary`: Returns revenue summary object.
- **All functions handle empty DataFrames and NaN/infinite values robustly.**
- **Most aggregations now use Druid SQL for performance and scalability.**

## 3. API Layer (GraphQL)

### 3.1 Endpoints (`backend/schema/schema.py`)
- **KPIs:** Exposed via GraphQL endpoint `/graphql` (e.g., `monthlySalesGrowth`, `salesTargetAttainment`, `productPerformance`, etc.)
- **Raw Sales Data:** Exposed via GraphQL queries.
- **Data Range:** Exposed via GraphQL queries.
- **Health:** Exposed via GraphQL queries.
- **Response Structure:**
  - All endpoints return `{ data, error, metadata }`.
- **Error/Fallback Handling:**
  - If Druid fails, endpoints log a warning and retry with mock data.
  - If both Druid and mock fail, propagate error to frontend.
  - Filtering for mock/test data is available via `mockData` flag.

## 4. Frontend Data Consumption

### 4.1 API Integration
- **API Endpoints:** Defined in `frontend/src/constants/apiEndpoints.ts`.
- **Data Fetching:**
  - All data fetching is via generated GraphQL hooks and codegen types.
  - Query params are built from filter context (date, branch, product line, etc.).
  - If `usingMockData` is present in response, frontend can display a banner or warning.
- **Types/Interfaces:** Defined in `frontend/src/types/graphql.ts` (see Druid schema above and below for KPIs).

### 4.2 Data Structures (Frontend)
- **MonthlySalesGrowthData:** `{ date: string, sales: number }`
- **TargetAttainmentData:** `{ attainmentPercentage: number, totalSales: number }`
- **ProductPerformanceData:** `{ product: string, sales: number }`
- **BranchProductHeatmapData:** `{ branch: string, product: string, sales: number }`
- **BranchPerformanceData:** `{ branch: string, totalSales: number, transactionCount: number, averageSale: number, uniqueCustomers: number, uniqueProducts: number }`
- **SalesPerformanceData:** `{ salesPerson: string, totalSales: number, transactionCount: number, averageSale: number, uniqueBranches: number, uniqueProducts: number }`
- **ProductAnalyticsData:** `{ itemName: string, productLine: string, itemGroup: string, totalSales: number, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }`
- **RevenueSummaryData:** `{ totalRevenue: number, totalTransactions: number, averageTransaction: number, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number }`

## 4a. Frontend State Management, Hooks, and Data Caching

### 4a.1 State Management with React Context
- **FilterContext:**
  - Manages global filter state (date range, selected branch, product line, sales target).
  - Provides filter values and setters to all components via React Context API.
  - Persists filter state to localStorage for session continuity.
- **DataModeContext:**
  - Controls whether the app is in mock data mode or live data mode.
  - Used by hooks to determine if mock data should be requested from the backend.
- **LocalFilterResetContext:**
  - Allows components to register reset handlers for local filter state (e.g., table sorting, category selection).

### 4a.2 Data Fetching and Caching with React Query and Custom Hooks
- **Custom Hooks:**
  - All data fetching is via generated GraphQL hooks and codegen types.
  - They build API URLs with query params from context and handle the `usingMockData` flag.
  - All data fetching is centralized through these hooks for consistency.
- **React Query (`useQuery`):**
  - Handles caching, background refetching, and stale data management.
  - Each query is keyed by endpoint, params, and data mode, ensuring cache separation for different filter states.
  - **Caching Strategy:**
    - `staleTime`: 5 minutes (data is considered fresh for 5 minutes).
    - `cacheTime`: 30 minutes (data remains in cache for 30 minutes after last use).
  - **Refetching:**
    - Data is automatically refetched when filters change or when manually triggered.
    - Components can call `refetch` to force an update.
- **Mutation Hooks:**
  - `useApiMutation` is used for POST/PUT/DELETE requests, also leveraging React Query for cache invalidation.

### 4a.3 Propagation and Usage of State
- **Filter State:**
  - All dashboard and analytics components consume filter state from `FilterContext`.
  - Changing a filter (e.g., date range, branch) triggers new API calls and updates all dependent components.
- **Global State:**
  - Context providers are placed at the top level (e.g., in `App.tsx`), ensuring all pages/components have access.
- **Local State:**
  - Components may use local state for UI-specific controls (e.g., table sorting, selected category), but reset via context when global filters change.

### 4a.4 Error and Loading State Handling
- **Loading States:**
  - All hooks expose `isLoading` which is used to show spinners or skeletons in the UI.
- **Error States:**
  - All hooks expose `error` which is used to show error banners or fallback UI.
  - Errors from the backend (e.g., Druid unavailable) are surfaced to the user.
- **Mock Data Banner:**
  - If `usingMockData` is true, a banner is shown to indicate the data is not live.

### 4a.5 Optimizations and Best Practices
- **Centralized API logic and consistent query keys prevent duplicate requests and stale data.**
- **React Query's cache ensures that repeated requests for the same filters are fast and do not hit the backend unnecessarily.**
- **Context-based state management ensures all components are always in sync with global filters and data mode.**

## 5. Error Handling & Fallbacks
- **Backend:**
  - Logs and warnings for Druid failures, NaN/infinite values, and missing columns.
  - Fallback to mock data if Druid is unavailable.
  - Returns empty DataFrames/arrays with correct schema if no data.
- **Frontend:**
  - Displays loading and error states for API failures.
  - Can show a banner if mock data is being used (`usingMockData`).
  - Filters out mock/test data if `ignoreMockData` is set.

## 6. Inconsistencies & Issues Found
- **Schema Consistency:**
  - Druid, backend, and frontend schemas are generally consistent.
  - All contracts are enforced via codegen and mapping docs.
- **Error Handling:**
  - Some error messages are only logged, not returned to the frontend (could improve user feedback).
  - Filtering for mock/test data is basic and may miss edge cases.
- **API Response Structure:**
  - All endpoints return `{ data, error, metadata }`.
- **Frontend Types:**
  - All frontend types use camelCase and are generated from the GraphQL schema.

## 7. Recommendations
- **Standardize all schemas and naming conventions across Druid, backend, and frontend.**
- **Ensure all endpoints return a consistent response structure.**
- **Improve error propagation to the frontend for better user feedback.**
- **Expand mock/test data filtering to catch more edge cases.**
- **Document all data contracts and keep them in sync between backend and frontend.**
- **All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md].** 