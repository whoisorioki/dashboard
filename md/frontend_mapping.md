# Frontend–Backend Mapping: GraphQL Analytics API

This document provides a detailed mapping between frontend dashboard components, their expected data structures (TypeScript interfaces), the corresponding GraphQL queries, output fields (including nested fields), error envelope structure, and accepted filter arguments. Use this as a contract to ensure seamless integration and rapid troubleshooting.

---

## 1. Mapping Table: Component ↔️ GraphQL Output

| **Component**                        | **TypeScript Interface**                                                                 | **GraphQL Query & Output Fields**                                                                                 | **Filters (Arguments)**                        | **Notes**                                 |
|--------------------------------------|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|------------------------------------------------|-------------------------------------------|
| **Salesperson Leaderboard**          | `SalespersonLeaderboardEntry { salesperson: string; salesAmount: number; grossProfit: number; }` | `salespersonLeaderboard { salesperson salesAmount grossProfit }`                                                  | startDate, endDate, branch                    | Returns array of entries                  |
| **Product/Product Line Profitability**| `ProductProfitabilityEntry { productLine: string; itemName: string; grossProfit: number; }`      | `productProfitability { productLine itemName grossProfit }`                                                       | startDate, endDate, branch                    |                                            |
| **Salesperson Product Mix & Margin** | `SalespersonProductMixEntry { salesperson: string; productLine: string; avgProfitMargin: number; }`| `salespersonProductMix { salesperson productLine avgProfitMargin }`                                               | startDate, endDate, branch                    |                                            |
| **Top Customer Analysis Table**      | `TopCustomerEntry { cardName: string; salesAmount: number; grossProfit: number; }`               | `topCustomers { cardName salesAmount grossProfit }`                                                               | startDate, endDate, branch, n, itemNames, salesPersons, branchNames, productLine | Updated: field is `cardName` not `acctName` |
| **Customer Value Table**             | `CustomerValueEntry { cardName: string; salesAmount: number; grossProfit: number; }`            | `customerValue { cardName salesAmount grossProfit }`                                                              | startDate, endDate                            | Returns top customers by profitability    |
| **Monthly Sales Growth Chart**       | `MonthlySalesGrowthEntry { date: string; sales: number; }`                                       | `monthlySalesGrowth { date sales }`                                                                               | startDate, endDate                            |                                            |
| **Sales Target Attainment**          | `SalesTargetAttainment { attainmentPercentage: number; totalSales: number; target: number; }`     | `targetAttainment { attainmentPercentage totalSales target }`                                                     | startDate, endDate, target                    |                                            |
| **Product Performance**              | `ProductPerformanceEntry { product: string; sales: number; }`                                    | `productPerformance { product sales }`                                                                            | startDate, endDate, n                         |                                            |
| **Product Analytics**                | `ProductAnalyticsEntry { itemName: string; productLine: string; itemGroup: string; totalSales: number; totalQty: number; transactionCount: number; uniqueBranches: number; averagePrice: number; }` | `productAnalytics { itemName productLine itemGroup totalSales totalQty transactionCount uniqueBranches averagePrice }` | startDate, endDate                            | Updated: fields are camelCase in TS, snake_case in backend |
| **Branch Product Heatmap**           | `BranchProductHeatmapEntry { branch: string; product: string; sales: number; }`                  | `branchProductHeatmap { branch product sales }`                                                                   | startDate, endDate                            |                                            |
| **Branch Performance Table**         | `BranchPerformanceEntry { branch: string; totalSales: number; transactionCount: number; averageSale: number; uniqueCustomers: number; uniqueProducts: number; }` | `branchPerformance { branch totalSales transactionCount averageSale uniqueCustomers uniqueProducts }` | startDate, endDate                            | Updated: field names are camelCase in TS  |
| **Branch List**                      | `string[]`                                                                                       | `branchList`                                                                                                      | startDate, endDate                            | Returns array of branch names             |
| **Branch Growth**                    | `BranchGrowthEntry { branch: string; monthYear: string; monthlySales: number; growthPct: number; }`| `branchGrowth { branch monthYear monthlySales growthPct }`                                                        | startDate, endDate                            | Updated: field names camelCase in TS      |
| **Sales Performance**                | `SalesPerformanceEntry { salesperson: string; totalSales: number; transactionCount: number; averageSale: number; uniqueBranches: number; uniqueProducts: number; }` | `salesPerformance { salesperson totalSales transactionCount averageSale uniqueBranches uniqueProducts }` | startDate, endDate                            | Updated: field names camelCase in TS      |
| **Revenue Summary**                  | `RevenueSummary { totalRevenue: number; totalTransactions: number; averageTransaction: number; uniqueProducts: number; uniqueBranches: number; uniqueEmployees: number; }` | `revenueSummary { totalRevenue totalTransactions averageTransaction uniqueProducts uniqueBranches uniqueEmployees }` | startDate, endDate                            | Updated: more fields now returned         |
| **Data Range**                       | `DataRange { earliestDate: string; latestDate: string; totalRecords: number; }`                  | `dataRange { earliestDate latestDate totalRecords }`                                                              | None                                          |                                            |
| **Margin Trends**                    | `MarginTrendEntry { date: string; marginPct: number; }`                                             | `marginTrends { date marginPct }`                                                                                    | startDate, endDate                            | Updated: field is `marginPct`             |
| **Profitability by Dimension**       | `ProfitabilityByDimensionEntry { dimension: string; grossMargin: number; grossProfit: number; }` | `profitabilityByDimension { dimension grossMargin grossProfit }`                                                  | startDate, endDate, dimension                 | Dimension: Branch, ProductLine, etc.      |
| **Returns Analysis**                 | `ReturnsAnalysisEntry { reason: string; count: number; }`                                         | `returnsAnalysis { reason count }`                                                                               | startDate, endDate, itemNames, salesPersons, branchNames, branch, productLine, mockData | Returns reasons for returns               |

---

## 2. Error Envelope Structure (GraphQL)

All GraphQL errors are returned in a consistent envelope, as described in `log.md`:

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
- **Field Name Mapping:** GraphQL schema and codegen use camelCase for TypeScript, but backend/REST may use snake_case. Always use camelCase in frontend code.
- **Component–Query Mapping:** Each chart/table/KPI should use the correct query and data type. Do not mix ProductAnalytics with ProductPerformance, etc.
- **Filters:** All filters (date, branch, productLine, etc.) are managed via FilterContext and passed to queries as needed. Defaults are set in FilterContext.

---

## 4. Filter Arguments Reference

| **Filter Argument** | **Type**   | **Description**                                 | **Default**         |
|--------------------|------------|-------------------------------------------------|---------------------|
| startDate          | string     | Start date for filtering (YYYY-MM-DD)           | "2024-01-01"       |
| endDate            | string     | End date for filtering (YYYY-MM-DD)             | "2024-12-31"       |
| branch             | string     | Branch name (optional)                          | None                |
| productLine        | string     | Product line (optional)                         | None                |
| n                  | int        | Number of top results to return (for rankings)  | 5 or 10 (see query) |
| target             | float      | Sales target (for attainment queries)            | 0.0                 |
| dimension          | string     | Dimension for profitability (e.g., Branch)      | "Branch"           |
| itemNames          | [string]   | List of item names (for filtering)              | None                |
| salesPersons       | [string]   | List of salesperson names (for filtering)       | None                |
| branchNames        | [string]   | List of branch names (for filtering)            | None                |
| mockData           | boolean    | Use mock data (for testing)                     | false               |

---

**For any changes to frontend data needs or backend schema, update this mapping and communicate with both teams.** 