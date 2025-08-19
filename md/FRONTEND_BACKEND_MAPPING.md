# Frontend–Backend Mapping: Consolidated Data Contracts

## 🎯 **Overview**

This document provides the **authoritative mapping** between frontend dashboard components, their expected data structures (TypeScript interfaces), the corresponding GraphQL queries, output fields, error envelope structure, and accepted filter arguments. This is the **single source of truth** for frontend-backend data contracts.

## 📊 **Component ↔️ GraphQL Mapping Table**

| **Component**                          | **TypeScript Interface**                                                                                                                                                                                                                                                     | **GraphQL Query & Output Fields**                                                                                                                                         | **Filters (Arguments)**                                                                 | **Status**         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| **Enhanced KPI Cards**                 | `KpiCard { title, value, icon, trend, sparklineData, vsValue, vsPercent, vsDirection }`                                                                                                                                                                                      | `revenueSummary { totalRevenue, grossProfit, lineItemCount }` + `monthlySalesGrowth`                                                                                      | startDate, endDate, branch, productLine, itemGroups                                     | ✅ **IMPLEMENTED** |
| **Sales vs. Profit Trend Chart**       | `MonthlySalesGrowthEntry { date: string; totalSales?: number; grossProfit?: number; }`                                                                                                                                                                                       | `monthlySalesGrowth { date totalSales grossProfit }`                                                                                                                      | startDate, endDate, branch, productLine, itemGroups                                     | ✅ **IMPLEMENTED** |
| **Geographic Profitability Map**       | `ProfitabilityByDimensionEntry { branch?: string; grossProfit?: number; grossMargin?: number; }`                                                                                                                                                                             | `profitabilityByDimension { branch grossProfit grossMargin }`                                                                                                             | startDate, endDate, dimension: "Branch", itemGroups                                     | ✅ **IMPLEMENTED** |
| **Enhanced Top Customers Table**       | `TopCustomerEntry { cardName: string; salesAmount?: number; grossProfit?: number; }`                                                                                                                                                                                         | `topCustomers { cardName salesAmount grossProfit }`                                                                                                                       | startDate, endDate, branch, n: 100, productLine, itemGroups                             | ✅ **IMPLEMENTED** |
| **Salesperson Leaderboard**            | `SalespersonLeaderboardEntry { salesperson: string; salesAmount: number; grossProfit: number; }`                                                                                                                                                                             | `salespersonLeaderboard { salesperson salesAmount grossProfit }`                                                                                                          | startDate, endDate, branch, itemGroups                                                  | ✅ **IMPLEMENTED** |
| **Product/Product Line Profitability** | `ProductProfitabilityEntry { productLine: string; itemName: string; grossProfit: number; }`                                                                                                                                                                                  | `productProfitability { productLine itemName grossProfit }`                                                                                                               | startDate, endDate, branch, itemGroups                                                  | ✅ **IMPLEMENTED** |
| **Salesperson Product Mix & Margin**   | `SalespersonProductMixEntry { salesperson: string; productLine: string; avgProfitMargin: number; }`                                                                                                                                                                          | `salespersonProductMix { salesperson productLine avgProfitMargin }`                                                                                                       | startDate, endDate, branch, itemGroups                                                  | ✅ **IMPLEMENTED** |
| **Customer Value Table**               | `CustomerValueEntry { cardName: string; salesAmount: number; grossProfit: number; }`                                                                                                                                                                                         | `customerValue { cardName salesAmount grossProfit }`                                                                                                                      | startDate, endDate, itemGroups                                                          | ✅ **IMPLEMENTED** |
| **Sales Target Attainment**            | `SalesTargetAttainment { attainmentPercentage: number; totalSales: number; target: number; }`                                                                                                                                                                                | `targetAttainment { attainmentPercentage totalSales target }`                                                                                                             | startDate, endDate, target, itemGroups                                                  | ✅ **IMPLEMENTED** |
| **Product Performance**                | `ProductPerformanceEntry { product: string; sales: number; }`                                                                                                                                                                                                                | `productPerformance { product sales }`                                                                                                                                    | startDate, endDate, n, itemGroups                                                       | ✅ **IMPLEMENTED** |
| **Product Analytics**                  | `ProductAnalyticsEntry { itemName: string; productLine: string; itemGroup: string; totalSales: number; totalQty: number; transactionCount: number; uniqueBranches: number; averagePrice: number; }`                                                                          | `productAnalytics { itemName productLine itemGroup totalSales totalQty transactionCount uniqueBranches averagePrice }`                                                    | startDate, endDate, itemGroups                                                          | ✅ **IMPLEMENTED** |
| **Branch Performance Table**           | `BranchPerformanceEntry { branch: string; totalSales: number; transactionCount: number; averageSale: number; uniqueCustomers: number; uniqueProducts: number; }`                                                                                                             | `branchPerformance { branch totalSales transactionCount averageSale uniqueCustomers uniqueProducts }`                                                                     | startDate, endDate, itemGroups                                                          | ✅ **IMPLEMENTED** |
| **Branch List**                        | `string[]`                                                                                                                                                                                                                                                                   | `branchList`                                                                                                                                                              | startDate, endDate                                                                      | ✅ **IMPLEMENTED** |
| **Branch Growth**                      | `BranchGrowthEntry { branch: string; monthYear: string; monthlySales: number; growthPct: number; }`                                                                                                                                                                          | `branchGrowth { branch monthYear monthlySales growthPct }`                                                                                                                | startDate, endDate                                                                      | ✅ **IMPLEMENTED** |
| **Sales Performance**                  | `SalesPerformanceEntry { salesperson: string; totalSales: number; transactionCount: number; averageSale: number; uniqueBranches: number; uniqueProducts: number; }`                                                                                                          | `salesPerformance { salesperson totalSales transactionCount averageSale uniqueBranches uniqueProducts }`                                                                  | startDate, endDate                                                                      | ✅ **IMPLEMENTED** |
| **Revenue Summary**                    | `RevenueSummary { totalRevenue: number; netSales: number; grossProfit: number; netProfit: number; lineItemCount: number; returnsValue: number; averageTransaction: number; uniqueProducts: number; uniqueBranches: number; uniqueEmployees: number; netUnitsSold: number; }` | `revenueSummary { totalRevenue netSales grossProfit netProfit lineItemCount returnsValue averageTransaction uniqueProducts uniqueBranches uniqueEmployees netUnitsSold }` | startDate, endDate, branch, productLine                                                 | ✅ **IMPLEMENTED** |
| **Data Range**                         | `DataRange { earliestDate: string; latestDate: string; totalRecords: number; }`                                                                                                                                                                                              | `dataRange { earliestDate latestDate totalRecords }`                                                                                                                      | None                                                                                    | ✅ **IMPLEMENTED** |
| **Margin Trends**                      | `MarginTrendEntry { date: string; marginPct: number; }`                                                                                                                                                                                                                      | `marginTrends { date marginPct }`                                                                                                                                         | startDate, endDate                                                                      | ✅ **IMPLEMENTED** |
| **Returns Analysis**                   | `ReturnsAnalysisEntry { reason: string; count: number; }`                                                                                                                                                                                                                    | `returnsAnalysis { reason count }`                                                                                                                                        | startDate, endDate, itemNames, salesPersons, branchNames, branch, productLine, mockData | ✅ **IMPLEMENTED** |

## 🔗 **GraphQL Schema Definitions**

### **Core Types**

```python
@strawberry.type
class RevenueSummary:
    """Revenue summary metrics for dashboard"""
    total_revenue: float = strawberry.field(
        description="Gross revenue before any deductions or adjustments"
    )
    net_sales: float = strawberry.field(
        description="Revenue after returns and adjustments"
    )
    total_sales: float = strawberry.field(
        description="Alias for net sales (backward compatibility)"
    )
    gross_profit: float = strawberry.field(
        description="Revenue minus cost of goods sold"
    )
    gross_profit_margin: float = strawberry.field(
        description="Gross profit as percentage of gross revenue"
    )
    total_transactions: int = strawberry.field(
        description="Total number of transactions for the selected period"
    )
    unique_products: int = strawberry.field(
        description="Number of unique products for the selected period"
    )
    unique_branches: int = strawberry.field(
        description="Number of unique branches for the selected period"
    )
    unique_employees: int = strawberry.field(
        description="Number of unique employees for the selected period"
    )
    returns_value: float = strawberry.field(
        description="Total value of returns for the selected period"
    )
    average_transaction: float = strawberry.field(
        description="Average transaction value for the selected period"
    )
    net_units_sold: float = strawberry.field(
        description="Net units sold (including returns) for the selected period"
    )
```

### **Query Resolvers**

```python
@strawberry.type
class Query:
    @strawberry.field
    async def dashboard_data(
        self,
        start_date: str,
        end_date: str
    ) -> RevenueSummary:
        """Get dashboard metrics for specified date range"""
        try:
            # Parse dates
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)

            # Get metrics from KPI service
            kpi_service = KpiService(SalesDataService())
            metrics = await kpi_service.getDashboardMetrics(start_dt, end_dt)

            # Return RevenueSummary object
            return RevenueSummary(
                total_revenue=metrics["totalRevenue"],
                net_sales=metrics["netSales"],
                total_sales=metrics["totalSales"],
                gross_profit=metrics["grossProfit"],
                gross_profit_margin=metrics["grossProfitMargin"],
                total_transactions=metrics["totalTransactions"],
                unique_products=metrics["uniqueProducts"],
                unique_branches=metrics["uniqueBranches"],
                unique_employees=metrics["uniqueEmployees"],
                returns_value=metrics["returnsValue"],
                average_transaction=metrics["averageTransaction"],
                net_units_sold=metrics["netUnitsSold"]
            )

        except Exception as e:
            logging.error(f"Error in dashboard_data resolver: {e}")
            raise Exception(f"Failed to fetch dashboard data: {e}")
```

## 📋 **Filter Arguments Reference**

| **Filter Argument** | **Type** | **Description**                                              | **Default**         | **Usage**                                   |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------- | ------------------------------------------- |
| startDate           | string   | Start date for filtering (YYYY-MM-DD)                        | "2024-01-01"        | All queries                                 |
| endDate             | string   | End date for filtering (YYYY-MM-DD)                          | "2024-12-31"        | All queries                                 |
| branch              | string   | Branch name (optional)                                       | None                | Revenue, performance, and analytics queries |
| productLine         | string   | Product line (optional, high-level brand/category)           | None                | Product and sales queries                   |
| itemGroups          | [string] | List of item groups (sub-categories, e.g., "Parts", "Units") | None                | Product analytics and performance queries   |
| n                   | int      | Number of top results to return (for rankings)               | 5 or 10 (see query) | Top customers, product performance queries  |
| target              | float    | Sales target (for attainment queries)                        | 0.0                 | Sales target attainment queries             |
| dimension           | string   | Dimension for profitability (e.g., Branch)                   | "Branch"            | Profitability by dimension queries          |
| itemNames           | [string] | List of item names (for filtering)                           | None                | Returns analysis queries                    |
| salesPersons        | [string] | List of salesperson names (for filtering)                    | None                | Returns analysis queries                    |
| branchNames         | [string] | List of branch names (for filtering)                         | None                | Returns analysis queries                    |

## 🚨 **Error Envelope Structure**

All GraphQL errors are returned in a consistent envelope:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "metadata": {
    "requestId": "unique-request-identifier",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### **Error Codes**

| **Error Code**     | **Description**               | **HTTP Status** | **Action**                           |
| ------------------ | ----------------------------- | --------------- | ------------------------------------ |
| `VALIDATION_ERROR` | Invalid input parameters      | 400             | Check filter values and date formats |
| `DATA_NOT_FOUND`   | No data for specified filters | 404             | Adjust date range or filters         |
| `INTERNAL_ERROR`   | Backend processing error      | 500             | Check backend logs, retry later      |
| `QUERY_TIMEOUT`    | Query execution timeout       | 408             | Reduce date range or complexity      |

## 🔄 **Data Flow Patterns**

### **Standard Data Flow**

1. **Data Request**: Frontend requests data via GraphQL query
2. **GraphQL Resolution**: Strawberry resolver calls KPI service
3. **Data Fetching**: KPI service calls sales data service
4. **Druid Query**: Sales data service queries Druid
5. **Lazy Processing**: Data processed using Polars LazyFrames
6. **Metric Calculation**: Standardized metric classes calculate values
7. **Validation**: Results validated for accuracy and range
8. **Response**: Data returned through GraphQL to frontend
9. **Rendering**: Frontend renders KPI cards and charts

### **Error Handling Flow**

1. **Input Validation**: Validate date ranges and parameters
2. **Data Validation**: Check for required columns and data quality
3. **Calculation Validation**: Validate metric calculation results
4. **Graceful Degradation**: Return default values on errors
5. **Comprehensive Logging**: Log all errors for debugging
6. **User Feedback**: Show appropriate error messages in UI

## 📱 **Frontend Implementation Patterns**

### **React Query Usage**

```typescript
// ✅ Good: Use generated hooks from codegen
const { data, loading, error } = useQuery<DashboardDataQuery>(
  DASHBOARD_DATA_QUERY,
  {
    variables: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  }
);

// ✅ Good: Handle loading and error states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// ✅ Good: Use safe data access
const safeData = data?.dashboardData || DEFAULT_DASHBOARD_DATA;
```

### **Component Data Binding**

```typescript
// ✅ Good: Use standardized metric names and titles
<KpiCard
  title={KPI_TITLES[METRIC_NAMES.TOTAL_REVENUE]}
  value={safeData.totalRevenue}
  icon={<AttachMoneyIcon />}
  tooltipText={TOOLTIP_DESCRIPTIONS[METRIC_NAMES.TOTAL_REVENUE]}
  isLoading={loading}
  color="primary"
  metricKey={METRIC_NAMES.TOTAL_REVENUE}
/>
```

### **Type Safety**

```typescript
// ✅ Good: Use generated types from GraphQL codegen
interface DashboardDataQuery {
  dashboardData: RevenueSummary;
}

interface RevenueSummary {
  totalRevenue: number;
  netSales: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalTransactions: number;
  uniqueProducts: number;
  uniqueBranches: number;
  uniqueEmployees: number;
  returnsValue: number;
  averageTransaction: number;
  netUnitsSold: number;
}
```

## 🚀 **Performance Optimization**

### **Query Consolidation**

```typescript
// ✅ Good: Use composite queries for dashboard data
const DASHBOARD_COMPOSITE_QUERY = gql`
  query DashboardComposite($startDate: String!, $endDate: String!) {
    revenueSummary(startDate: $startDate, endDate: $endDate) {
      totalRevenue
      netSales
      grossProfit
      grossProfitMargin
      totalTransactions
      uniqueProducts
      uniqueBranches
      uniqueEmployees
    }
    monthlySalesGrowth(startDate: $startDate, endDate: $endDate) {
      date
      totalSales
      grossProfit
    }
    profitabilityByDimension(
      startDate: $startDate
      endDate: $endDate
      dimension: "Branch"
    ) {
      branch
      grossProfit
      grossMargin
    }
  }
`;
```

### **Caching Strategies**

```typescript
// ✅ Good: Implement React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
```

## 📊 **Data Validation & Quality**

### **Frontend Validation**

```typescript
// ✅ Good: Validate data before rendering
const validateMetricData = (data: any): boolean => {
  if (!data || typeof data !== "object") return false;

  const requiredFields = ["totalRevenue", "grossProfit", "totalTransactions"];
  return requiredFields.every(
    (field) => typeof data[field] === "number" && !isNaN(data[field])
  );
};

// ✅ Good: Provide fallback values
const getSafeMetricValue = (
  value: number | null | undefined,
  fallback: number = 0
): number => {
  return typeof value === "number" && !isNaN(value) ? value : fallback;
};
```

### **Backend Validation**

```python
# ✅ Good: Validate input parameters
def validateDateRange(start_date: str, end_date: str) -> tuple[datetime, datetime]:
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)

        if start_dt >= end_dt:
            raise ValueError("Start date must be before end date")

        return start_dt, end_dt
    except ValueError as e:
        raise ValidationError(f"Invalid date format: {e}")

# ✅ Good: Validate calculation results
def validateMetricResult(value: float, metric_name: str) -> float:
    if not isinstance(value, (int, float)) or math.isnan(value):
        logging.warning(f"Invalid {metric_name} result: {value}")
        return 0.0
    return value
```

## 🔍 **Monitoring & Debugging**

### **Query Performance Monitoring**

```typescript
// ✅ Good: Monitor query performance
const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
  variables: { startDate, endDate },
  onSuccess: (data) => {
    console.log("Dashboard data loaded successfully", data);
    analytics.track("dashboard_data_loaded", {
      startDate,
      endDate,
      dataSize: JSON.stringify(data).length,
    });
  },
  onError: (error) => {
    console.error("Dashboard query failed", error);
    analytics.track("dashboard_query_error", {
      error: error.message,
      startDate,
      endDate,
    });
  },
});
```

### **Backend Logging**

```python
# ✅ Good: Comprehensive logging for debugging
import logging
import time

def logQueryPerformance(func):
    """Decorator to log query performance"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logging.info(f"{func.__name__} executed in {execution_time:.2f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logging.error(f"{func.__name__} failed after {execution_time:.2f}s: {e}")
            raise
    return wrapper
```

## 📋 **Implementation Checklist**

### **✅ Completed**

- [x] GraphQL schema definitions
- [x] TypeScript interfaces
- [x] Component mapping table
- [x] Filter arguments reference
- [x] Error envelope structure
- [x] Data flow patterns
- [x] Frontend implementation patterns
- [x] Data ingestion GraphQL schema and components
- [x] File upload interface and status tracking
- [x] Apollo Client configuration for file uploads

### **🔄 In Progress**

- [ ] Query consolidation implementation
- [ ] Performance optimization
- [ ] Comprehensive error handling
- [ ] Data validation implementation
- [ ] End-to-end testing of data ingestion workflow

### **📝 To Do**

- [ ] Unit tests for all mappings
- [ ] Integration tests for data contracts
- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Data ingestion workflow testing

---

**This document serves as the authoritative reference for all frontend-backend data contracts. All team members should refer to this document for component data requirements, GraphQL queries, and implementation patterns.**
