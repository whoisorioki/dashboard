# 📚 Technical Reference Guide - Sales Analytics Dashboard

## **📋 Overview**

This guide consolidates all technical reference information including API documentation, contracts, and component mapping for the Sales Analytics Dashboard.

---

## **🔌 API DOCUMENTATION**

### **GraphQL API Endpoints**

#### **Main GraphQL Endpoint**

- **URL**: `http://localhost:8000/graphql`
- **Status**: ✅ **OPERATIONAL**
- **Schema**: Auto-generated from Strawberry GraphQL

#### **REST API Endpoints**

##### **Health & Status**

```bash
GET / - Health check
GET /health - System health status
GET /docs - API documentation (Swagger UI)
```

##### **Analytics Endpoints**

```bash
GET /api/kpis/summary - KPI summary data
GET /api/charts/sales-trend - Sales trend chart data
GET /api/charts/product-performance - Product performance data
GET /api/charts/branch-performance - Branch performance data
GET /api/tables/sales-data - Sales data for tables
GET /api/tables/product-data - Product data for tables
GET /api/filters/options - Available filter options
```

##### **Data Ingestion Endpoints**

```bash
POST /api/ingest/upload - File upload processing
GET /api/ingest/status/{task_id} - Task status monitoring
POST /api/ingest/analyze-schema - Schema analysis
```

---

## **📋 API CONTRACTS & SPECIFICATIONS**

### **Data Models**

#### **KPI Summary Response**

```json
{
  "total_revenue": 219000000,
  "total_profit": 45000000,
  "total_transactions": 15000,
  "profit_margin": 20.5,
  "period": "2025-01-01 to 2025-08-26"
}
```

#### **Chart Data Response**

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    {
      "label": "Revenue",
      "data": [35000000, 38000000, 42000000, 39000000, 45000000, 40000000],
      "borderColor": "#2196F3",
      "backgroundColor": "rgba(33, 150, 243, 0.1)"
    }
  ]
}
```

#### **Table Data Response**

```json
{
  "columns": ["Date", "Branch", "Product", "Revenue", "Profit"],
  "data": [
    ["2025-08-26", "Nairobi", "Product A", 1500000, 300000],
    ["2025-08-26", "Mombasa", "Product B", 2200000, 440000]
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 15000
  }
}
```

### **Error Response Format**

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2025-08-26T10:30:00Z"
}
```

---

## **🔗 FRONTEND-BACKEND MAPPING**

### **Component Architecture**

#### **Page Structure Mapping**

```
Dashboard Pages → GraphQL Queries → Backend Services → Data Sources
```

#### **Component Hierarchy**

```
App (Router)
├── Layout (Sidebar + Header)
├── Dashboard Pages
│   ├── Overview
│   ├── Sales Analytics
│   ├── Product Analytics
│   ├── Branch Analytics
│   ├── Profitability
│   └── Data Ingestion
└── Shared Components
    ├── KpiCard
    ├── ChartCard
    ├── DataTable
    └── FilterPanel
```

### **Data Flow Mapping**

#### **KPI Components**

- **Component**: `KpiCard`
- **Data Source**: GraphQL query to `/api/kpis/summary`
- **State Management**: React Query with caching
- **Error Handling**: Error boundary with fallback display

#### **Chart Components**

- **Component**: `ChartCard` wrapper
- **Data Source**: GraphQL queries to chart endpoints
- **Chart Libraries**: Nivo, Recharts, ECharts
- **State Management**: React Query with real-time updates

#### **Table Components**

- **Component**: `DataTable`
- **Data Source**: GraphQL queries to table endpoints
- **Features**: Pagination, sorting, filtering
- **State Management**: Local state with React Query

#### **Filter Components**

- **Component**: `FilterPanel`
- **Data Source**: GraphQL query to `/api/filters/options`
- **State Management**: Zustand global state
- **Features**: Date ranges, branches, product lines

---

## **🔧 API INTEGRATION PATTERNS**

### **GraphQL Query Pattern**

```typescript
import { useQuery } from "@apollo/client";

const GET_SALES_DATA = gql`
  query GetSalesData($startDate: String!, $endDate: String!) {
    salesData(startDate: $startDate, endDate: $endDate) {
      totalRevenue
      totalProfit
      transactions
      period
    }
  }
`;

function SalesDashboard() {
  const { loading, error, data } = useQuery(GET_SALES_DATA, {
    variables: { startDate: "2025-01-01", endDate: "2025-08-26" },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <SalesCharts data={data.salesData} />;
}
```

### **REST API Pattern**

```typescript
import { useQuery } from "react-query";

const fetchSalesData = async (startDate: string, endDate: string) => {
  const response = await fetch(
    `/api/charts/sales-trend?startDate=${startDate}&endDate=${endDate}`
  );
  if (!response.ok) throw new Error("Failed to fetch sales data");
  return response.json();
};

function SalesDashboard() {
  const { data, isLoading, error } = useQuery(
    ["salesData", startDate, endDate],
    () => fetchSalesData(startDate, endDate)
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <SalesCharts data={data} />;
}
```

---

## **📊 DATA VALIDATION & SCHEMAS**

### **Pandera Schemas**

```python
import pandera as pa
from pandera.typing import Series

class SalesDataSchema(pa.SchemaModel):
    date: Series[str] = pa.Field(description="Transaction date")
    branch: Series[str] = pa.Field(description="Branch name")
    product: Series[str] = pa.Field(description="Product name")
    revenue: Series[float] = pa.Field(ge=0, description="Revenue amount")
    profit: Series[float] = pa.Field(description="Profit amount")
    quantity: Series[int] = pa.Field(ge=0, description="Quantity sold")
```

### **GraphQL Schema Types**

```graphql
type SalesData {
  id: ID!
  date: String!
  branch: String!
  product: String!
  revenue: Float!
  profit: Float!
  quantity: Int!
  createdAt: String!
  updatedAt: String!
}

type KPISummary {
  totalRevenue: Float!
  totalProfit: Float!
  totalTransactions: Int!
  profitMargin: Float!
  period: String!
}

type Query {
  salesData(startDate: String!, endDate: String!): [SalesData!]!
  kpiSummary: KPISummary!
  chartData(chartType: String!, filters: FilterInput): ChartData!
}
```

---

## **🚀 PERFORMANCE OPTIMIZATION**

### **Caching Strategies**

- **React Query**: API response caching with TTL
- **GraphQL**: Query result caching
- **Frontend**: Component memoization with React.memo

### **Data Fetching Patterns**

- **Lazy Loading**: Load data only when needed
- **Pagination**: Handle large datasets efficiently
- **Real-time Updates**: Polling for status changes

### **Error Handling**

- **Graceful Degradation**: Fallback to mock data
- **Retry Logic**: Automatic retry on failure
- **User Feedback**: Clear error messages and recovery options

---

## **📚 Related Documentation**

- **[COMPREHENSIVE_SYSTEM_REPORT.md](COMPREHENSIVE_SYSTEM_REPORT.md)** - Complete system status
- **[QUICK_START.md](QUICK_START.md)** - Getting started guide
- **[CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)** - Configuration setup
- **[ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md)** - System architecture

---

**Last Updated**: August 26, 2025  
**Status**: **CONSOLIDATED TECHNICAL REFERENCE** 📚
