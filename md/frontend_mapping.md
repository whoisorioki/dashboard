# Frontend–Backend Mapping: GraphQL Analytics API

This document provides a detailed mapping between frontend dashboard components, their expected data structures (TypeScript interfaces), the corresponding GraphQL queries, output fields (including nested fields), error envelope structure, and accepted filter arguments. Use this as a contract to ensure seamless integration and rapid troubleshooting.

---

## 1. Mapping Table: Component ↔️ GraphQL Output

| **Component**                        | **TypeScript Interface**                                                                 | **GraphQL Query & Output Fields**                                                                                 | **Filters (Arguments)**                        | **Notes**                                 |
|--------------------------------------|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|------------------------------------------------|-------------------------------------------|
| **Salesperson Leaderboard**          | `SalespersonLeaderboardEntry { salesperson: string; salesAmount: number; grossProfit: number; }` | `salespersonLeaderboard { salesperson salesAmount grossProfit }`                                                  | startDate, endDate, branch                    | Returns array of entries                  |
| **Product/Product Line Profitability**| `ProductProfitabilityEntry { productLine: string; itemName: string; grossProfit: number; }`      | `productProfitability { productLine itemName grossProfit }`                                                       | startDate, endDate, branch                    |                                            |
| **Salesperson Product Mix & Margin** | `SalespersonProductMixEntry { salesperson: string; productLine: string; avgProfitMargin: number; }`| `salespersonProductMix { salesperson productLine avgProfitMargin }`                                               | startDate, endDate, branch                    |                                            |
| **Top Customer Analysis Table**      | `TopCustomerEntry { acctName: string; salesAmount: number; grossProfit: number; }`               | `topCustomers { acctName salesAmount grossProfit }`                                                               | startDate, endDate, branch, n                 |                                            |
| **Monthly Sales Growth Chart**       | `MonthlySalesGrowthEntry { date: string; sales: number; }`                                       | `monthlySalesGrowth { date sales }`                                                                               | startDate, endDate                            |                                            |
| **Sales Target Attainment**          | `SalesTargetAttainment { attainmentPercentage: number; totalSales: number; target: number; }`     | `salesTargetAttainment { attainmentPercentage totalSales target }`                                                | startDate, endDate, target                    |                                            |
| **Product Performance**              | `ProductPerformanceEntry { product: string; sales: number; }`                                    | `productPerformance { product sales }`                                                                            | startDate, endDate, n                         |                                            |
| **Branch Product Heatmap**           | `BranchProductHeatmapEntry { branch: string; product: string; sales: number; }`                  | `branchProductHeatmap { branch product sales }`                                                                   | startDate, endDate                            |                                            |
| **Branch Performance Table**         | `BranchPerformanceEntry { branch: string; sales: number; transactionCount: number; averageSale: number; uniqueCustomers: number; uniqueProducts: number; }` | `branchPerformance { branch sales transactionCount averageSale uniqueCustomers uniqueProducts }` | startDate, endDate                            |                                            |
| **Branch List**                      | `string[]`                                                                                       | `branchList`                                                                                                      | startDate, endDate                            | Returns array of branch names             |
| **Branch Growth**                    | `BranchGrowthEntry { branch: string; growth: number; }`                                          | `branchGrowth { branch growth }`                                                                                  | startDate, endDate                            |                                            |
| **Sales Performance**                | `SalesPerformanceEntry { salesperson: string; sales: number; }`                                  | `salesPerformance { salesperson sales }`                                                                          | startDate, endDate                            |                                            |
| **Product Analytics**                | `ProductAnalyticsEntry { product: string; analytics: string; }`                                  | `productAnalytics { product analytics }`                                                                          | startDate, endDate                            | Analytics field can be expanded           |
| **Revenue Summary**                  | `RevenueSummary { totalRevenue: number; totalCost: number; grossProfit: number; }`               | `revenueSummary { totalRevenue totalCost grossProfit }`                                                           | startDate, endDate                            |                                            |
| **Data Range**                       | `DataRange { earliestDate: string; latestDate: string; totalRecords: number; }`                  | `dataRange { earliestDate latestDate totalRecords }`                                                              | None                                          |                                            |
| **Margin Trends**                    | `MarginTrendEntry { date: string; margin: number; }`                                             | `marginTrends { date margin }`                                                                                    | startDate, endDate                            |                                            |
| **Profitability by Dimension**       | `ProfitabilityByDimensionEntry { dimension: string; grossMargin: number; grossProfit: number; }` | `profitabilityByDimension { dimension grossMargin grossProfit }`                                                  | startDate, endDate, dimension                 | Dimension: Branch, ProductLine, etc.      |

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

---

**For any changes to frontend data needs or backend schema, update this mapping and communicate with both teams.** 