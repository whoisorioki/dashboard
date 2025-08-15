# Data Pipeline: Architecture and Flow

## 🎯 **Overview**

This document describes the complete data pipeline architecture for the sales analytics dashboard, from data sources through to frontend visualization, using standardized camelCase naming conventions.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Source   | ─▶│   Backend API    │ ─▶ │   GraphQL API   │──▶│    Frontend     │
│   (Druid)       │    │   (FastAPI)      │    │  (Strawberry)   │    │   (React)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Raw Data       │    │  Data Processing │    │  Schema Types   │    │  UI Components  │
│  (14 columns)   │    │  (Polars)        │    │  (Strawberry)   │    │  (KPI Cards)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 **Data Source Layer**

### **Druid Data Source: `sales_analytics`**

#### **Available Columns**

| Column          | Type     | Description            | Usage                    |
| --------------- | -------- | ---------------------- | ------------------------ |
| `__time`        | datetime | Transaction timestamp  | Time-based analysis      |
| `ProductLine`   | string   | Product line/category  | Product categorization   |
| `ItemGroup`     | string   | Product group          | Product grouping         |
| `Branch`        | string   | Branch/location        | Branch analysis          |
| `SalesPerson`   | string   | Salesperson name       | Salesperson performance  |
| `AcctName`      | string   | Account/customer name  | Customer analysis        |
| `ItemName`      | string   | Product/item name      | Product analysis         |
| `CardName`      | string   | Customer card name     | Customer identification  |
| `grossRevenue`  | float    | Gross revenue (KES)    | Revenue calculations     |
| `returnsValue`  | float    | Value of returns (KES) | Returns analysis         |
| `unitsSold`     | float    | Units sold             | Quantity metrics         |
| `unitsReturned` | float    | Units returned         | Returns quantity         |
| `totalCost`     | float    | Total cost (KES)       | Profitability metrics    |
| `lineItemCount` | int      | Line item count        | Transaction metrics      |

#### **Data Quality Characteristics**

- **Volume**: Transaction-level data with timestamps
- **Velocity**: Near real-time updates from sales systems
- **Variety**: Structured data with consistent schema
- **Veracity**: High-quality data from operational systems

## 🔄 **Data Processing Layer**

### **Polars LazyFrame Processing**

#### **Lazy Evaluation Strategy**

```python
# ✅ Good: Lazy evaluation with collect() only when needed
def getRevenueMetrics(df: pl.LazyFrame) -> dict:
    # Process data lazily
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

#### **Standardized Processing Patterns**

##### **1. Revenue Metrics Processing**

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

##### **2. Profit Metrics Processing**

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
```

##### **3. Margin Metrics Processing**

```python
class MarginMetrics:
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

#### **Data Validation and Error Handling**

##### **Input Validation**

```python
def validateDataFrame(df: pl.LazyFrame, required_columns: list) -> bool:
    """Validate that required columns exist in DataFrame"""
    try:
        # Sample the DataFrame to check columns
        sample_df = df.limit(1).collect()
        missing_cols = [col for col in required_columns if col not in sample_df.columns]
        
        if missing_cols:
            logging.error(f"Missing required columns: {missing_cols}")
            return False
            
        return True
    except Exception as e:
        logging.error(f"Error validating DataFrame: {e}")
        return False
```

##### **Result Validation**

```python
def validateMetricResult(value: float, metric_name: str, min_value: float = None, max_value: float = None) -> float:
    """Validate metric calculation results"""
    try:
        # Type validation
        if not isinstance(value, (int, float)):
            logging.warning(f"Invalid {metric_name} result type: {type(value)}")
            return 0.0
            
        # Range validation
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

## 🚀 **API Layer**

### **FastAPI Backend**

#### **Data Service Layer**

```python
class SalesDataService:
    def __init__(self):
        self.druid_client = DruidClient()
    
    async def fetchSalesData(
        self, 
        start_date: datetime, 
        end_date: datetime,
        filters: dict = None
    ) -> pl.LazyFrame:
        """Fetch sales data from Druid with lazy evaluation"""
        try:
            # Build Druid query
            query = self.buildDruidQuery(start_date, end_date, filters)
            
            # Execute query and return LazyFrame
            raw_data = await self.druid_client.execute_query(query)
            return pl.from_pandas(raw_data).lazy()
            
        except Exception as e:
            logging.error(f"Error fetching sales data: {e}")
            return pl.LazyFrame().collect()  # Return empty DataFrame
```

#### **KPI Service Layer**

```python
class KpiService:
    def __init__(self, sales_data_service: SalesDataService):
        self.sales_data_service = sales_data_service
    
    async def getDashboardMetrics(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> dict:
        """Get comprehensive dashboard metrics"""
        try:
            # Fetch data
            df = await self.sales_data_service.fetchSalesData(start_date, end_date)
            
            # Calculate metrics using standardized classes
            metrics = {
                "totalRevenue": RevenueMetrics.totalRevenue(df),
                "netSales": RevenueMetrics.netSales(df),
                "totalSales": RevenueMetrics.netSales(df),  # Alias for netSales
                "grossProfit": ProfitMetrics.grossProfit(df),
                "grossProfitMargin": MarginMetrics.grossMargin(df),
                "totalTransactions": df.select(pl.count()).collect().item(),
                "uniqueProducts": df.select(pl.n_unique("ItemName")).collect().item(),
                "uniqueBranches": df.select(pl.n_unique("Branch")).collect().item(),
                "uniqueEmployees": df.select(pl.n_unique("SalesPerson")).collect().item()
            }
            
            return metrics
            
        except Exception as e:
            logging.error(f"Error getting dashboard metrics: {e}")
            return self.getDefaultMetrics()
```

### **GraphQL Schema (Strawberry)**

#### **Type Definitions**

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
```

#### **Resolver Functions**

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
                unique_employees=metrics["uniqueEmployees"]
            )
            
        except Exception as e:
            logging.error(f"Error in dashboard_data resolver: {e}")
            raise Exception(f"Failed to fetch dashboard data: {e}")
```

## 🎨 **Frontend Layer**

### **React Components**

#### **KPI Card Component**

```typescript
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tooltipText: string;
  isLoading: boolean;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'info';
  metricKey?: string;
  sparklineData?: number[];
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  tooltipText,
  isLoading,
  color,
  metricKey,
  sparklineData
}) => {
  const formatValue = (val: string | number, metricKey?: string): string => {
    if (metricKey) {
      if (isMonetaryMetric(metricKey)) {
        return formatKshAbbreviated(Number(val));
      } else if (isPercentageMetric(metricKey)) {
        return typeof val === 'number' ? `${val.toFixed(1)}%` : val.toString();
      } else if (isCountMetric(metricKey)) {
        return typeof val === 'number' ? val.toLocaleString() : val.toString();
      }
    }
    return val.toString();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box color={`${color}.main`} mr={1}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        
        <Typography
          variant="h3"
          sx={{ fontWeight: 'bold', mb: 1 }}
          aria-label={`Value: ${value}`}
        >
          {isLoading ? (
            <Skeleton variant="text" width="80%" />
          ) : (
            formatValue(value, metricKey)
          )}
        </Typography>
        
        {sparklineData && (
          <Box mt={2}>
            <SparklineChart data={sparklineData} color={color} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
```

#### **Dashboard Page**

```typescript
const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<RevenueSummary | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const { data, loading, error } = useQuery<DashboardDataQuery>(
    DASHBOARD_DATA_QUERY,
    {
      variables: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }
  );

  useEffect(() => {
    if (data?.dashboardData) {
      setDashboardData(data.dashboardData);
      setLoadingDashboard(false);
    }
  }, [data]);

  const safeRevenueSummary = dashboardData || {
    totalRevenue: 0,
    netSales: 0,
    totalSales: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    totalTransactions: 0,
    uniqueProducts: 0,
    uniqueBranches: 0,
    uniqueEmployees: 0
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={KPI_TITLES[METRIC_NAMES.TOTAL_REVENUE]}
            value={safeRevenueSummary.totalRevenue}
            icon={<AttachMoneyIcon />}
            tooltipText={TOOLTIP_DESCRIPTIONS[METRIC_NAMES.TOTAL_REVENUE]}
            isLoading={loadingDashboard}
            color="primary"
            metricKey={METRIC_NAMES.TOTAL_REVENUE}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={KPI_TITLES[METRIC_NAMES.NET_SALES]}
            value={safeRevenueSummary.netSales}
            icon={<TrendingUpIcon />}
            tooltipText={TOOLTIP_DESCRIPTIONS[METRIC_NAMES.NET_SALES]}
            isLoading={loadingDashboard}
            color="info"
            metricKey={METRIC_NAMES.NET_SALES}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={KPI_TITLES[METRIC_NAMES.GROSS_PROFIT]}
            value={safeRevenueSummary.grossProfit}
            icon={<AccountBalanceIcon />}
            tooltipText={TOOLTIP_DESCRIPTIONS[METRIC_NAMES.GROSS_PROFIT]}
            isLoading={loadingDashboard}
            color="success"
            metricKey={METRIC_NAMES.GROSS_PROFIT}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={KPI_TITLES[METRIC_NAMES.GROSS_PROFIT_MARGIN]}
            value={safeRevenueSummary.grossProfitMargin}
            icon={<PercentIcon />}
            tooltipText={TOOLTIP_DESCRIPTIONS[METRIC_NAMES.GROSS_PROFIT_MARGIN]}
            isLoading={loadingDashboard}
            color="secondary"
            metricKey={METRIC_NAMES.GROSS_PROFIT_MARGIN}
          />
        </Grid>
      </Grid>
    </Container>
  );
};
```

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

## 📈 **Performance Optimizations**

### **Lazy Evaluation Benefits**

- **Memory Efficiency**: Only process data when needed
- **Query Optimization**: Polars optimizes query execution
- **Parallel Processing**: Leverage multi-core processing
- **Reduced Network**: Minimize data transfer

### **Caching Strategies**

- **Metric Caching**: Cache calculated metrics for common date ranges
- **Query Caching**: Cache Druid query results
- **Frontend Caching**: Cache GraphQL responses
- **Aggregation Caching**: Cache pre-calculated aggregations

### **Query Optimization**

- **Column Selection**: Only fetch required columns
- **Filter Pushdown**: Apply filters at data source level
- **Aggregation Pushdown**: Perform aggregations in Druid when possible
- **Batch Processing**: Process multiple metrics in single query

## 🔒 **Data Security and Privacy**

### **Access Control**

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Data Masking**: Mask sensitive customer information
- **Audit Logging**: Log all data access and modifications

### **Data Protection**

- **Encryption**: Encrypt data in transit and at rest
- **Data Retention**: Implement data retention policies
- **Backup and Recovery**: Regular data backups and recovery procedures
- **Compliance**: Ensure compliance with data protection regulations

## 📊 **Monitoring and Observability**

### **Performance Metrics**

- **Response Time**: Monitor API response times
- **Throughput**: Track requests per second
- **Error Rates**: Monitor error rates and types
- **Resource Usage**: Track CPU, memory, and network usage

### **Data Quality Metrics**

- **Data Freshness**: Monitor data update frequency
- **Data Completeness**: Track missing or null values
- **Data Accuracy**: Validate calculation results
- **Data Consistency**: Check for data inconsistencies

### **Business Metrics**

- **User Engagement**: Track dashboard usage patterns
- **Query Patterns**: Analyze common query patterns
- **Performance Impact**: Measure business impact of performance issues
- **User Satisfaction**: Collect user feedback on data quality

## 🎯 **Future Enhancements**

### **Short-term (Next Quarter)**

1. **Real-time Updates**: Implement WebSocket-based real-time data updates
2. **Advanced Caching**: Implement Redis-based caching layer
3. **Query Optimization**: Further optimize Druid queries and Polars processing
4. **Data Validation**: Enhance data quality validation and monitoring

### **Medium-term (Next 6 Months)**

1. **Machine Learning**: Add predictive analytics and anomaly detection
2. **Custom Metrics**: Allow users to define custom metrics and calculations
3. **Data Export**: Implement data export functionality
4. **Advanced Visualizations**: Add more sophisticated charts and graphs

### **Long-term (Next Year)**

1. **Multi-tenant Architecture**: Support multiple organizations
2. **Data Lake Integration**: Integrate with data lake for advanced analytics
3. **API Marketplace**: Expose APIs for third-party integrations
4. **Mobile Applications**: Develop mobile apps for dashboard access

This data pipeline architecture provides a robust, scalable foundation for the sales analytics dashboard, ensuring data quality, performance, and maintainability while supporting future growth and enhancements.