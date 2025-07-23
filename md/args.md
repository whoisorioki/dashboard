# Arguments & Parameters Reference: Frontend ↔ Backend ↔ Druid

This document provides a comprehensive mapping of all arguments and parameters used between the frontend and backend for dashboard visualization, as well as the backend’s expectations and calculations for each analytics query. **All field names below match the actual backend output (case-sensitive, as returned by the GraphQL API).**

---

## 1. Druid Source Schema (Reference)

| Field           | Type     | Description                  |
|-----------------|----------|------------------------------|
| `__time`        | datetime | Transaction timestamp        |
| `ProductLine`   | string   | Product line/category        |
| `ItemGroup`     | string   | Product group                |
| `Branch`        | string   | Branch/location              |
| `SalesPerson`   | string   | Salesperson name             |
| `AcctName`      | string   | Account/customer name        |
| `ItemName`      | string   | Product/item name            |
| `CardName`      | string   | Customer card name           |
| `grossRevenue`  | float    | Gross revenue (KES)          |
| `returnsValue`  | float    | Value of returns (KES)       |
| `unitsSold`     | float    | Units sold                   |
| `unitsReturned` | float    | Units returned               |
| `totalCost`     | float    | Total cost (KES)             |
| `lineItemCount` | int      | Line item count              |

---

## 2. Common Filter Arguments

| Argument         | Type    | Description                                 | Default/Notes                |
|------------------|---------|---------------------------------------------|------------------------------|
| `startDate`      | string  | Start date (YYYY-MM-DD)                     | Required/optional per query  |
| `endDate`        | string  | End date (YYYY-MM-DD)                       | Required/optional per query  |
| `branch`         | string  | Branch name                                | Optional                     |
| `productLine`    | string  | Product line                               | Optional                     |
| `n`              | int     | Number of top results (for rankings)        | 5 or 10                      |
| `target`         | float   | Sales target (for attainment queries)       | 0.0                          |
| `dimension`      | string  | Dimension for profitability (e.g., Branch)  | "Branch"                    |

---

## 3. Query/Metric Argument & Calculation Mapping

All field names and arguments are camelCase in the GraphQL API and TypeScript types. For Druid-level or legacy details, see the Druid schema above.

### 3.1 Monthly Sales Growth

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "date": "2024-06", "sales": 1500000.0 }
  ]
  ```

---

### 3.2 Sales Target Attainment

- **Args:** `startDate`, `endDate`, `target`
- **Backend Output:**
  ```json
  { "totalSales": 123456.78, "attainmentPercentage": 85.5 }
  ```

---

### 3.3 Product Performance

- **Args:** `startDate`, `endDate`, `n`
- **Backend Output:**
  ```json
  [
    { "product": "Widget", "sales": 12345.67 }
  ]
  ```

---

### 3.4 Branch Product Heatmap

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "branch": "Nairobi", "product": "TVS", "sales": 12345.67 }
  ]
  ```

---

### 3.5 Branch Performance

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    {
      "branch": "Nairobi",
      "totalSales": 12345.67,
      "transactionCount": 10,
      "averageSale": 1234.56,
      "uniqueCustomers": 5,
      "uniqueProducts": 3
    }
  ]
  ```

---

### 3.6 Branch List

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "branch": "Nairobi", "totalSales": 12345.67, "lastActivity": "2024-06-30" }
  ]
  ```

---

### 3.7 Branch Growth

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "branch": "Nairobi", "monthYear": "2024-06", "monthlySales": 12345.67, "growthPct": 12.5 }
  ]
  ```

---

### 3.8 Sales Performance

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    {
      "salesPerson": "Jane Doe",
      "totalSales": 123456.78,
      "transactionCount": 10,
      "averageSale": 12345.67,
      "uniqueBranches": 2,
      "uniqueProducts": 5
    }
  ]
  ```

---

### 3.9 Product Analytics

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    {
      "itemName": "Widget",
      "productLine": "TVS",
      "itemGroup": "Units",
      "totalSales": 12345.67,
      "totalQty": 100,
      "transactionCount": 10,
      "uniqueBranches": 2,
      "averagePrice": 123.45
    }
  ]
  ```

---

### 3.10 Revenue Summary

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  {
    "totalRevenue": 1234567.89,
    "totalTransactions": 100,
    "averageTransaction": 12345.67,
    "uniqueProducts": 10,
    "uniqueBranches": 3,
    "uniqueEmployees": 5
  }
  ```

---

### 3.11 Customer Value

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "cardName": "Wanjiku Mwangi", "salesAmount": 445702880.16, "grossProfit": 130900434.02 }
  ]
  ```

---

### 3.12 Top Customers

- **Args:** `startDate`, `endDate`, `n`
- **Backend Output:**
  ```json
  [
    { "cardName": "Acme Corp", "salesAmount": 123456.78, "grossProfit": 23456.78 }
  ]
  ```

---

### 3.13 Margin Trends

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "date": "2024-06", "marginPct": 12.5 }
  ]
  ```

---

### 3.14 Profitability by Dimension

- **Args:** `startDate`, `endDate`, `dimension`
- **Backend Output:**
  ```json
  [
    { "dimension": "Nairobi", "grossMargin": 0.25, "grossProfit": 12345.67 }
  ]
  ```

---

### 3.15 Returns Analysis

- **Args:** `startDate`, `endDate`
- **Backend Output:**
  ```json
  [
    { "reason": "Damaged", "count": 5 }
  ]
  ```

---

## 4. Error Envelope Structure

All API responses (GraphQL) use a consistent envelope:
```json
{
  "data": ...,
  "error": { "code": "ERROR_CODE", "message": "..." } | null,
  "metadata": { "requestId": "..." }
}
```

---

## 5. Notes & Best Practices
- All monetary values are in Kenyan Shillings (KES).
- All dates are ISO 8601 strings.
- All filters are optional unless otherwise noted; defaults are set in the backend.
- **Field names are case-sensitive and match backend output exactly (camelCase for GraphQL/TypeScript).**
- For any changes to arguments or schema, update this file, [frontend_mapping.md](frontend_mapping.md), and [api.md](api.md), and communicate with both teams. 