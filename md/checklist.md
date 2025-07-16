# Restoration & Refactor Checklist (Post-Git Pull)

---

## **Goal:**

Restore the project to its state before the accidental git pull, ensuring all changes are consistent with the standards and best practices documented in @/md. This checklist is comprehensive and covers frontend, backend, API, data flow, error handling, UI/UX, and integration.

---

### 1. **Frontend (React/TypeScript)**

- [ ] Re-implement any lost or overwritten components, hooks, or pages, using the latest patterns for data fetching (React Query, custom hooks, GraphQL usage).
- [ ] Ensure all chart/table components use consistent containers (`ChartCard`), loading, error, and empty states (`ChartSkeleton`, `ChartEmptyState`), as per UI/UX standards.
- [ ] Restore any custom logic for focus/expand modals, table previews, and smart KPI cards.
- [ ] All monetary values must be displayed in KES, using consistent formatting.
- [ ] All TypeScript interfaces and types must use camelCase, matching the GraphQL schema and codegen output.
- [ ] Remove any manual type definitions that do not match the schema; use codegen types only.
- [ ] Ensure all pages (Overview, Salesforce Performance, Product Analytics, Branch Analytics, Profitability, Alerts & Diagnostics) use standardized, centered loading and error states at the page level.
- [ ] Restore and verify all global filter logic (date range, branch, product line) and context providers.
- [ ] Ensure all frontend API calls use the correct base URL and do not have double slashes or method mismatches.
- [ ] Remove any legacy or redundant code (e.g., old `useApi` hooks, unused types, or Recharts code if migrated to ECharts).

---

### 2. **Backend (FastAPI, Druid, Polars)**

- [ ] Restore any overwritten service, model, or resolver logic, especially for GraphQL endpoints.
- [ ] Ensure all endpoints (REST and GraphQL) return data in the documented envelope format: `{ data, error, metadata }`.
- [ ] All error handling must use the global error handler, returning clear error codes/messages and logging with requestId.
- [ ] All Druid queries must use correct datetime casting and interval handling (e.g., `pl.Datetime('ms')` for `__time`).
- [ ] Restore any custom business logic for KPIs, aggregations, and schema validation (Pandera/Polars).
- [ ] Ensure all endpoints accept and correctly process filters (startDate, endDate, branch, productLine, etc.).
- [ ] Remove any placeholder/stub data and ensure all resolvers fetch real data from Druid.
- [ ] Restore and verify all health check endpoints and logging configuration.

---

### 3. **API & Integration**

- [ ] Ensure all API endpoints are documented in the standardized format (see api.md), with sample requests/responses and error envelopes.
- [ ] All frontend queries/mutations must use the correct argument names and types (camelCase, matching GraphQL schema).
- [ ] All generated `.generated.ts` files must use the correct fetcher signature for `graphql-request` v6+ (no object argument, use positional arguments).
- [ ] Remove any invalid imports (e.g., `RequestInit` from `graphql-request/dist/types.dom`).
- [ ] All hooks/components must pass the `client` instance from `graphqlClient.ts` to generated hooks.
- [ ] Ensure no Apollo Client code is present unless intentionally used.

---

### 4. **Data Flow & Error Handling**

- [ ] Restore and verify the end-to-end data flow: Druid → Backend → API → Frontend.
- [ ] All data transformations and schema validations must be in place (see data.md, druid_pipeline.md).
- [ ] All error/empty/mock data states must be handled and surfaced to the frontend as per best practices.
- [ ] Add or restore logging and monitoring for ingestion, health, and API errors.

---

### 5. **UI/UX & Accessibility**

- [ ] Ensure all pages and components use consistent Material-UI containers, spacing, and theming.
- [ ] All error/empty/loading states must use the standardized visual style (red icon/message, no retry unless requested).
- [ ] All charts/tables must have meaningful axis labels, tooltips, and ARIA labels for accessibility.
- [ ] Restore any lost accessibility improvements (WCAG 2.1 AA compliance, color contrast, keyboard navigation).

---

### 6. **Documentation & Observability**

- [ ] Update or restore all documentation in @/md to reflect the current state of the codebase.
- [ ] Ensure all changes are consistent with the business challenge, architectural vision, and integration checklists in the md/ docs.
- [ ] Add notes on any manual fixes or deviations from the documented standards.

---

**Follow this checklist step by step to restore your project to its pre-pull state, ensuring full consistency with all documented standards and best practices.**

---

Absolutely! Here’s a **comprehensive checklist** for stabilizing, strengthening, and scaling your sales analytics pipeline. This is organized by phase (Immediate, Medium-Term, Long-Term) and covers all critical areas: frontend, backend, Druid, Docker, and observability.

---

# **Sales Analytics Pipeline Stabilization & Improvement Checklist**

---

## **Immediate Mitigation (Triage – Target: <1 Week)**

### **Frontend (React)**

- [ ] Audit all `useQuery` hooks for correct use of React Query state flags:
  - [ ] Use `isLoading` for initial load.
  - [ ] Use `isFetching` for background refetches (show subtle loading indicator, not full spinner).
  - [ ] Use `isError` to display a user-friendly error message and a “Retry” button.
  - [ ] Use `isPlaceholderData` (or `keepPreviousData`) to prevent UI flicker.
- [ ] Never clear data to empty/zero state on background fetch failure; always show last good data or an error.
- [ ] Add error boundaries to all major dashboard components.

### **Backend (FastAPI)**

- [ ] Refactor all Druid data-fetching services:
  - [ ] Do **not** swallow exceptions from Druid; raise `HTTPException` on error.
  - [ ] Return proper HTTP status codes (e.g., 503 for Druid unavailability).
  - [ ] Implement a global exception handler to return a consistent error envelope:
    ```json
    {
      "data": null,
      "error": { "code": "DRUID_UNAVAILABLE", "message": "..." },
      "metadata": { "requestId": "..." }
    }
    ```
- [ ] Standardize all API responses to use a consistent envelope (see above).
- [ ] Add basic retry logic (with exponential backoff) for transient Druid errors.

### **Druid & Docker**

- [ ] Increase memory allocation for Druid containers in `docker-compose.yml`:
  - [ ] Set `DRUID_XMX` (heap) to at least 4g for Broker, Historical, and MiddleManager.
  - [ ] Set `DRUID_MAXDIRECTMEMORYSIZE` to at least 4g for the same services.
- [ ] Use `docker stats` to monitor resource usage during ingestion.
- [ ] Ensure all services are on the same Docker network for reliable connectivity.

---

## **Medium-Term Refactoring (Strengthen – Target: 2-4 Weeks)**

### **Druid Ingestion**

- [ ] Refactor ingestion to use `REPLACE ... OVERWRITE WHERE` for daily/interval updates.
- [ ] Automate ingestion to update only necessary time slices (e.g., by day).
- [ ] Avoid `REPLACE ... OVERWRITE ALL` except for initial loads.

### **Backend Data Contracts**

- [ ] Define strict Pandera `DataFrameSchema` or `DataFrameModel` for all Druid data:
  - [ ] Set `nullable=False` for all critical columns (e.g., `__time`, `Branch`, metrics).
  - [ ] Enforce correct types and business rules.
- [ ] Validate all DataFrames against the schema immediately after fetching from Druid.
- [ ] Log and alert on any schema validation failures.

### **Structured Logging & Observability**

- [ ] Integrate `structlog` (or similar) for structured, JSON logging.
- [ ] Add FastAPI middleware to inject a unique `request_id` into every request and log entry.
- [ ] Ensure all logs include `request_id` for traceability.

---

## **Long-Term Architectural Vision (Scale – Next Quarter)**

### **Centralized Data Contracts**

- [ ] Define a single source of truth for data contracts (e.g., JSON Schema).
- [ ] Auto-generate backend (Pandera/Pydantic) and frontend (TypeScript) models from this schema.
- [ ] Integrate schema generation/validation into CI/CD pipeline.

### **Observability Dashboard**

- [ ] Deploy a dashboard (Grafana, Datadog, etc.) to monitor:
  - [ ] Data freshness (max segment end time in Druid)
  - [ ] Data volume (row count)
  - [ ] Schema validation errors
  - [ ] API error rates
  - [ ] Distribution stats (mean, nulls, etc.)
- [ ] Set up alerts for SLA violations (e.g., data older than 24h, error rate >5%).

### **API Response Standardization**

- [ ] Refactor all endpoints to return:
  ```json
  { "data": T | null, "error": { "code": string, "message": string } | null, "metadata": { "requestId": string, ... } }
  ```
- [ ] Update frontend to expect and handle this envelope everywhere.

---

## **General Best Practices**

- [ ] Use Docker volumes for Druid and PostgreSQL data persistence.
- [ ] Regularly review and update resource allocations as data volume grows.
- [ ] Document all data contracts, API endpoints, and error codes.
- [ ] Schedule regular reviews of observability metrics and incident postmortems.

---

**Tip:**  
Print or bookmark this checklist. Use it as a living document—check off items as you complete them, and add notes or links to relevant code/docs for your team.

If you need code samples, configuration templates, or want to automate any of these steps, just ask!
