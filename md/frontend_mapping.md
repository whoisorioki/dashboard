# Frontend–Backend Mapping: GraphQL Analytics API

This document provides the authoritative mapping between frontend dashboard components, their expected data structures (TypeScript interfaces), the corresponding GraphQL queries, output fields, error envelope structure, and accepted filter arguments. All field names are camelCase in the frontend, and this mapping is kept in sync with the backend GraphQL schema via codegen. This file is the single source of truth for frontend-backend data contracts.

---

## 1. Mapping Table: Component ↔️ GraphQL Output

| **Component**                          | **TypeScript Interface**                                                                                                                                                                                                                                                     | **GraphQL Query & Output Fields**                                                                                                                                         | **Filters (Arguments)**                                                                 | **Notes**                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Enhanced KPI Cards**                 | `KpiCard { title, value, icon, trend, sparklineData, vsValue, vsPercent, vsDirection }`                                                                                                                                                                                      | `revenueSummary { totalRevenue, grossProfit, lineItemCount }` + `monthlySalesGrowth`                                                                                      | startDate, endDate, branch, productLine, itemGroups                                     | Enhanced with sparklines and vs previous period                                             |
| **Sales vs. Profit Trend Chart**       | `MonthlySalesGrowthEntry { date: string; totalSales?: number; grossProfit?: number; }`                                                                                                                                                                                       | `monthlySalesGrowth { date totalSales grossProfit }`                                                                                                                      | startDate, endDate, branch, productLine, itemGroups                                     | Combination chart: bars for sales, line for profit                                          |
| **Geographic Profitability Map**       | `ProfitabilityByDimensionEntry { branch?: string; grossProfit?: number; grossMargin?: number; }`                                                                                                                                                                             | `profitabilityByDimension { branch grossProfit grossMargin }`                                                                                                             | startDate, endDate, dimension: "Branch", itemGroups                                     | Choropleth map of Kenya by county                                                           |
| **Enhanced Top Customers Table**       | `TopCustomerEntry { cardName: string; salesAmount?: number; grossProfit?: number; }`                                                                                                                                                                                         | `topCustomers { cardName salesAmount grossProfit }`                                                                                                                       | startDate, endDate, branch, n: 100, productLine, itemGroups                             | Ranked by gross profit, includes sparklines, pagination (10/25/50/100), search, and sorting |
| **Salesperson Leaderboard**            | `SalespersonLeaderboardEntry { salesperson: string; salesAmount: number; grossProfit: number; }`                                                                                                                                                                             | `salespersonLeaderboard { salesperson salesAmount grossProfit }`                                                                                                          | startDate, endDate, branch, itemGroups                                                  | Returns array of entries                                                                    |
| **Product/Product Line Profitability** | `ProductProfitabilityEntry { productLine: string; itemName: string; grossProfit: number; }`                                                                                                                                                                                  | `productProfitability { productLine itemName grossProfit }`                                                                                                               | startDate, endDate, branch, itemGroups                                                  |                                                                                             |
| **Salesperson Product Mix & Margin**   | `SalespersonProductMixEntry { salesperson: string; productLine: string; avgProfitMargin: number; }`                                                                                                                                                                          | `salespersonProductMix { salesperson productLine avgProfitMargin }`                                                                                                       | startDate, endDate, branch, itemGroups                                                  |                                                                                             |
| **Customer Value Table**               | `CustomerValueEntry { cardName: string; salesAmount: number; grossProfit: number; }`                                                                                                                                                                                         | `customerValue { cardName salesAmount grossProfit }`                                                                                                                      | startDate, endDate, itemGroups                                                          | Returns top customers by profitability                                                      |
| **Sales Target Attainment**            | `SalesTargetAttainment { attainmentPercentage: number; totalSales: number; target: number; }`                                                                                                                                                                                | `targetAttainment { attainmentPercentage totalSales target }`                                                                                                             | startDate, endDate, target, itemGroups                                                  |                                                                                             |
| **Product Performance**                | `ProductPerformanceEntry { product: string; sales: number; }`                                                                                                                                                                                                                | `productPerformance { product sales }`                                                                                                                                    | startDate, endDate, n, itemGroups                                                       |                                                                                             |
| **Product Analytics**                  | `ProductAnalyticsEntry { itemName: string; productLine: string; itemGroup: string; totalSales: number; totalQty: number; transactionCount: number; uniqueBranches: number; averagePrice: number; }`                                                                          | `productAnalytics { itemName productLine itemGroup totalSales totalQty transactionCount uniqueBranches averagePrice }`                                                    | startDate, endDate, itemGroups                                                          | Updated: fields are camelCase in TS, snake_case in backend                                  |
| **Branch Performance Table**           | `BranchPerformanceEntry { branch: string; totalSales: number; transactionCount: number; averageSale: number; uniqueCustomers: number; uniqueProducts: number; }`                                                                                                             | `branchPerformance { branch totalSales transactionCount averageSale uniqueCustomers uniqueProducts }`                                                                     | startDate, endDate, itemGroups                                                          | Updated: field names are camelCase in TS                                                    |
| **Branch List**                        | `string[]`                                                                                                                                                                                                                                                                   | `branchList`                                                                                                                                                              | startDate, endDate                                                                      | Returns array of branch names                                                               |
| **Branch Growth**                      | `BranchGrowthEntry { branch: string; monthYear: string; monthlySales: number; growthPct: number; }`                                                                                                                                                                          | `branchGrowth { branch monthYear monthlySales growthPct }`                                                                                                                | startDate, endDate                                                                      | Updated: field names camelCase in TS                                                        |
| **Sales Performance**                  | `SalesPerformanceEntry { salesperson: string; totalSales: number; transactionCount: number; averageSale: number; uniqueBranches: number; uniqueProducts: number; }`                                                                                                          | `salesPerformance { salesperson totalSales transactionCount averageSale uniqueBranches uniqueProducts }`                                                                  | startDate, endDate                                                                      | Updated: field names camelCase in TS                                                        |
| **Revenue Summary**                    | `RevenueSummary { totalRevenue: number; netSales: number; grossProfit: number; netProfit: number; lineItemCount: number; returnsValue: number; averageTransaction: number; uniqueProducts: number; uniqueBranches: number; uniqueEmployees: number; netUnitsSold: number; }` | `revenueSummary { totalRevenue netSales grossProfit netProfit lineItemCount returnsValue averageTransaction uniqueProducts uniqueBranches uniqueEmployees netUnitsSold }` | startDate, endDate, branch, productLine                                                 | Updated: all new fields included                                                            |
| **Data Range**                         | `DataRange { earliestDate: string; latestDate: string; totalRecords: number; }`                                                                                                                                                                                              | `dataRange { earliestDate latestDate totalRecords }`                                                                                                                      | None                                                                                    |                                                                                             |
| **Margin Trends**                      | `MarginTrendEntry { date: string; marginPct: number; }`                                                                                                                                                                                                                      | `marginTrends { date marginPct }`                                                                                                                                         | startDate, endDate                                                                      | Updated: field is `marginPct`                                                               |
| **Returns Analysis**                   | `ReturnsAnalysisEntry { reason: string; count: number; }`                                                                                                                                                                                                                    | `returnsAnalysis { reason count }`                                                                                                                                        | startDate, endDate, itemNames, salesPersons, branchNames, branch, productLine, mockData | Returns reasons for returns                                                                 |

---

## 2. Error Envelope Structure (GraphQL)

All GraphQL errors are returned in a consistent envelope:

```json
{
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "..." },
  "metadata": { "requestId": "..." }
}
```
- **data**: null if an error occurred.
- **error**: Contains a code and human-readable message.
- **metadata**: Always includes a unique requestId for traceability.

---

## 3. Nested Fields & Notes

- All returned arrays are flat unless otherwise noted.
- If a field is an object or array of objects, the TypeScript interface and GraphQL output should match exactly.
- All currency values are numbers (not strings) and should be formatted as KES in the frontend.
- Dates are returned as ISO 8601 strings.
- If a field is optional, it should be marked as such in the TypeScript interface and GraphQL schema.
- **Field Name Mapping:** GraphQL schema and codegen use camelCase for TypeScript, and all frontend code must use camelCase.
- **Component–Query Mapping:** Each chart/table/KPI should use the correct query and data type. Do not mix ProductAnalytics with ProductPerformance, etc.
- **Filters:** All filters (date, branch, productLine, etc.) are managed via FilterContext and passed to queries as needed. Defaults are set in FilterContext.

---

## 4. Filter Arguments Reference

| **Filter Argument** | **Type** | **Description**                                              | **Default**         |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------- |
| startDate           | string   | Start date for filtering (YYYY-MM-DD)                        | "2024-01-01"        |
| endDate             | string   | End date for filtering (YYYY-MM-DD)                          | "2024-12-31"        |
| branch              | string   | Branch name (optional)                                       | None                |
| productLine         | string   | Product line (optional, high-level brand/category)           | None                |
| itemGroups          | [string] | List of item groups (sub-categories, e.g., "Parts", "Units") | None                |
| n                   | int      | Number of top results to return (for rankings)               | 5 or 10 (see query) |
| target              | float    | Sales target (for attainment queries)                        | 0.0                 |
| dimension           | string   | Dimension for profitability (e.g., Branch)                   | "Branch"            |
| itemNames           | [string] | List of item names (for filtering)                           | None                |
| salesPersons        | [string] | List of salesperson names (for filtering)                    | None                |
| branchNames         | [string] | List of branch names (for filtering)                         | None                |

---

## 5. Composite Query: Pros, Cons, and Mitigation

### Pros
- **Fewer network requests:** All dashboard data fetched in one round-trip.
- **Atomicity:** Data is always consistent for a given filter set.
- **Simpler cache management:** One query key for the whole dashboard.
- **Easier to keep frontend and backend in sync.**

### Maximizing the Pros
- **Batch UI updates:** Use the composite query to trigger all dashboard UI updates at once, ensuring a smooth, consistent user experience.
- **Leverage React Query caching:** With a single query key, cache invalidation and refetching are straightforward and efficient.
- **Prefetching:** Use React Query's prefetch capabilities to load dashboard data in the background (e.g., when a user is about to navigate to the dashboard).
- **SSR/Initial Load:** For server-side rendering or initial page load, fetch all dashboard data in one request to minimize time-to-interactive.
- **Consistent error/loading states:** Handle loading and error states at the composite query level, providing unified feedback to the user.
- **Analytics and logging:** Track a single query for analytics, performance monitoring, and debugging, making it easier to identify issues.
- **Documentation:** Keep the composite query and its mapping well-documented, so onboarding and cross-team communication are easier.

### Cons & Mitigation
- **Larger payloads:**
  - *Mitigation:* Only request fields/components actually needed for the current dashboard view. Use GraphQL fragments or conditional queries if possible.
- **Less granularity for updates:**
  - *Mitigation:* Use React Query's `select` and `refetch` for subcomponents if needed. For highly interactive widgets, consider splitting out a focused query.
- **Backend load spikes:**
  - *Mitigation:* Optimize backend resolvers for efficiency. Use Druid's aggregation and filtering to minimize data transfer and computation.
- **Frontend code complexity:**
  - *Mitigation:* Use clear TypeScript interfaces and mapping tables (as in this file). Keep composite query structure documented and up to date.

### Best Practices
- Always keep this mapping and the composite query in sync.
- After backend changes, update the composite query and regenerate codegen.
- Test dashboard for both performance and correctness after any major change. 

---

## 6. GraphQL Fragments & Page-Level Composite Queries: Definitive Recommendation

### Strategy
- **Continue using Page-Level Composite Queries** (one query per page, e.g., `dashboardData.graphql`, `salesPageData.graphql`).
- **Use GraphQL Fragments** for any data block shared across multiple pages (e.g., `RevenueSummaryFields`, `TopCustomerFields`).
- **Do NOT use a single application-wide composite query.**

### Why This Is Optimal
| Feature             | Page-Level Composite (Recommended) | Application-Wide Composite |
| ------------------- | ---------------------------------- | -------------------------- |
| Initial Load Time   | Fast                               | Very Slow                  |
| User Experience     | Excellent                          | Poor                       |
| Data Fetching       | Efficient                          | Over-fetching              |
| Backend Performance | Optimal                            | High Strain                |
| Maintainability     | High                               | Low                        |

### How to Implement & Maximize
1. **Identify Shared Data Blocks:**
   - E.g., `RevenueSummary`, `TopCustomerEntry`, `BranchList`.
2. **Create GraphQL Fragments:**
   - In `/frontend/src/queries/fragments.graphql`:
   ```graphql
   fragment RevenueSummaryFields on RevenueSummary {
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
   fragment TopCustomerFields on TopCustomerEntry {
     cardName
     salesAmount
     grossProfit
   }
   ```
3. **Use Fragments in Page Queries:**
   - In each page query, import and use the relevant fragments:
   ```graphql
   #import "./fragments.graphql"
   query DashboardData($startDate: String!, $endDate: String!) {
     revenueSummary(startDate: $startDate, endDate: $endDate) {
       ...RevenueSummaryFields
     }
     topCustomers(startDate: $startDate, endDate: $endDate) {
       ...TopCustomerFields
     }
     # ...other dashboard-specific blocks
   }
   ```
4. **React Query Caching:**
   - Fragments ensure that shared data (e.g., `RevenueSummary`) is cached and reused across pages, improving perceived performance.
5. **Document Fragments:**
   - Add a mapping table below for fragment usage.

#### Fragment Usage Mapping
| Fragment Name            | Used In Queries              | Pages/Components |
| ------------------------ | ---------------------------- | ---------------- |
| RevenueSummaryFields     | dashboardData, salesPageData | Dashboard, Sales |
| TopCustomerFields        | dashboardData, salesPageData | Dashboard, Sales |
| MonthlySalesGrowthFields | dashboardData, salesPageData | Dashboard, Sales |
| ...                      | ...                          | ...              |

- All page-level queries (e.g., `dashboardData.graphql`, `salesPageData.graphql`) should use fragments for shared data blocks, including monthlySalesGrowth.
- Use the `#import "./fragments.graphql"` pattern at the top of each query file to include fragments.

### Best Practices
- Keep fragments and page-level queries in sync with backend and `frontend_mapping.md`.
- After backend changes, update fragments and all queries that use them, then regenerate codegen.
- Document all fragments and their usage in this file.
- Use React Query's cache and prefetching to maximize performance.

--- 

---

## 7. Filtering Architecture & Best Practices (2024 Update)

### Global Filter Bar
- A standardized Global Filter Bar appears at the top of every primary dashboard page (Overview, Sales, Products, Branch, Profitability).
- Contains: Date Range Picker, Branch Filter (multi-select), Product Line Filter (multi-select, high-level), Item Group Filter (multi-select, sub-category).
- All filters are searchable and support multi-select.

### State Management
- Global filter state is managed via a dedicated Zustand store (`filterStore.ts`), not React Context.
- State shape: `{ startDate, endDate, selectedBranches, selectedProductLines, selectedItemGroups }`.
- Actions: `setStartDate`, `addBranch`, `clearFilters`, etc.
- Only components that use a specific filter value re-render when that value changes (performance optimization).

### Data Fetching & Caching
- All data-fetching hooks (generated by GraphQL Code Generator) construct their `queryKey` from the current Zustand filter state.
- When a filter changes, a new query key is generated, triggering React Query to check its cache or fetch new data.
- Cached data is returned instantly if available for the filter combination; otherwise, a new network request is made.
- Filter state is persisted to `localStorage` for seamless user experience across reloads.

### UI/UX Enhancements
- Active filters are displayed as chips/tags below the filter bar, with individual removal and a prominent "Reset Filters" button.
- Local (page-specific) filters are allowed but do not affect global state.

### Field Distinction
- **ProductLine**: High-level brand/category (e.g., "Ingersoll Rand", "Toyota").
- **ItemGroup**: Specific sub-category (e.g., "Parts", "Units").
- Both are now first-class filters in all relevant queries and components.

--- 