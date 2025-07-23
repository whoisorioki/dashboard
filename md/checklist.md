# Restoration & Refactor Checklist (Post-Git Pull)

---

## **Goal:**

Restore the project to its state before the accidental git pull, ensuring all changes are consistent with the standards and best practices documented in @/md. This checklist is comprehensive and covers frontend, backend, API, data flow, error handling, UI/UX, and integration.

---

### 1. **Frontend (React/TypeScript)**

- [ ] Re-implement any lost or overwritten components, hooks, or pages, using the latest patterns for data fetching (React Query, generated GraphQL hooks, codegen usage).
- [ ] Ensure all chart/table components use consistent containers (`ChartCard`), loading, error, and empty states (`ChartSkeleton`, `ChartEmptyState`), as per UI/UX standards.
- [ ] Restore any custom logic for focus/expand modals, table previews, and smart KPI cards.
- [ ] All monetary values must be displayed in KES, using consistent formatting.
- [ ] All TypeScript interfaces and types must use camelCase, matching the GraphQL schema and codegen output.
- [ ] Remove any manual type definitions that do not match the schema; use codegen types only.
- [ ] Ensure all pages (Overview, Salesforce Performance, Product Analytics, Branch Analytics, Profitability, Alerts & Diagnostics) use standardized, centered loading and error states at the page level.
- [ ] Restore and verify all global filter logic (date range, branch, product line) and context providers.
- [ ] Ensure all frontend API calls use the correct base URL and do not have double slashes or method mismatches.
- [ ] Remove any legacy or redundant code (e.g., old `useApi` hooks, unused types, or Recharts code if migrated to Nivo/ECharts).

---

### 2. **Backend (FastAPI, Druid, Polars)**

- [ ] Restore any overwritten service, model, or resolver logic, especially for GraphQL endpoints.
- [ ] Ensure all endpoints (GraphQL) return data in the documented envelope format: `{ data, error, metadata }`.
- [ ] All error handling must use the global error handler, returning clear error codes/messages and logging with requestId.
- [ ] All Druid queries must use correct datetime casting and interval handling.
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

**Note:**
- All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md].
