# 📊 Metrics and KPIs Guide - Sales Analytics Dashboard

## **📋 Overview**

This guide consolidates all metrics and KPIs information including standardization, definitions, and implementation for the Sales Analytics Dashboard.

---

## **🎯 KEY PERFORMANCE INDICATORS (KPIs)**

### **Core Business KPIs**

#### **1. Revenue Metrics**

- **Total Revenue**: Sum of all sales transactions
- **Revenue Growth**: Month-over-month revenue change
- **Average Order Value**: Total revenue / Number of transactions
- **Revenue per Branch**: Revenue distribution across locations

#### **2. Profitability Metrics**

- **Total Profit**: Revenue minus costs
- **Profit Margin**: (Profit / Revenue) × 100
- **Profit Growth**: Month-over-month profit change
- **Profit per Product**: Profit contribution by product

#### **3. Operational Metrics**

- **Total Transactions**: Number of sales transactions
- **Transaction Volume**: Daily/monthly transaction counts
- **Customer Count**: Unique customer transactions
- **Product Count**: Unique products sold

### **KPI Implementation**

#### **Frontend KPI Cards**

```typescript
// KPI Card Component
interface KpiCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease";
  format?: "currency" | "percentage" | "number";
  sparkline?: number[];
}

function KpiCard({
  title,
  value,
  change,
  changeType,
  format,
  sparkline,
}: KpiCardProps) {
  const formattedValue = formatValue(value, format);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {formattedValue}
        </Typography>
        {change && (
          <Box display="flex" alignItems="center">
            <TrendingUpIcon
              color={changeType === "increase" ? "success" : "error"}
            />
            <Typography
              variant="body2"
              color={changeType === "increase" ? "success" : "error"}
            >
              {change}%
            </Typography>
          </Box>
        )}
        {sparkline && <SparklineChart data={sparkline} />}
      </CardContent>
    </Card>
  );
}
```

#### **Backend KPI Service**

```python
# backend/services/kpi_service.py
class KpiService:
    def get_revenue_summary(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get revenue KPI summary"""
        query = """
        SELECT
            SUM(revenue) as total_revenue,
            SUM(profit) as total_profit,
            COUNT(*) as total_transactions,
            (SUM(profit) / SUM(revenue)) * 100 as profit_margin
        FROM sales_data
        WHERE date BETWEEN %s AND %s
        """
        # Implementation details...

    def get_growth_metrics(self, current_period: str, previous_period: str) -> Dict[str, Any]:
        """Calculate growth metrics"""
        # Implementation details...
```

---

## **📈 METRICS STANDARDIZATION**

### **Data Format Standards**

#### **1. Currency Formatting**

```typescript
// Currency formatting utility
export const formatCurrency = (
  value: number,
  currency: string = "KSh"
): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Usage examples
formatCurrency(1500000); // "KSh 1,500,000"
formatCurrency(2500.5); // "KSh 2,501"
```

#### **2. Percentage Formatting**

```typescript
// Percentage formatting utility
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

// Usage examples
formatPercentage(20.5); // "20.5%"
formatPercentage(15.123, 2); // "15.12%"
```

#### **3. Number Formatting**

```typescript
// Number formatting utility
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Usage examples
formatNumber(15000); // "15,000"
formatNumber(15000.5, 1); // "15,000.5"
```

### **Date Format Standards**

#### **1. Date Range Formatting**

```typescript
// Date range formatting
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  });
  const end = endDate.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${start} - ${end}`;
};

// Usage examples
formatDateRange(new Date("2025-01-01"), new Date("2025-01-31")); // "Jan 1 - Jan 31, 2025"
```

#### **2. Relative Date Formatting**

```typescript
// Relative date formatting
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  });
};
```

---

## **📊 CHART METRICS**

### **Chart Data Standards**

#### **1. Line Chart Data Format**

```typescript
interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

// Example line chart data
const salesTrendData: LineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [35000000, 38000000, 42000000, 39000000, 45000000, 40000000],
      borderColor: "#2196F3",
      backgroundColor: "rgba(33, 150, 243, 0.1)",
      tension: 0.4,
    },
    {
      label: "Profit",
      data: [7000000, 7600000, 8400000, 7800000, 9000000, 8000000],
      borderColor: "#4CAF50",
      backgroundColor: "rgba(76, 175, 80, 0.1)",
      tension: 0.4,
    },
  ],
};
```

#### **2. Bar Chart Data Format**

```typescript
interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Example bar chart data
const branchPerformanceData: BarChartData = {
  labels: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  datasets: [
    {
      label: "Revenue",
      data: [45000000, 38000000, 32000000, 28000000, 25000000],
      backgroundColor: [
        "rgba(33, 150, 243, 0.8)",
        "rgba(76, 175, 80, 0.8)",
        "rgba(255, 193, 7, 0.8)",
        "rgba(244, 67, 54, 0.8)",
        "rgba(156, 39, 176, 0.8)",
      ],
      borderColor: [
        "rgba(33, 150, 243, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(255, 193, 7, 1)",
        "rgba(244, 67, 54, 1)",
        "rgba(156, 39, 176, 1)",
      ],
      borderWidth: 1,
    },
  ],
};
```

#### **3. Pie Chart Data Format**

```typescript
interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Example pie chart data
const productDistributionData: PieChartData = {
  labels: ["Product A", "Product B", "Product C", "Product D"],
  datasets: [
    {
      data: [35, 25, 20, 20],
      backgroundColor: [
        "rgba(33, 150, 243, 0.8)",
        "rgba(76, 175, 80, 0.8)",
        "rgba(255, 193, 7, 0.8)",
        "rgba(244, 67, 54, 0.8)",
      ],
      borderColor: [
        "rgba(33, 150, 243, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(255, 193, 7, 1)",
        "rgba(244, 67, 54, 1)",
      ],
      borderWidth: 2,
    },
  ],
};
```

---

## **🔍 METRICS CALCULATIONS**

### **Business Logic Calculations**

#### **1. Revenue Calculations**

```python
# backend/services/metrics_service.py
class MetricsService:
    def calculate_revenue_metrics(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Calculate comprehensive revenue metrics"""
        total_revenue = data['revenue'].sum()
        avg_revenue = data['revenue'].mean()
        revenue_std = data['revenue'].std()

        # Revenue by branch
        revenue_by_branch = data.groupby('branch')['revenue'].sum().to_dict()

        # Revenue by product
        revenue_by_product = data.groupby('product')['revenue'].sum().to_dict()

        return {
            'total_revenue': total_revenue,
            'average_revenue': avg_revenue,
            'revenue_standard_deviation': revenue_std,
            'revenue_by_branch': revenue_by_branch,
            'revenue_by_product': revenue_by_product
        }
```

#### **2. Profitability Calculations**

```python
def calculate_profitability_metrics(self, data: pd.DataFrame) -> Dict[str, Any]:
    """Calculate profitability metrics"""
    total_revenue = data['revenue'].sum()
    total_profit = data['profit'].sum()

    # Profit margin
    profit_margin = (total_profit / total_revenue) * 100 if total_revenue > 0 else 0

    # Profit by branch
    profit_by_branch = data.groupby('branch')['profit'].sum().to_dict()

    # Profit by product
    profit_by_product = data.groupby('product')['profit'].sum().to_dict()

    return {
        'total_profit': total_profit,
        'profit_margin_percentage': profit_margin,
        'profit_by_branch': profit_by_branch,
        'profit_by_product': profit_by_product
    }
```

#### **3. Growth Calculations**

```python
def calculate_growth_metrics(self, current_data: pd.DataFrame,
                           previous_data: pd.DataFrame) -> Dict[str, Any]:
    """Calculate growth metrics between periods"""
    current_revenue = current_data['revenue'].sum()
    previous_revenue = previous_data['revenue'].sum()

    current_profit = current_data['profit'].sum()
    previous_profit = previous_data['profit'].sum()

    # Revenue growth
    revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100 \
        if previous_revenue > 0 else 0

    # Profit growth
    profit_growth = ((current_profit - previous_profit) / previous_profit) * 100 \
        if previous_profit > 0 else 0

    return {
        'revenue_growth_percentage': revenue_growth,
        'profit_growth_percentage': profit_growth,
        'current_revenue': current_revenue,
        'previous_revenue': previous_revenue,
        'current_profit': current_profit,
        'previous_profit': previous_profit
    }
```

---

## **📊 PERFORMANCE METRICS**

### **System Performance Metrics**

#### **1. Response Time Metrics**

- **API Response Time**: Average response time for API endpoints
- **GraphQL Query Time**: Query execution time
- **Database Query Time**: Database operation performance
- **Frontend Render Time**: Component rendering performance

#### **2. Throughput Metrics**

- **Requests per Second**: API request handling capacity
- **Concurrent Users**: System capacity under load
- **Data Processing Rate**: File processing speed
- **Query Throughput**: Analytics query performance

#### **3. Error Rate Metrics**

- **API Error Rate**: Percentage of failed API requests
- **Data Validation Errors**: File validation failure rate
- **System Errors**: Application error frequency
- **User Experience Errors**: Frontend error occurrence

### **Performance Monitoring Implementation**

#### **Frontend Performance Tracking**

```typescript
// Performance monitoring utility
export const trackPerformance = (
  metric: string,
  value: number,
  tags?: Record<string, string>
) => {
  // Send performance metrics to monitoring service
  console.log(`Performance Metric: ${metric} = ${value}`, tags);

  // In production, send to actual monitoring service
  // analytics.track('performance', { metric, value, tags });
};

// Usage examples
trackPerformance("component_render_time", 150, { component: "KpiCard" });
trackPerformance("api_response_time", 250, { endpoint: "/api/kpis/summary" });
```

#### **Backend Performance Monitoring**

```python
# backend/middleware/performance_middleware.py
import time
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware

class PerformanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = time.time() - start_time

        # Log performance metrics
        logger.info(f"Request processed in {process_time:.3f}s", extra={
            'endpoint': request.url.path,
            'method': request.method,
            'response_time': process_time
        })

        return response
```

---

## **🔮 FUTURE METRICS ENHANCEMENTS**

### **Short-term (Next 2-4 weeks)**

- **Advanced KPI Calculations**: More sophisticated business metrics
- **Real-time Metrics**: Live updating KPI displays
- **Custom Metric Builder**: User-defined metric creation

### **Medium-term (Next 2-3 months)**

- **Predictive Analytics**: Trend forecasting and predictions
- **Machine Learning Metrics**: AI-powered insights
- **Comparative Analysis**: Benchmarking and competitive metrics

### **Long-term (Next 6-12 months)**

- **AI-Powered Insights**: Automated business intelligence
- **Advanced Forecasting**: Multi-variable prediction models
- **Real-time Streaming**: Live data pipeline metrics

---

## **📚 Related Documentation**

- **[COMPREHENSIVE_SYSTEM_REPORT.md](COMPREHENSIVE_SYSTEM_REPORT.md)** - Complete system status
- **[QUICK_START.md](QUICK_START.md)** - Getting started guide
- **[TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md)** - API and technical details
- **[ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md)** - System architecture

---

**Last Updated**: August 26, 2025
