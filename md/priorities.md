Ran tool
Search files...
Here is a prioritized list of the most important inconsistencies and issues between your frontend and backend that need to be addressed before you can have a robust, maintainable, and fully functional analytics dashboard:

---

## **Priority 1: Critical Data Contract & Type Inconsistencies**

### 1. **Outdated/Incorrect GraphQL Type Definitions in the Frontend**
- **Problem:** The generated TypeScript types in `frontend/src/types/graphql.ts` are out of sync with the backend GraphQL schema (`backend/schema/schema.py`).
- **Examples:**
  - `MonthlySalesGrowth`: Frontend expects `sales`, backend provides `totalSales` and `grossProfit`.
  - `ProductAnalytics`: Frontend missing `grossProfit` and `margin`.
  - `SalesPerformance`: Frontend missing `grossProfit` and `avgMargin`.
- **Impact:** Type errors, runtime bugs, incomplete UI, and inability to use all backend data.
- **Action:** **Regenerate all GraphQL types and hooks in the frontend using your codegen setup.** This will fix type mismatches and ensure the frontend can access all available fields.

---

## **Priority 2: Architectural/API Consistency**

### 2. **Mixed Use of REST and GraphQL**
- **Problem:** Some pages/components (e.g., `ProfitabilityAnalysis.tsx`) still use REST endpoints, while most of the app uses GraphQL.
- **Impact:** Inconsistent data fetching, increased maintenance, and potential for contract drift.
- **Action:** **Refactor all frontend data fetching to use GraphQL hooks only.** Deprecate/remove legacy REST endpoints in the backend.

---

## **Priority 3: Incomplete GraphQL Implementation**

### 3. **Stubbed/Non-Functional GraphQL Resolvers**
- **Problem:** Several resolvers in `backend/schema/schema.py` are stubs and return empty arrays (e.g., `product_performance`, `branch_performance`, `sales_performance`).
- **Impact:** Frontend cannot display real data for these analytics, leading to empty charts/tables.
- **Action:** **Implement real data-fetching logic for all stubbed GraphQL resolvers.**

---

## **Priority 4: Broken or Inefficient Frontend Components**

### 4. **Empty or Hardcoded Chart Data**
- **Problem:** Some components (e.g., `BranchProductHeatmap` in `Dashboard.tsx`, `MonthlySalesTrendChart` in `Sales.tsx`) are hardcoded with `data={[]}` or use the wrong query.
- **Impact:** Key visualizations are broken or always empty.
- **Action:** **Wire up all chart/table components to the correct, live GraphQL queries.** Ensure the data shape matches the backend.

### 5. **Inefficient Data Fetching (Request Waterfall)**
- **Problem:** Pages like `Dashboard.tsx` make many separate API calls for each KPI/chart.
- **Impact:** Slow, disjointed page loads.
- **Action:** **Refactor to use consolidated GraphQL queries that fetch all needed data in a single request.**

---

## **Priority 5: Naming & Field Convention Consistency**

### 6. **Field Naming Mismatches**
- **Problem:** Some legacy REST endpoints and Polars DataFrames use `snake_case`, while GraphQL and frontend expect `camelCase`.
- **Impact:** Bugs when consuming data, especially if a component accidentally uses REST output.
- **Action:** **Ensure all Python resolvers use `snake_case` and rely on Strawberry's `auto_camel_case` for the API.** Remove or update any code or docs that reference `snake_case` in the API contract.

---

## **Priority 6: Documentation, Setup, and Developer Experience**

### 7. **Project Structure/Dependency Confusion**
- **Problem:** Two `package.json` files (root and `frontend/`), leading to install errors.
- **Action:** **Delete the root-level `package.json` and `package-lock.json`.** All frontend npm operations should be in `frontend/`.

### 8. **Documentation Drift**
- **Problem:** Some docs (e.g., `args.md`, old markdowns) reference outdated field names, REST endpoints, or data flows.
- **Action:** **Update all documentation to reflect the current GraphQL/camelCase contract and remove references to REST.**

---

## **Summary Table**

| Priority | Issue/Task | Impact | Action |
|----------|------------|--------|--------|
| 1 | Regenerate frontend GraphQL types/hooks | Type errors, broken UI | Run codegen, update all usages |
| 2 | Remove REST usage, go GraphQL-only | Contract drift, bugs | Refactor all data fetching |
| 3 | Implement all GraphQL resolvers | Empty charts/tables | Backend work |
| 4 | Wire up all charts/tables to live data | Broken UI | Frontend work |
| 5 | Consolidate GraphQL queries | Slow UX | Refactor Dashboard, etc. |
| 6 | Standardize field naming | Bugs, confusion | Backend/contract work |
| 7 | Fix project structure | Install errors | Delete root package.json |
| 8 | Update documentation | Onboarding, confusion | Docs update |

---

**Let me know which of these you want to tackle first, or if you want a step-by-step plan for the top priorities!**