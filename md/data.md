# Data Flow, Transformations, and Troubleshooting for Frontend Data Unavailability

---

## 1. Data Flow Overview

- **Source:** Sales data is ingested from CSV into Druid (`sales_analytics` datasource) via the backend ingestion script.
- **Backend:** FastAPI backend queries Druid for analytics, applies schema validation, and exposes REST/GraphQL endpoints.
- **Frontend:** React dashboard fetches data via custom hooks, using React Query for caching and state management. Data is visualized in charts and tables.

---

## 2. Backend Processing & Error Handling

- **Data Fetching:**
  - Each API endpoint (REST/GraphQL) queries Druid for the requested data, applying filters (date, branch, etc.).
  - Data is validated using Pandera schemas (see `sales_analytics_schema.py`).
  - If Druid is unavailable or returns errors, the backend logs the error and may fall back to mock data if enabled.
- **Error Handling:**
  - All errors are wrapped in a standardized envelope:
    ```json
    {
      "data": null,
      "error": { "code": "ERROR_CODE", "message": "..." },
      "metadata": { "requestId": "..." }
    }
    ```
  - Backend logs all errors and warnings for observability.
  - If both Druid and mock data fail, the error is propagated to the frontend.

---

## 3. API Response Patterns

- **Success:**
  ```json
  { "data": { ... }, "error": null, "metadata": { ... } }
  ```
- **Error:**
  ```json
  { "data": null, "error": { "code": "ERROR_CODE", "message": "..." }, "metadata": { ... } }
  ```
- **Mock Data:**
  - If Druid is down, the backend may return `{ using_mock_data: true, result: [...] }` in the data field.
  - The frontend can display a banner if mock data is being used.

---

## 4. Frontend Data Fetching & State

- **Hooks:**
  - Custom hooks (e.g., `useApi`, `useDynamicApi`, `useMonthlySalesGrowth`) fetch data from the backend, using React Query for caching and state.
  - Hooks expose `data`, `isLoading`, `isError`, and `refetch`.
- **State Handling:**
  - Loading: Show skeletons/spinners while fetching.
  - Error: Show error banners or fallback UI if `isError` is true or if the API returns an error envelope.
  - Empty: Show empty state if data is empty or missing.
  - Mock Data: Show a warning if `using_mock_data` is true in the response.
- **Global Filters:**
  - Filter state (date range, branch, product line) is managed via React Context and passed to all hooks.

---

## 5. Common Causes of Data Unavailability in the Frontend

1. **Druid Unavailable:**
   - Backend cannot connect to Druid; may fall back to mock data or return an error.
   - Check `/api/health/druid` for Druid status.
2. **Backend Error:**
   - Schema validation fails, query errors, or missing columns.
   - Check backend logs for error messages.
3. **API Contract Mismatch:**
   - Frontend expects a different data shape than what the backend returns (e.g., field names, envelope structure).
   - Ensure TypeScript types and GraphQL queries match backend schema.
4. **Filter Mismatch:**
   - Filters (date, branch, etc.) result in no data (e.g., too restrictive).
   - Try broadening filters to see if data appears.
5. **Frontend State Issues:**
   - Incorrect use of `isLoading`, `isError`, or improper handling of the API envelope.
   - Ensure hooks and components check for `data`, `error`, and `using_mock_data` correctly.
6. **Network Issues:**
   - API requests fail due to network problems or CORS errors.
   - Check browser console and network tab for failed requests.

---

## 6. Troubleshooting & Best Practices

- **Check API Health:**
  - Visit `/api/health` and `/api/health/druid` to verify backend and Druid status.
- **Inspect API Responses:**
  - Use browser dev tools to inspect the full API response envelope for errors or mock data flags.
- **Check Backend Logs:**
  - Look for errors or warnings in backend logs (see `backend/logging_config.py`).
- **Validate Filters:**
  - Reset filters to default/broad values to rule out over-filtering.
- **Sync Types & Contracts:**
  - Ensure frontend TypeScript types and GraphQL queries match backend schema (see `frontend_mapping.md`).
- **Handle All States:**
  - In components, always check for loading, error, empty, and mock data states.
- **Use Error Boundaries:**
  - Add error boundaries to catch and display unexpected errors in the UI.
- **Monitor for Mock Data:**
  - If mock data is being used, investigate Druid/backend health.
- **Documentation References:**
  - See `api.md`, `frontend_mapping.md`, `data_patterns.md`, `report.md`, and `log.md` for more details on data flow, contracts, and error handling.

---

**By following this flow and checklist, you can systematically diagnose and resolve most frontend data unavailability errors.**
