# Sales Analytics Metrics Report

---

## 1. Data Schema (Druid → Backend → Frontend)

**Druid/Backend Schema:**

| Column        | Type     | Description            |
| ------------- | -------- | ---------------------- |
| __time        | datetime | Transaction timestamp  |
| ProductLine   | string   | Product line/category  |
| ItemGroup     | string   | Product group          |
| Branch        | string   | Branch/location        |
| SalesPerson   | string   | Salesperson name       |
| AcctName      | string   | Account/customer name  |
| ItemName      | string   | Product/item name      |
| CardName      | string   | Customer card name     |
| grossRevenue  | float    | Gross revenue (KES)    |
| returnsValue  | float    | Value of returns (KES) |
| unitsSold     | float    | Units sold             |
| unitsReturned | float    | Units returned         |
| totalCost     | float    | Total cost (KES)       |
| lineItemCount | int      | Line item count        |

See also: [druid_pipeline.md](druid_pipeline.md), [data_patterns.md](data_patterns.md)

---

## 2. KPI Calculations & Methods

All backend and frontend data fetching is now via GraphQL and Druid SQL, with REST and Recharts deprecated. All contracts are enforced via codegen and mapping docs.

### 2.1 Monthly Sales Growth

- **Function:** `calculate_monthly_sales_growth(df)`
- **Columns Used:** `__time`, `grossRevenue`
- **Calculation:**
  - Group by month (`__time`), sum `grossRevenue` per month.
  - Output: `[ { date: YYYY-MM, sales: number } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { date: YYYY-MM, sales: number } ]`
- **Frontend Format:** Same (see [frontend_mapping.md](frontend_mapping.md))

### 2.2 Sales Target Attainment

- **Function:** `calculate_sales_target_attainment(df, target)`
- **Columns Used:** `grossRevenue`
- **Calculation:**
  - Sum `grossRevenue` for period.
  - Attainment % = (totalSales / target) * 100
  - Output: `{ totalSales: number, attainmentPercentage: number }`
- **Filters:** `startDate`, `endDate`, `target`, others optional
- **Backend Format:** `{ totalSales: number, attainmentPercentage: number }`
- **Frontend Format:** Same

### 2.3 Product Performance

- **Function:** `get_product_performance(df, n)`
- **Columns Used:** `ItemName`, `grossRevenue`
- **Calculation:**
  - Group by `ItemName`, sum `grossRevenue`, sort, take top/bottom N.
  - Output: `[ { product: string, sales: number } ]`
- **Filters:** `startDate`, `endDate`, `n`, others optional
- **Backend Format:** `[ { product: string, sales: number } ]`
- **Frontend Format:** Same

### 2.4 Branch Product Heatmap

- **Function:** `create_branch_product_heatmap_data(df)`
- **Columns Used:** `Branch`, `ProductLine`, `ItemName`, `grossRevenue`
- **Calculation:**
  - Clean `ProductLine`, group by `Branch` and product, sum `grossRevenue`.
  - Output: `[ { branch: string, product: string, sales: number } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { branch: string, product: string, sales: number } ]`
- **Frontend Format:** Same

### 2.5 Branch Performance

- **Function:** `calculate_branch_performance(df)`
- **Columns Used:** `Branch`, `grossRevenue`, `SalesPerson`, `ItemName`
- **Calculation:**
  - Group by `Branch`, aggregate: sum `grossRevenue`, count transactions, mean sale, unique customers/products.
  - Output: `[ { branch: string, totalSales: number, transactionCount: int, averageSale: number, uniqueCustomers: int, uniqueProducts: int } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { branch: string, ... } ]`
- **Frontend Format:** See [frontend_mapping.md](frontend_mapping.md)

### 2.6 Branch List

- **Function:** `get_branch_list(df)`
- **Columns Used:** `Branch`, `grossRevenue`, `__time`
- **Calculation:**
  - Group by `Branch`, sum `grossRevenue`, get last activity date.
  - Output: `[ { branch: string, totalSales: number, lastActivity: string } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { branch: string, ... } ]`
- **Frontend Format:** Same

### 2.7 Branch Growth

- **Function:** `calculate_branch_growth(df)`
- **Columns Used:** `Branch`, `__time`, `grossRevenue`
- **Calculation:**
  - Group by `Branch` and month, sum `grossRevenue`, calculate % change month-over-month.
  - Output: `[ { branch: string, monthYear: string, monthlySales: number, growthPct: number } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { branch: string, monthYear: string, monthlySales: number, growthPct: number } ]`
- **Frontend Format:** Same

### 2.8 Sales Performance

- **Function:** `get_sales_performance(df)`
- **Columns Used:** `SalesPerson`, `grossRevenue`, `Branch`, `ItemName`
- **Calculation:**
  - Group by `SalesPerson`, aggregate: sum `grossRevenue`, count, mean, unique branches/products.
  - Output: `[ { salesPerson: string, ... } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { salesPerson: string, ... } ]`
- **Frontend Format:** See [frontend_mapping.md](frontend_mapping.md)

### 2.9 Product Analytics

- **Function:** `get_product_analytics(df)`
- **Columns Used:** `ItemName`, `ProductLine`, `ItemGroup`, `grossRevenue`, `unitsSold`, `Branch`
- **Calculation:**
  - Group by `ItemName`, `ProductLine`, `ItemGroup`, aggregate sales, qty, count, unique branches, avg price.
  - Output: `[ { itemName: string, productLine: string, ... } ]`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `[ { itemName: string, productLine: string, ... } ]`
- **Frontend Format:** See [frontend_mapping.md](frontend_mapping.md)

### 2.10 Revenue Summary

- **Function:** `calculate_revenue_summary(df)`
- **Columns Used:** `grossRevenue`, `ItemName`, `Branch`, `SalesPerson`
- **Calculation:**
  - Sum/aggregate overall revenue, transactions, unique products/branches/employees, avg transaction.
  - Output: `{ totalRevenue, totalTransactions, averageTransaction, uniqueProducts, uniqueBranches, uniqueEmployees }`
- **Filters:** `startDate`, `endDate`, others optional
- **Backend Format:** `{ ... }`
- **Frontend Format:** See [frontend_mapping.md](frontend_mapping.md)

---

## 3. Filters & Result Formats

- **Common Filters:** `startDate`, `endDate`, `branch`, `productLine`, `itemNames`, `salesPersons`, `n`, `target`
- **Backend Result Envelope:**
  ```json
  { "data": { "usingMockData": false, "result": ... }, "error": null, "metadata": { "requestId": "..." } }
  ```
- **Frontend Expected Format:**
  - See [frontend_mapping.md](frontend_mapping.md) for TypeScript interfaces and mapping.
  - All values in KES, dates as ISO strings or `YYYY-MM`.

---

## 4. Cross-References

- **API Endpoints & Arguments:** See [api.md](api.md)
- **Data Patterns & Flow:** See [data_patterns.md](data_patterns.md)
- **Druid Pipeline:** See [druid_pipeline.md](druid_pipeline.md)
- **Frontend Mapping:** See [frontend_mapping.md](frontend_mapping.md)

---

## 5. Notes

- All calculations are robust to empty data, NaN/infinite values, and missing columns.
- All filters are optional but default to full available data if not provided.
- Backend and frontend formats are kept in sync via codegen and mapping docs.
- For any changes, update this file and cross-referenced docs.
- All contracts are enforced via codegen and mapping docs. Keep this file in sync with [backend_report.md], [frontend_report.md], and [api.md].
