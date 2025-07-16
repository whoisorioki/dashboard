# Data Flow & Data Patterns Documentation

## Overview
This document describes the data flow, data pipeline, and data-fetching patterns in the Sales Analytics Dashboard system, from frontend to backend to Druid. It also highlights current inconsistencies and inefficiencies, referencing the business challenge of maximizing actionable insights from the available sales data.

---

## 1. Data Flow: End-to-End Pipeline

### **Frontend (React)**
- **Data Fetching:**
  - Uses custom React hooks (e.g., `useApi`, `useMonthlySalesGrowth`, `useProductPerformance`) for each dashboard component.
  - Each hook triggers a separate REST API call to the backend, even if data overlaps.
  - Filters (date range, branch, product line) are passed as query params to each API call.
  - Data is fetched per-component, not globally, leading to multiple requests for similar or related data.
  - React Query is used for caching, loading, and error states.

- **Data Flow Example:**
  1. User selects filters (date range, branch, product line).
  2. Each chart/table component triggers its own API call with those filters.
  3. Data is returned, formatted, and rendered in the component.

- **Error Handling:**
  - If any API call fails, the corresponding component shows an error state.
  - If the backend (Druid) is down, the dashboard may fall back to mock data or show a global error.

### **Backend (FastAPI)**
- **API Structure:**
  - Each KPI or analytic has its own REST endpoint (e.g., `/api/kpis/monthly-sales-growth`, `/api/kpis/product-performance`).
  - Endpoints accept query parameters for filters.
  - Each endpoint queries Druid (or mock data) and returns a JSON response.
  - The backend acts as an API gateway, translating REST calls to Druid SQL/JSON queries.

- **Data Processing:**
  - Minimal aggregation or joining is done in the backend; most endpoints are thin wrappers over Druid queries.
  - Some endpoints may return more data than needed (over-fetching), or require multiple calls for composite KPIs (under-fetching).

### **Druid (Analytics DB)**
- **Role:**
  - Stores all sales data in the `sales_analytics` datasource.
  - Responds to SQL/JSON queries from the backend, returning raw or aggregated data as requested.

---

## 2. Data Patterns & Inconsistencies

### **Current Patterns**
- **Per-Component Fetching:** Each dashboard/chart/table component fetches its own data, even if other components need similar or overlapping data.
- **REST Endpoint Granularity:** Endpoints are designed per-KPI or per-chart, not per-business-question or per-dashboard-view.
- **Redundant Requests:** Multiple components may trigger similar API calls with the same filters, leading to unnecessary backend and Druid load.
- **Over-Fetching:** Some endpoints return broad datasets (e.g., all product analytics) when only a subset is needed (e.g., top 5 products).
- **Under-Fetching:** Some business questions require data from multiple endpoints, forcing the frontend to join/aggregate data client-side.
- **Error Handling:** Errors are handled per-component, not globally, which can lead to inconsistent user experience.

### **Business Challenge Alignment**
- The current approach does maximize the use of available sales data for Phase 1 analysis (who/what/how much), but is not optimal for:
  - Efficient, holistic "State of the Business" dashboards.
  - Rapid iteration on new business questions (requires new endpoints for each).
  - Minimizing backend and Druid load as the dashboard grows.

---

## 3. Recommendations for Improvement

### **A. Move Toward GraphQL**
- **Single Endpoint:** Use a GraphQL API to allow the frontend to request exactly the data it needs for each dashboard view.
- **Batching:** Fetch all dashboard data in a single query, reducing redundant requests and round-trips.
- **Dynamic Queries:** Enable rapid iteration on new business questions without backend changes.

### **B. Backend Aggregation & Caching**
- Aggregate and join data in the backend where possible, so the frontend receives ready-to-use business insights.
- Implement caching for expensive or frequently-requested queries.

### **C. Endpoint Consolidation**
- For REST, consider consolidating endpoints to serve broader dashboard views, not just individual KPIs.

### **D. Global Error Handling**
- Implement a global error boundary or notification system for consistent user experience.

---

## 4. Summary Table

| Area                | Current Pattern                  | Recommendation                |
|---------------------|----------------------------------|-------------------------------|
| Data Fetching       | Per-component, per-endpoint      | Single query per dashboard    |
| Over-fetching       | Yes (broad endpoints)            | No (request only needed fields)|
| Under-fetching      | Yes (multiple endpoints needed)  | No (fetch all needed at once) |
| Redundant Requests  | Yes (similar data fetched often) | No (batch in one query)       |
| Error Handling      | Per-component                    | Global or per-dashboard       |

---

## 5. Conclusion

The current data pipeline is functional and leverages the available sales data for actionable insights, but it is not optimal for scalability, efficiency, or rapid business iteration. Moving toward GraphQL, backend aggregation, and endpoint consolidation will better align the system with the business challenge and future growth. 