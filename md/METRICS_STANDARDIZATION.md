# Metrics Standardization: Single Source of Truth

## 🎯 **Overview**

This document serves as the **single source of truth** for all metrics in the Sales Analytics Dashboard. It consolidates standardized metric definitions, calculation formulas, frontend usage guidelines, backend implementation details, and naming conventions.

## 📊 **Standardized Metric Definitions**

### **Core Revenue Metrics**

| Metric Name         | Backend Field                        | Frontend Key                       | Description                                  | Calculation                                       |
| ------------------- | ------------------------------------ | ---------------------------------- | -------------------------------------------- | ------------------------------------------------- |
| `totalRevenue`      | `grossRevenue`                       | `METRIC_NAMES.TOTAL_REVENUE`       | Gross revenue before any deductions          | `pl.sum("grossRevenue")`                          |
| `netSales`          | `grossRevenue + returnsValue`        | `METRIC_NAMES.NET_SALES`           | Revenue after returns and adjustments        | `pl.sum("grossRevenue") + pl.sum("returnsValue")` |
| `totalSales`        | `grossRevenue + returnsValue`        | `METRIC_NAMES.TOTAL_SALES`         | Alias for net sales (backward compatibility) | `pl.sum("grossRevenue") + pl.sum("returnsValue")` |
| `grossProfit`       | `grossRevenue - totalCost`           | `METRIC_NAMES.GROSS_PROFIT`        | Revenue minus cost of goods sold             | `pl.sum("grossRevenue") - pl.sum("totalCost")`    |
| `grossProfitMargin` | `(grossProfit / totalRevenue) * 100` | `METRIC_NAMES.GROSS_PROFIT_MARGIN` | Gross profit as percentage of revenue        | `(grossProfit / totalRevenue) * 100`              |

### **Transaction & Volume Metrics**

| Metric Name         | Backend Field               | Frontend Key                      | Description                  | Calculation                                     |
| ------------------- | --------------------------- | --------------------------------- | ---------------------------- | ----------------------------------------------- |
| `totalTransactions` | `lineItemCount`             | `METRIC_NAMES.TOTAL_TRANSACTIONS` | Total number of transactions | `pl.sum("lineItemCount")`                       |
| `unitsSold`         | `unitsSold`                 | `METRIC_NAMES.UNITS_SOLD`         | Total units sold             | `pl.sum("unitsSold")`                           |
| `unitsReturned`     | `unitsReturned`             | `METRIC_NAMES.UNITS_RETURNED`     | Total units returned         | `pl.sum("unitsReturned")`                       |
| `netUnitsSold`      | `unitsSold + unitsReturned` | `METRIC_NAMES.NET_UNITS_SOLD`     | Net units (sold + returned)  | `pl.sum("unitsSold") + pl.sum("unitsReturned")` |

### **Unique Count Metrics**

| Metric Name       | Backend Field | Frontend Key                    | Description                | Calculation                  |
| ----------------- | ------------- | ------------------------------- | -------------------------- | ---------------------------- |
| `uniqueProducts`  | `ItemName`    | `METRIC_NAMES.UNIQUE_PRODUCTS`  | Number of unique products  | `pl.n_unique("ItemName")`    |
| `uniqueBranches`  | `Branch`      | `METRIC_NAMES.UNIQUE_BRANCHES`  | Number of unique branches  | `pl.n_unique("Branch")`      |
| `uniqueEmployees` | `SalesPerson` | `METRIC_NAMES.UNIQUE_EMPLOYEES` | Number of unique employees | `pl.n_unique("SalesPerson")` |
| `uniqueCustomers` | `CardName`    | `METRIC_NAMES.UNIQUE_CUSTOMERS` | Number of unique customers | `pl.n_unique("CardName")`    |

### **Returns & Margin Metrics**

| Metric Name          | Backend Field                         | Frontend Key                       | Description                      | Calculation                           |
| -------------------- | ------------------------------------- | ---------------------------------- | -------------------------------- | ------------------------------------- |
| `returnsValue`       | `returnsValue`                        | `METRIC_NAMES.RETURNS_VALUE`       | Total value of returns           | `pl.sum("returnsValue")`              |
| `returnRate`         | `(returnsValue / totalRevenue) * 100` | `METRIC_NAMES.RETURN_RATE`         | Returns as percentage of revenue | `(returnsValue / totalRevenue) * 100` |
| `averageTransaction` | `totalRevenue / totalTransactions`    | `METRIC_NAMES.AVERAGE_TRANSACTION` | Average transaction value        | `totalRevenue / totalTransactions`    |

## 🔧 **Calculation Formulas**

### **Revenue Calculations**

```python
class RevenueMetrics:
    @staticmethod
    def totalRevenue(df: pl.LazyFrame) -> float:
        """Calculate total gross revenue"""
        try:
            result = df.select(pl.sum("grossRevenue")).collect()
            value = float(result.item())
            return value if value >= 0 else 0.0
        except Exception as e:
            logging.error(f"Error calculating totalRevenue: {e}")
            return 0.0

    @staticmethod
    def netSales(df: pl.LazyFrame) -> float:
        """Calculate net sales (gross revenue + returns)"""
        try:
            result = df.select(
                pl.sum("grossRevenue") + pl.sum("returnsValue")
            ).collect()
            value = float(result.item())
            return value if value >= 0 else 0.0
        except Exception as e:
            logging.error(f"Error calculating netSales: {e}")
            return 0.0
```

### **Profit Calculations**

```python
class ProfitMetrics:
    @staticmethod
    def grossProfit(df: pl.LazyFrame) -> float:
        """Calculate gross profit (revenue - cost)"""
        try:
            result = df.select(
                pl.sum("grossRevenue") - pl.sum("totalCost")
            ).collect()
            value = float(result.item())
            return value
        except Exception as e:
            logging.error(f"Error calculating grossProfit: {e}")
            return 0.0

    @staticmethod
    def grossMargin(df: pl.LazyFrame) -> float:
        """Calculate gross margin percentage"""
        try:
            revenue = RevenueMetrics.totalRevenue(df)
            profit = ProfitMetrics.grossProfit(df)

            if revenue == 0:
                return 0.0

            margin = (profit / revenue) * 100
            return max(-100.0, min(100.0, margin))  # Clamp to valid range
        except Exception as e:
            logging.error(f"Error calculating grossMargin: {e}")
            return 0.0
```

### **Aggregation Patterns**

```python
# ✅ Good: Lazy evaluation with collect() only when needed
def getRevenueMetrics(df: pl.LazyFrame) -> dict:
    revenue_summary = (
        df
        .group_by("Branch")
        .agg([
            pl.sum("grossRevenue").alias("totalRevenue"),
            pl.sum("returnsValue").alias("returnsValue"),
            (pl.sum("grossRevenue") + pl.sum("returnsValue)).alias("totalSales"),
            (pl.sum("grossRevenue") - pl.sum("totalCost)).alias("grossProfit")
        ])
        .collect()  # Only collect when returning final result
    )
    return revenue_summary
```

## 🎨 **Frontend Usage Guidelines**

### **Metric Constants**

```typescript
// Standardized metric names
export const METRIC_NAMES = {
  TOTAL_REVENUE: "totalRevenue",
  NET_SALES: "netSales",
  TOTAL_SALES: "totalSales",
  GROSS_PROFIT: "grossProfit",
  GROSS_PROFIT_MARGIN: "grossProfitMargin",
  TOTAL_TRANSACTIONS: "totalTransactions",
  UNIQUE_PRODUCTS: "uniqueProducts",
  UNIQUE_BRANCHES: "uniqueBranches",
  UNIQUE_EMPLOYEES: "uniqueEmployees",
  UNITS_SOLD: "unitsSold",
  UNITS_RETURNED: "unitsReturned",
  NET_UNITS_SOLD: "netUnitsSold",
  RETURNS_VALUE: "returnsValue",
  RETURN_RATE: "returnRate",
  AVERAGE_TRANSACTION: "averageTransaction",
} as const;

// Standardized KPI titles
export const KPI_TITLES = {
  [METRIC_NAMES.TOTAL_REVENUE]: "Total Revenue",
  [METRIC_NAMES.NET_SALES]: "Net Sales",
  [METRIC_NAMES.TOTAL_SALES]: "Total Sales",
  [METRIC_NAMES.GROSS_PROFIT]: "Gross Profit",
  [METRIC_NAMES.GROSS_PROFIT_MARGIN]: "Gross Profit Margin",
  [METRIC_NAMES.TOTAL_TRANSACTIONS]: "Total Transactions",
  [METRIC_NAMES.UNIQUE_PRODUCTS]: "Unique Products",
  [METRIC_NAMES.UNIQUE_BRANCHES]: "Unique Branches",
  [METRIC_NAMES.UNIQUE_EMPLOYEES]: "Unique Employees",
  [METRIC_NAMES.UNITS_SOLD]: "Units Sold",
  [METRIC_NAMES.UNITS_RETURNED]: "Units Returned",
  [METRIC_NAMES.NET_UNITS_SOLD]: "Net Units Sold",
  [METRIC_NAMES.RETURNS_VALUE]: "Returns Value",
  [METRIC_NAMES.RETURN_RATE]: "Return Rate",
  [METRIC_NAMES.AVERAGE_TRANSACTION]: "Average Transaction",
} as const;
```

### **Tooltip Descriptions**

```typescript
export const TOOLTIP_DESCRIPTIONS = {
  [METRIC_NAMES.TOTAL_REVENUE]:
    "Gross revenue before any deductions or adjustments for the selected period.",
  [METRIC_NAMES.NET_SALES]:
    "Revenue after returns and adjustments for the selected period.",
  [METRIC_NAMES.TOTAL_SALES]:
    "Total sales including returns and adjustments for the selected period.",
  [METRIC_NAMES.GROSS_PROFIT]:
    "Revenue minus cost of goods sold for the selected period.",
  [METRIC_NAMES.GROSS_PROFIT_MARGIN]:
    "Gross profit as a percentage of gross revenue for the selected period.",
  [METRIC_NAMES.TOTAL_TRANSACTIONS]:
    "Total number of transactions for the selected period.",
  [METRIC_NAMES.UNIQUE_PRODUCTS]:
    "Number of unique products sold in the selected period.",
  [METRIC_NAMES.UNIQUE_BRANCHES]:
    "Number of unique branches with activity in the selected period.",
  [METRIC_NAMES.UNIQUE_EMPLOYEES]:
    "Number of unique employees with sales in the selected period.",
  [METRIC_NAMES.UNITS_SOLD]: "Total units sold in the selected period.",
  [METRIC_NAMES.UNITS_RETURNED]: "Total units returned in the selected period.",
  [METRIC_NAMES.NET_UNITS_SOLD]:
    "Net units (sold + returned) in the selected period.",
  [METRIC_NAMES.RETURNS_VALUE]:
    "Total value of returns in the selected period.",
  [METRIC_NAMES.RETURN_RATE]:
    "Returns as a percentage of gross revenue for the selected period.",
  [METRIC_NAMES.AVERAGE_TRANSACTION]:
    "Average transaction value for the selected period.",
} as const;
```

### **Helper Functions**

```typescript
export const isMonetaryMetric = (metricName: string): boolean => {
  const monetaryMetrics = [
    METRIC_NAMES.TOTAL_REVENUE,
    METRIC_NAMES.NET_SALES,
    METRIC_NAMES.TOTAL_SALES,
    METRIC_NAMES.GROSS_PROFIT,
    METRIC_NAMES.RETURNS_VALUE,
    METRIC_NAMES.AVERAGE_TRANSACTION,
  ];
  return monetaryMetrics.includes(metricName as keyof typeof METRIC_NAMES);
};

export const isPercentageMetric = (metricName: string): boolean => {
  const percentageMetrics = [
    METRIC_NAMES.GROSS_PROFIT_MARGIN,
    METRIC_NAMES.RETURN_RATE,
  ];
  return percentageMetrics.includes(metricName as keyof typeof METRIC_NAMES);
};

export const isCountMetric = (metricName: string): boolean => {
  const countMetrics = [
    METRIC_NAMES.TOTAL_TRANSACTIONS,
    METRIC_NAMES.UNIQUE_PRODUCTS,
    METRIC_NAMES.UNIQUE_BRANCHES,
    METRIC_NAMES.UNIQUE_EMPLOYEES,
    METRIC_NAMES.UNITS_SOLD,
    METRIC_NAMES.UNITS_RETURNED,
    METRIC_NAMES.NET_UNITS_SOLD,
  ];
  return countMetrics.includes(metricName as keyof typeof METRIC_NAMES);
};
```

## 🏗️ **Backend Implementation Details**

### **Data Validation**

```python
def validateDataFrame(df: pl.LazyFrame, required_columns: list) -> bool:
    """Validate that required columns exist in DataFrame"""
    try:
        sample_df = df.limit(1).collect()
        missing_cols = [col for col in required_columns if col not in sample_df.columns]

        if missing_cols:
            logging.error(f"Missing required columns: {missing_cols}")
            return False

        return True
    except Exception as e:
        logging.error(f"Error validating DataFrame: {e}")
        return False

def validateMetricResult(value: float, metric_name: str, min_value: float = None, max_value: float = None) -> float:
    """Validate metric calculation results"""
    try:
        if not isinstance(value, (int, float)):
            logging.warning(f"Invalid {metric_name} result type: {type(value)}")
            return 0.0

        if min_value is not None and value < min_value:
            logging.warning(f"{metric_name} below minimum: {value} < {min_value}")
            return min_value

        if max_value is not None and value > max_value:
            logging.warning(f"{metric_name} above maximum: {value} > {max_value}")
            return max_value

        return value
    except Exception as e:
        logging.error(f"Error validating {metric_name}: {e}")
        return 0.0
```

### **Error Handling**

```python
def safeMetricCalculation(func):
    """Decorator for safe metric calculation with error handling"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}")
            return 0.0
    return wrapper

@safeMetricCalculation
def calculateTotalRevenue(df: pl.LazyFrame) -> float:
    """Calculate total revenue with error handling"""
    result = df.select(pl.sum("grossRevenue")).collect()
    return float(result.item())
```

## 📝 **Naming Conventions**

### **Backend (Python)**

- **Functions**: `camelCase` (e.g., `getTotalRevenue`, `calculateGrossProfit`)
- **Variables**: `snake_case` (e.g., `total_revenue`, `gross_profit`)
- **Classes**: `PascalCase` (e.g., `RevenueMetrics`, `ProfitMetrics`)

### **Frontend (TypeScript)**

- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `METRIC_NAMES.TOTAL_REVENUE`)
- **Variables**: `camelCase` (e.g., `totalRevenue`, `grossProfit`)
- **Functions**: `camelCase` (e.g., `isMonetaryMetric`, `formatValue`)

### **GraphQL Schema**

- **Fields**: `camelCase` (e.g., `totalRevenue`, `grossProfit`)
- **Types**: `PascalCase` (e.g., `RevenueSummary`, `ProfitMetrics`)
- **Queries**: `camelCase` (e.g., `dashboardData`, `monthlySalesGrowth`)

## 🔄 **Data Flow**

### **Metric Calculation Flow**

1. **Data Fetching**: Druid → FastAPI → Polars LazyFrame
2. **Lazy Processing**: Apply filters and transformations
3. **Aggregation**: Calculate metrics using standardized functions
4. **Validation**: Validate results for accuracy and range
5. **GraphQL Response**: Return through Strawberry GraphQL
6. **Frontend Display**: Format and display in KPI cards

### **Performance Considerations**

- **Lazy Evaluation**: Use Polars LazyFrames until final collection
- **Batch Processing**: Calculate multiple metrics in single query
- **Caching**: Cache calculated metrics for common date ranges
- **Error Handling**: Graceful degradation with default values

## 📋 **Implementation Checklist**

### **✅ Completed**

- [x] Standardized metric definitions
- [x] Frontend metric constants and helpers
- [x] Backend calculation classes
- [x] GraphQL schema definitions
- [x] Error handling patterns

### **🔄 In Progress**

- [ ] Frontend component updates
- [ ] Backend service updates
- [ ] GraphQL resolver implementation
- [ ] Performance optimization

### **📝 To Do**

- [ ] Unit tests for all metric calculations
- [ ] Integration tests for end-to-end flow
- [ ] Performance benchmarking
- [ ] Documentation updates

---

**This document serves as the authoritative reference for all metric-related development. All team members should refer to this document for metric definitions, calculations, and implementation patterns.**
