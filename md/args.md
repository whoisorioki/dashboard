# Arguments & Parameters Reference: Frontend ↔ Backend ↔ Druid

This document provides a comprehensive mapping of all arguments and parameters used between the frontend and backend for dashboard visualization, as well as the backend’s expectations and calculations for each analytics query. **All field names below match the actual backend output (case-sensitive, as returned by the REST API).**

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
| `start_date`     | string  | Start date (YYYY-MM-DD)                     | Required/optional per query  |
| `end_date`       | string  | End date (YYYY-MM-DD)                       | Required/optional per query  |
| `branch`         | string  | Branch name                                | Optional                     |
| `product_line`   | string  | Product line                               | Optional                     |
| `n`              | int     | Number of top results (for rankings)        | 5 or 10                      |
| `target`         | float   | Sales target (for attainment queries)       | 0.0                          |
| `dimension`      | string  | Dimension for profitability (e.g., Branch)  | "Branch"                    |

---

## 3. Query/Metric Argument & Calculation Mapping

### 3.1 Monthly Sales Growth

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "date": "2024-06", "sales": 1500000.0 }
  ]
  ```
- **Notes:**
  - No `growth_pct` or `month_year` field in actual result.

---

### 3.2 Sales Target Attainment

- **Args:** `start_date`, `end_date`, `target`
- **Backend Output:**
  ```json
  { "total_sales": 123456.78, "attainment_percentage": 85.5 }
  ```
- **Notes:**
  - No `target` or camelCase keys in output.

---

### 3.3 Product Performance

- **Args:** `start_date`, `end_date`, `n`
- **Backend Output:**
  ```json
  [
    { "product": "Widget", "sales": 12345.67 }
  ]
  ```

---

### 3.4 Branch Product Heatmap

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "branch": "Nairobi", "product": "TVS", "sales": 12345.67 }
  ]
  ```

---

### 3.5 Branch Performance

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    {
      "Branch": "Nairobi",
      "total_sales": 12345.67,
      "transaction_count": 10,
      "average_sale": 1234.56,
      "unique_customers": 5,
      "unique_products": 3
    }
  ]
  ```
- **Notes:**
  - Field names are snake_case, and `Branch` is capitalized.

---

### 3.6 Branch List

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "Branch": "Nairobi", "total_sales": 12345.67, "last_activity": "2024-06-30" }
  ]
  ```
- **Notes:**
  - Not just a string; includes sales and last activity.

---

### 3.7 Branch Growth

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "Branch": "Nairobi", "month_year": "2024-06", "monthly_sales": 12345.67, "growth_pct": 12.5 }
  ]
  ```

---

### 3.8 Sales Performance

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    {
      "SalesPerson": "Jane Doe",
      "total_sales": 123456.78,
      "transaction_count": 10,
      "average_sale": 12345.67,
      "unique_branches": 2,
      "unique_products": 5
    }
  ]
  ```
- **Notes:**
  - Field names are snake_case, and `SalesPerson` is capitalized.

---

### 3.9 Product Analytics

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    {
      "ItemName": "Widget",
      "ProductLine": "TVS",
      "ItemGroup": "Units",
      "total_sales": 12345.67,
      "total_qty": 100,
      "transaction_count": 10,
      "unique_branches": 2,
      "average_price": 123.45
    }
  ]
  ```
- **Notes:**
  - All fields are present; use these names exactly.

---

### 3.10 Revenue Summary

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  {
    "total_revenue": 1234567.89,
    "total_transactions": 100,
    "average_transaction": 12345.67,
    "unique_products": 10,
    "unique_branches": 3,
    "unique_employees": 5
  }
  ```
- **Notes:**
  - All fields are snake_case.

---

### 3.11 Customer Value

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "cardName": "Wanjiku Mwangi", "salesAmount": 445702880.16, "grossProfit": 130900434.02 }
  ]
  ```
- **Notes:**
  - Field names are `cardName`, `salesAmount`, `grossProfit` (not `acctName`, `totalGrossRevenue`, etc).

---

### 3.12 Top Customers

- **Args:** `start_date`, `end_date`, `n`
- **Backend Output:**
  ```json
  [
    { "cardName": "Acme Corp", "salesAmount": 123456.78, "grossProfit": 23456.78 }
  ]
  ```
- **Notes:**
  - Field names are `cardName`, `salesAmount`, `grossProfit`.

---

### 3.13 Margin Trends

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "date": "2024-06", "marginPct": 12.5 }
  ]
  ```

---

### 3.14 Profitability by Dimension

- **Args:** `start_date`, `end_date`, `dimension`
- **Backend Output:**
  ```json
  [
    { "dimension": "Nairobi", "grossMargin": 0.25, "grossProfit": 12345.67 }
  ]
  ```

---

### 3.15 Returns Analysis

- **Args:** `start_date`, `end_date`
- **Backend Output:**
  ```json
  [
    { "reason": "Damaged", "count": 5 }
  ]
  ```

---

## 4. Error Envelope Structure

All API responses (REST/GraphQL) use a consistent envelope:
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
- **Field names are case-sensitive and match backend output exactly.**
- For any changes to arguments or schema, update this file and communicate with both teams. 