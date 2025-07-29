# GraphQL API Documentation

This document outlines the primary **GraphQL API**, which is the recommended interface for all new frontend development. It provides a single, unified endpoint for all analytics queries.

---

## GraphQL Endpoint

- **URL:** `/graphql`
- **Method:** `POST`

### How to Use

Send GraphQL queries to this endpoint. All analytics data can be fetched through this single endpoint, and it's recommended to consolidate multiple data requests into a single query where possible, such as in the `dashboardData` query.

### Consolidated Dashboard Query

For the main dashboard, use the `dashboardData` query to fetch all necessary data in a single network request. This is the most efficient way to load the dashboard.

**Query: `dashboardData`**
- **Description:** Fetches all data required for the main dashboard.
- **Arguments:**
  - `startDate` (String!): The start date for the query period (YYYY-MM-DD).
  - `endDate` (String!): The end date for the query period (YYYY-MM-DD).
  - `branch` (String): Filter by a specific branch.
  - `productLine` (String): Filter by a specific product line.
  - `target` (Float): The sales target for target attainment calculations.
- **Returns:** `DashboardData` - An object containing all the different data slices for the dashboard.

### Available Queries

| Query Name                 | Arguments (all optional unless noted)                                                     | Returns/Schema                  |
| -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| `dashboardData`            | startDate!, endDate!, branch, productLine, itemGroups, target                             | `DashboardData`                 |
| `salespersonLeaderboard`   | startDate, endDate, branch, itemGroups                                                    | `[SalespersonLeaderboardEntry]` |
| `productProfitability`     | startDate, endDate, branch, itemGroups                                                    | `[ProductProfitabilityEntry]`   |
| `salespersonProductMix`    | startDate, endDate, branch, itemGroups                                                    | `[SalespersonProductMixEntry]`  |
| `topCustomers`             | startDate, endDate, branch, n, productLine, itemGroups                                    | `[TopCustomerEntry]`            |
| `monthlySalesGrowth`       | startDate, endDate, branch, productLine, itemGroups                                       | `[MonthlySalesGrowth]`          |
| `salesPerformance`         | startDate, endDate, branch, productLine, itemGroups                                       | `[SalesPerformance]`            |
| `productAnalytics`         | startDate, endDate, branch, productLine, itemGroups                                       | `[ProductAnalytics]`            |
| `revenueSummary`           | startDate, endDate, branch, productLine, itemGroups                                       | `RevenueSummary`                |
| `branchPerformance`        | startDate, endDate, branch, productLine, itemGroups                                       | `[BranchPerformance]`           |
| `branchProductHeatmap`     | startDate, endDate, branch, productLine, itemGroups                                       | `[BranchProductHeatmap]`        |
| `targetAttainment`         | startDate, endDate, target, itemGroups                                                    | `TargetAttainment`              |
| `marginTrends`             | startDate, endDate, itemGroups                                                            | `[MarginTrendEntry]`            |
| `returnsAnalysis`          | startDate, endDate, itemNames, salesPersons, branchNames, branch, productLine, itemGroups | `[ReturnsAnalysisEntry]`        |
| `profitabilityByDimension` | startDate, endDate, dimension, itemGroups                                                 | `[ProfitabilityByDimension]`    |
| `branchList`               | startDate, endDate, itemGroups                                                            | `[BranchListEntry]`             |
| `dataRange`                |                                                                                           | `DataRange`                     |

---

### GraphQL Types (Sample Schemas)

All field names are returned in **camelCase**.

```typescript
// For salespersonLeaderboard
interface SalespersonLeaderboardEntry {
  salesperson: string;
  salesAmount: number | null;
  grossProfit: number | null;
}

// For productProfitability
interface ProductProfitabilityEntry {
  productLine: string;
  itemName: string;
  grossProfit: number | null;
}

// For topCustomers
interface TopCustomerEntry {
  cardName: string;
  salesAmount: number | null;
  grossProfit: number | null;
}

// For monthlySalesGrowth
interface MonthlySalesGrowth {
  date: string;
  totalSales: number | null;
  grossProfit: number | null;
}

// For salesPerformance
interface SalesPerformance {
  salesPerson: string;
  totalSales: number;
  grossProfit: number | null;
  avgMargin: number | null;
  transactionCount: number;
  averageSale: number;
  uniqueBranches: number;
  uniqueProducts: number;
}

// For productAnalytics
interface ProductAnalytics {
  itemName: string;
  productLine: string;
  itemGroup: string;
  totalSales: number;
  grossProfit: number | null;
  margin: number | null;
  totalQty: number;
  transactionCount: number;
  uniqueBranches: number;
  averagePrice: number;
}

// For revenueSummary
interface RevenueSummary {
  totalRevenue: number | null;
  grossProfit: number | null;
  totalTransactions: number;
  averageTransaction: number | null;
  uniqueProducts: number;
  uniqueBranches: number;
  uniqueEmployees: number;
}

// For branchPerformance
interface BranchPerformance {
  branch: string;
  totalSales: number;
  transactionCount: number;
  averageSale: number;
  uniqueCustomers: number;
  uniqueProducts: number;
}

// For targetAttainment
interface TargetAttainment {
  attainmentPercentage: number;
  totalSales: number;
  target: number;
}
```

---

## Non-KPI Endpoints (REST)

These endpoints are for system health checks and raw data access. They still follow the RESTful pattern.

### Health Check

- **Endpoint:** `/api/health`
- **Returns:** `{ "status": "ok" }`

### Druid Health Check

- **Endpoint:** `/api/health/druid`
- **Returns:** `{ "druidStatus": "connected" | "disconnected", "isAvailable": boolean }`

### Druid Datasources

- **Endpoint:** `/api/druid/datasources`
- **Returns:** `{ "datasources": ["sales_analytics"], "count": 1 }`

---

## Filtering Architecture & Best Practices (2024 Update)

- **Global Filter Bar:** Standardized, appears on all main pages. Contains Date Range, Branch, Product Line, and Item Group filters (all multi-select, searchable).
- **State Management:** Global filter state managed by Zustand (`filterStore.ts`), not React Context. State shape: `{ startDate, endDate, selectedBranches, selectedProductLines, selectedItemGroups }`.
- **Data Fetching:** All GraphQL hooks use queryKey derived from filterStore. When a filter changes, a new queryKey triggers React Query to check cache or fetch new data.
- **Caching:** Cached data is returned instantly for previously used filter combinations. Filter state is persisted to localStorage.
- **UI/UX:** Active filters shown as chips/tags, with individual removal and a reset button. Local (page-specific) filters do not affect global state.
- **Field Distinction:** ProductLine = high-level brand/category; ItemGroup = sub-category (e.g., "Parts", "Units"). Both are first-class filters in all relevant queries and components.

---
