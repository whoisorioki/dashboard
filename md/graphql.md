# GraphQL Query Structure and Usage Audit

## Overview
This document audits the current usage, configuration, and structure of GraphQL queries in the frontend, and provides recommendations for improvement and consolidation.

---

## Query Usage by Page/Component

| Page/Component      | Main GraphQL Query Hook(s) Used                | Query File(s)                        |
|---------------------|-----------------------------------------------|--------------------------------------|
| Dashboard           | `useDashboardDataQuery`                       | `dashboardData.graphql`              |
| Sales               | `useSalesPageDataQuery`                       | `salesPageData.graphql`              |
| Products            | `useProductsPageDataQuery`                    | `productsPageData.graphql`           |
| Branches            | `useBranchesPageDataQuery`                    | `branchesPageData.graphql`           |
| (Other analytics)   | (various, e.g. useRevenueSummaryQuery, etc.)  | (see respective .graphql files)      |

- Each page imports a generated React Query hook from the corresponding `.generated.ts` file, which is codegen'd from the `.graphql` file in `/frontend/src/queries`.
- These hooks are configured with the global filters (date range, branch, product line, etc.) and fetch all data needed for the page in a single query.

---

## Query Configuration & Codegen
- All queries are defined in `.graphql` files in `/frontend/src/queries`.
- Codegen is used to generate TypeScript types and React Query hooks for each query.
- The main composite queries (e.g., `dashboardData.graphql`) already fetch multiple data blocks (KPIs, charts, tables) in one request.
- Each page typically uses one main query hook, but may use additional hooks for subcomponents or detail data.

---

## Inconsistencies & Opportunities
- **Field Coverage:** Some new backend fields (e.g., `lineItemCount`, `returnsValue`) may not yet be included in all relevant queries. All queries that use `RevenueSummary` or related KPIs should be updated to request these fields.
- **Redundancy:** There is some overlap in the data fetched by different page queries (e.g., both Dashboard and Sales may fetch similar KPI blocks).
- **Fragmentation:** While each page has its own query, there is an opportunity to further consolidate queries for shared data blocks (e.g., a single `dashboardData` query for all dashboard KPIs and charts).

---

## Recommendations

1. **Update All Queries for New Fields:**
   - Ensure every `.graphql` file that fetches KPIs or summary data includes the new fields: `lineItemCount`, `returnsValue`, etc.
   - Regenerate codegen after updating queries.

2. **Move to a Single Composite Query for Dashboard:**
   - Create or update `dashboardData.graphql` to fetch all required data for the dashboard in one request (KPIs, charts, tables, etc.).
   - Refactor the Dashboard page to use only this composite query for all its data needs.
   - This will reduce network requests, simplify cache management, and ensure atomic data updates.

3. **Document Query Contracts:**
   - Keep this `graphql.md` and `frontend_mapping.md` up to date with all query structures, field names, and business logic.
   - Add a section for each composite query describing what data it fetches and which components consume it.

4. **Testing and Consistency:**
   - After any backend or schema change, always update the relevant `.graphql` files and rerun codegen.
   - Test all pages for correct data display and error/loading handling.

---

## Example: Composite Dashboard Query

```graphql
query DashboardData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $target: Float) {
  revenueSummary(startDate: $startDate, endDate: $endDate, branch: $branch, productLine: $productLine) {
    totalRevenue
    netSales
    grossProfit
    netProfit
    lineItemCount
    returnsValue
    averageTransaction
    uniqueProducts
    uniqueBranches
    uniqueEmployees
    netUnitsSold
  }
  monthlySalesGrowth(startDate: $startDate, endDate: $endDate, branch: $branch, productLine: $productLine) {
    date
    totalSales
    grossProfit
  }
  # ...add other blocks as needed (charts, tables, etc.)
}
```

---

## Summary
- The current structure is modular and codegen-based, but can be further consolidated for performance and maintainability.
- Moving to a single composite query for the dashboard is feasible and recommended.
- Always keep queries, codegen, and documentation in sync after backend changes. 