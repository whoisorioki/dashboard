# API Documentation: REST and GraphQL Endpoints

## Standardized Endpoint Documentation Template

### 1. monthlySalesGrowth (GraphQL/REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/monthly-sales-growth`
- **Arguments:**
  - `start_date` (string, required): Start date (YYYY-MM-DD)
  - `end_date` (string, required): End date (YYYY-MM-DD)
  - `mock_data` (bool, optional): Use mock data (default: false)
  - `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ date: string, sales: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/monthly-sales-growth?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "date": "2024-06-01", "sales": 123456.78 }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface MonthlySalesGrowthEntry {
    date: string;
    sales: number;
  }
  ```

---

### 2. salesTargetAttainment (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/sales-target-attainment`
- **Arguments:**
  - `target` (float, required): Sales target value
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: { attainment_percentage: number, total_sales: number, target: number } }`
- **Sample Request:**
  ```http
  GET /api/kpis/sales-target-attainment?target=1000000&start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": {
        "attainment_percentage": 85.5,
        "total_sales": 855000,
        "target": 1000000
      }
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `target`, `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface SalesTargetAttainment {
    attainment_percentage: number;
    total_sales: number;
    target: number;
  }
  ```

---

### 3. productPerformance (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/product-performance`
- **Arguments:**
  - `n` (int, optional, default 5): Top N products
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ product: string, sales: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/product-performance?n=5&start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "product": "Widget", "sales": 12345.67 }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `n`, `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface ProductPerformanceEntry {
    product: string;
    sales: number;
  }
  ```

---

### 4. branchProductHeatmap (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/branch-product-heatmap`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ branch: string, product: string, sales: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/branch-product-heatmap?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [
        { "branch": "Nairobi", "product": "Widget", "sales": 12345.67 }
      ]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface BranchProductHeatmapEntry {
    branch: string;
    product: string;
    sales: number;
  }
  ```

---

### 5. branchPerformance (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/branch-performance`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ branch: string, sales: number, transaction_count: number, average_sale: number, unique_customers: number, unique_products: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/branch-performance?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [
        {
          "branch": "Nairobi",
          "sales": 12345.67,
          "transaction_count": 10,
          "average_sale": 1234.56,
          "unique_customers": 5,
          "unique_products": 3
        }
      ]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface BranchPerformanceEntry {
    branch: string;
    sales: number;
    transaction_count: number;
    average_sale: number;
    unique_customers: number;
    unique_products: number;
  }
  ```

---

### 6. branchList (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/branch-list`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ branch: string }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/branch-list?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "branch": "Nairobi" }, { "branch": "Mombasa" }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface BranchListEntry {
    branch: string;
  }
  ```

---

### 7. branchGrowth (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/branch-growth`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ branch: string, growth: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/branch-growth?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "branch": "Nairobi", "growth": 12.5 }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface BranchGrowthEntry {
    branch: string;
    growth: number;
  }
  ```

---

### 8. salesPerformance (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/sales-performance`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ salesperson: string, sales: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/sales-performance?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "salesperson": "Jane Doe", "sales": 123456.78 }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface SalesPerformanceEntry {
    salesperson: string;
    sales: number;
  }
  ```

---

### 9. productAnalytics (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/product-analytics`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ product: string, analytics: string }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/product-analytics?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "product": "Widget", "analytics": "..." }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface ProductAnalyticsEntry {
    product: string;
    analytics: string;
  }
  ```

---

### 10. revenueSummary (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/revenue-summary`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: { total_revenue: number, total_transactions: number, average_transaction: number, unique_products: number, unique_branches: number, unique_employees: number } }`
- **Sample Request:**
  ```http
  GET /api/kpis/revenue-summary?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": {
        "total_revenue": 1234567.89,
        "total_transactions": 100,
        "average_transaction": 12345.67,
        "unique_products": 10,
        "unique_branches": 3,
        "unique_employees": 5
      }
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface RevenueSummary {
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    unique_products: number;
    unique_branches: number;
    unique_employees: number;
  }
  ```

---

### 11. customerValue (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/customer-value`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ acctName: string, total_gross_revenue: number, total_net_profit: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/customer-value?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [
        {
          "acctName": "Acme Corp",
          "total_gross_revenue": 120000,
          "total_net_profit": 35000
        }
      ]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface CustomerValueEntry {
    acctName: string;
    total_gross_revenue: number;
    total_net_profit: number;
  }
  ```

---

### 12. employeePerformance (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/employee-performance`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data` (required)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ employee: string, total_sales: number, quota: number, attainment_pct: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/employee-performance?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [
        {
          "employee": "Jane Doe",
          "total_sales": 123456.78,
          "quota": 100000,
          "attainment_pct": 123.5
        }
      ]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `mock_data`
- **TypeScript Mapping:**
  ```ts
  interface EmployeePerformanceEntry {
    employee: string;
    total_sales: number;
    quota: number;
    attainment_pct: number;
  }
  ```

---

### 13. topCustomers (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/top-customers`
- **Arguments:**
  - `start_date`, `end_date`, `n` (int, optional, default 5), `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ acctName: string, salesAmount: number, grossProfit: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/top-customers?start_date=2024-06-01&end_date=2024-06-30&n=5
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [
        {
          "acctName": "Acme Corp",
          "salesAmount": 123456.78,
          "grossProfit": 23456.78
        }
      ]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `n`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface TopCustomerEntry {
    acctName: string;
    salesAmount: number;
    grossProfit: number;
  }
  ```

---

### 14. marginTrends (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/margin-trends`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ date: string, marginPct: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/margin-trends?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "date": "2024-06-01", "marginPct": 12.5 }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface MarginTrendEntry {
    date: string;
    marginPct: number;
  }
  ```

---

### 15. profitabilityByDimension (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/profitability-by-dimension`
- **Arguments:**
  - `dimension` (string, optional, default "Branch")
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ dimension: string, grossMargin: number, grossProfit: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/profitability-by-dimension?dimension=Branch&start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [
        { "dimension": "Nairobi", "grossMargin": 0.25, "grossProfit": 12345.67 }
      ]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `dimension`, `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface ProfitabilityByDimensionEntry {
    dimension: string;
    grossMargin: number;
    grossProfit: number;
  }
  ```

---

### 16. returnsAnalysis (REST)

- **Endpoint/Query:**
  - REST: `/api/kpis/returns-analysis`
- **Arguments:**
  - `start_date`, `end_date`, `mock_data`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line` (optional filters)
- **Returns/Schema:**
  - `{ using_mock_data: boolean, result: Array<{ reason: string, count: number }> }`
- **Sample Request:**
  ```http
  GET /api/kpis/returns-analysis?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": {
      "using_mock_data": false,
      "result": [{ "reason": "Damaged", "count": 5 }]
    },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Filters:**
  - `start_date`, `end_date`, `item_names`, `sales_persons`, `branch_names`, `branch`, `product_line`
- **TypeScript Mapping:**
  ```ts
  interface ReturnsAnalysisEntry {
    reason: string;
    count: number;
  }
  ```

---

## GraphQL Endpoint

### `/graphql` (POST)

- **Description:** Unified GraphQL endpoint for all analytics queries.
- **Usage:** Send GraphQL queries/mutations to this endpoint.
- **Authentication:** Same as REST (if applicable).

#### Example Query

```graphql
query {
  salespersonLeaderboard(startDate: "2023-01-01", endDate: "2023-12-31") {
    salesperson
    salesAmount
    grossProfit
  }
  productProfitability(startDate: "2023-01-01", endDate: "2023-12-31") {
    productLine
    itemName
    grossProfit
  }
  topCustomers(n: 5) {
    acctName
    salesAmount
    grossProfit
  }
}
```

#### Available Queries & Arguments

| Query Name                 | Arguments (all optional unless noted) | Returns/Schema                    |
| -------------------------- | ------------------------------------- | --------------------------------- |
| `salespersonLeaderboard`   | startDate, endDate, branch            | `[SalespersonLeaderboardEntry]`   |
| `productProfitability`     | startDate, endDate, branch            | `[ProductProfitabilityEntry]`     |
| `salespersonProductMix`    | startDate, endDate, branch            | `[SalespersonProductMixEntry]`    |
| `topCustomers`             | startDate, endDate, branch, n         | `[TopCustomerEntry]`              |
| `monthlySalesGrowth`       | startDate, endDate                    | `[MonthlySalesGrowthEntry]`       |
| `salesTargetAttainment`    | startDate, endDate, target            | `SalesTargetAttainment`           |
| `productPerformance`       | startDate, endDate, n                 | `[ProductPerformanceEntry]`       |
| `branchProductHeatmap`     | startDate, endDate                    | `[BranchProductHeatmapEntry]`     |
| `branchPerformance`        | startDate, endDate                    | `[BranchPerformanceEntry]`        |
| `branchList`               | startDate, endDate                    | `[String]`                        |
| `branchGrowth`             | startDate, endDate                    | `[BranchGrowthEntry]`             |
| `salesPerformance`         | startDate, endDate                    | `[SalesPerformanceEntry]`         |
| `productAnalytics`         | startDate, endDate                    | `[ProductAnalyticsEntry]`         |
| `revenueSummary`           | startDate, endDate                    | `RevenueSummary`                  |
| `dataRange`                |                                       | `DataRange`                       |
| `marginTrends`             | startDate, endDate                    | `[MarginTrendEntry]`              |
| `profitabilityByDimension` | startDate, endDate, dimension         | `[ProfitabilityByDimensionEntry]` |

#### GraphQL Types (Schema)

- See backend/main.py for full type definitions. Key types include:
  - `SalespersonLeaderboardEntry { salesperson, salesAmount, grossProfit }`
  - `ProductProfitabilityEntry { productLine, itemName, grossProfit }`
  - `SalespersonProductMixEntry { salesperson, productLine, avgProfitMargin }`
  - `TopCustomerEntry { acctName, salesAmount, grossProfit }`
  - ...and all other analytics types as implemented.

#### Filters

- All analytics queries accept filters as arguments: `startDate`, `endDate`, `branch`, `productLine`, etc.
- Default values are provided if not specified.

#### Error Handling

- All errors are returned in a consistent envelope as described in `log.md`.
- GraphQL errors are logged and returned with a clear message and code.

---

## REST Endpoints

- All previous REST endpoints remain available for backward compatibility.
- See previous documentation for details on each REST endpoint.

---

**Note:**

- The GraphQL API is the recommended interface for new analytics and dashboard features.
- For full schema and query examples, see backend/main.py and the GraphQL playground at `/graphql`.

---

## Non-KPI Endpoints

### 1. Health Check (REST)

- **Endpoint/Query:**
  - REST: `/api/health`
- **Arguments:**
  - None
- **Returns/Schema:**
  - `{ status: "ok" }`
- **Sample Request:**
  ```http
  GET /api/health
  ```
- **Sample Response:**
  ```json
  {
    "data": { "status": "ok" },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **TypeScript Mapping:**
  ```ts
  interface HealthResponse {
    status: string;
  }
  ```

---

### 2. Druid Health Check (REST)

- **Endpoint/Query:**
  - REST: `/api/health/druid`
- **Arguments:**
  - None
- **Returns/Schema:**
  - `{ druid_status: "connected" | "disconnected", is_available: boolean }`
- **Sample Request:**
  ```http
  GET /api/health/druid
  ```
- **Sample Response:**
  ```json
  {
    "data": { "druid_status": "connected", "is_available": true },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **TypeScript Mapping:**
  ```ts
  interface DruidHealthResponse {
    druid_status: string;
    is_available: boolean;
  }
  ```

---

### 3. Druid Datasources (REST)

- **Endpoint/Query:**
  - REST: `/api/druid/datasources`
- **Arguments:**
  - None
- **Returns/Schema:**
  - `{ datasources: string[], count: number }`
- **Sample Request:**
  ```http
  GET /api/druid/datasources
  ```
- **Sample Response:**
  ```json
  {
    "data": { "datasources": ["sales_analytics"], "count": 1 },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **TypeScript Mapping:**
  ```ts
  interface DruidDatasourcesResponse {
    datasources: string[];
    count: number;
  }
  ```

---

### 4. Raw Sales Data (REST)

- **Endpoint/Query:**
  - REST: `/api/sales`
- **Arguments:**
  - `start_date`, `end_date` (required)
  - `item_names`, `sales_persons`, `branch_names`, `ignore_mock_data` (optional filters)
- **Returns/Schema:**
  - `Array<SalesRecord>` (see below)
- **Sample Request:**
  ```http
  GET /api/sales?start_date=2024-06-01&end_date=2024-06-30
  ```
- **Sample Response:**
  ```json
  {
    "data": [ { "__time": "2024-06-01T00:00:00Z", "ProductLine": "TVS", "Branch": "Nairobi", ... } ],
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **TypeScript Mapping:**
  ```ts
  interface SalesRecord {
    __time: string;
    ProductLine: string;
    ItemGroup: string;
    Branch: string;
    SalesPerson: string;
    AcctName: string;
    ItemName: string;
    CardName: string;
    grossRevenue: number;
    returnsValue: number;
    unitsSold: number;
    unitsReturned: number;
    totalCost: number;
    lineItemCount: number;
  }
  ```

---

### 5. Data Range (REST)

- **Endpoint/Query:**
  - REST: `/api/data-range`
- **Arguments:**
  - None
- **Returns/Schema:**
  - `Array<{ earliest_date: string, latest_date: string, total_records: number }>`
- **Sample Request:**
  ```http
  GET /api/data-range
  ```
- **Sample Response:**
  ```json
  {
    "data": [
      {
        "earliest_date": "2023-01-01T00:00:00.000Z",
        "latest_date": "2025-06-01T00:00:00.000Z",
        "total_records": 51685
      }
    ],
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **TypeScript Mapping:**
  ```ts
  interface DataRange {
    earliest_date: string;
    latest_date: string;
    total_records: number;
  }
  ```

---

### 6. User Activity Tracking (REST)

- **Endpoint/Query:**
  - REST: `/api/user-activity`
- **Arguments:**
  - POST body: `{ user_id?: string, action: string, timestamp: string, user_agent?: string, ip_address?: string }`
- **Returns/Schema:**
  - `{ status: "success", message: string }`
- **Sample Request:**
  ```http
  POST /api/user-activity
  Content-Type: application/json
  {
    "user_id": "abc123",
    "action": "login",
    "timestamp": "2024-06-01T12:00:00Z",
    "user_agent": "Mozilla/5.0",
    "ip_address": "auto"
  }
  ```
- **Sample Response:**
  ```json
  {
    "data": { "status": "success", "message": "Activity tracked" },
    "error": null,
    "metadata": { "requestId": "..." }
  }
  ```
- **Error Envelope:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **TypeScript Mapping:**
  ```ts
  interface UserActivityRequest {
    user_id?: string;
    action: string;
    timestamp: string;
    user_agent?: string;
    ip_address?: string;
  }
  interface UserActivityResponse {
    status: string;
    message: string;
  }
  ```

---
