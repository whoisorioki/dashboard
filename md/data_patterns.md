# Data Flow & Data Patterns Documentation

## Overview
This document describes the data flow, data pipeline, and data-fetching patterns in the Sales Analytics Dashboard system, from frontend to backend to Druid. All data fetching is now via GraphQL and Druid SQL, with REST and Recharts deprecated. All contracts are enforced via codegen and mapping docs.

---

## 1. Data Flow: End-to-End Pipeline

### **Frontend (React)**
- **Data Fetching:**
  - Uses generated GraphQL hooks (e.g., `useMonthlySalesGrowthQuery`, `useProductPerformanceQuery`) for each dashboard component.
  - Filters (date range, branch, product line) are passed as query params to each API call.
  - **As of 2024, all global filter state is managed by Zustand (`filterStore.ts`), including new `itemGroups` filter.**
  - **All data-fetching hooks construct their queryKey from the Zustand filterStore, ensuring optimal caching and minimal re-renders.**
  - **Filter state is persisted to localStorage for seamless reloads.**
  - Data is fetched per-component, but batching via consolidated GraphQL queries is in progress for some pages.
  - React Query is used for caching, loading, and error states.

- **Data Flow Example:**
  1. User selects filters (date range, branch, product line).
  2. Each chart/table component triggers its own GraphQL query with those filters.
  3. Data is returned, formatted, and rendered in the component.

- **Error Handling:**
  - If any API call fails, the corresponding component shows an error state.
  - If the backend (Druid) is down, the dashboard may fall back to mock data or show a global error.

### **Backend (FastAPI + GraphQL)**
- **API Structure:**
  - All KPIs and analytics are exposed via GraphQL endpoint `/graphql`.
  - Endpoints accept query parameters for filters.
  - Each endpoint queries Druid (or mock data) and returns a JSON response.
  - The backend acts as an API gateway, translating GraphQL calls to Druid SQL queries.

- **Data Processing:**
  - Most aggregation is done in Druid SQL; Polars is used for advanced filtering or legacy endpoints.
  - All contracts are enforced via codegen and mapping docs.

### **Druid (Analytics DB)**
- **Role:**
  - Stores all sales data in the `sales_analytics` datasource.
  - Responds to SQL queries from the backend, returning raw or aggregated data as requested.

---

## 2. Data Patterns & Inconsistencies

### **Current Patterns**
- **Per-Component Fetching:** Each dashboard/chart/table component fetches its own data, but batching via consolidated GraphQL queries is in progress.
- **GraphQL Endpoint Granularity:** Endpoints are designed per-KPI or per-chart, but can be consolidated for dashboard views.
- **Redundant Requests:** Multiple components may trigger similar API calls with the same filters, but batching is being implemented.
- **Error Handling:** Errors are handled per-component, but global error boundaries are recommended for consistency.

### **Business Challenge Alignment**
- The current approach maximizes the use of available sales data for Phase 1 analysis (who/what/how much), and is being optimized for:
  - Efficient, holistic "State of the Business" dashboards.
  - Rapid iteration on new business questions (via GraphQL schema updates).
  - Minimizing backend and Druid load as the dashboard grows.

---

## 3. Recommendations for Improvement

### **A. Move Toward Consolidated GraphQL Queries**
- **Single Endpoint:** Use consolidated GraphQL queries to allow the frontend to request exactly the data it needs for each dashboard view.
- **Batching:** Fetch all dashboard data in a single query, reducing redundant requests and round-trips.
- **Dynamic Queries:** Enable rapid iteration on new business questions without backend changes.

### **B. Backend Aggregation & Caching**
- Aggregate and join data in the backend where possible, so the frontend receives ready-to-use business insights.
- Implement caching for expensive or frequently-requested queries.

### **C. Endpoint Consolidation**
- For GraphQL, consider consolidating queries to serve broader dashboard views, not just individual KPIs.

### **D. Global Error Handling**
- Implement a global error boundary or notification system for consistent user experience.

---

## 4. Summary Table

| Area               | Current Pattern                  | Recommendation                  |
| ------------------ | -------------------------------- | ------------------------------- |
| Data Fetching      | Per-component, per-endpoint      | Single query per dashboard      |
| Over-fetching      | Yes (broad endpoints)            | No (request only needed fields) |
| Under-fetching     | Yes (multiple endpoints needed)  | No (fetch all needed at once)   |
| Redundant Requests | Yes (similar data fetched often) | No (batch in one query)         |
| Error Handling     | Per-component                    | Global   |

---

## 5. Filtering Architecture & Best Practices (2024 Update)

- **Global Filter Bar:** Standardized, appears on all main pages. Contains Date Range, Branch, Product Line, and Item Group filters (all multi-select, searchable).
- **State Management:** Global filter state managed by Zustand (`filterStore.ts`), not React Context. State shape: `{ startDate, endDate, selectedBranches, selectedProductLines, selectedItemGroups }`.
- **Data Fetching:** All GraphQL hooks use queryKey derived from filterStore. When a filter changes, a new queryKey triggers React Query to check cache or fetch new data.
- **Caching:** Cached data is returned instantly for previously used filter combinations. Filter state is persisted to localStorage.
- **UI/UX:** Active filters shown as chips/tags, with individual removal and a reset button. Local (page-specific) filters do not affect global state.
- **Field Distinction:** ProductLine = high-level brand/category; ItemGroup = sub-category (e.g., "Parts", "Units"). Both are first-class filters in all relevant queries and components.

---

## 5. Conclusion

The current data pipeline is functional and leverages the available sales data for actionable insights, but is being optimized for scalability, efficiency, and rapid business iteration. All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md]. 