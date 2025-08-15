# API Contracts: Consolidated API Design & Implementation

## 🎯 **Overview**

This document provides the **comprehensive API design** for the Sales Analytics Dashboard, including GraphQL schema definitions, query patterns, response formats, error handling, and implementation details.

## 🏗️ **Architecture Overview**

### **API Stack**

- **Frontend**: React + TypeScript + Apollo Client
- **GraphQL**: Strawberry GraphQL (Python)
- **Backend**: FastAPI + Polars + Druid
- **Data Processing**: Polars LazyFrames for performance

## 🔗 **GraphQL Schema Definitions**

### **Core Types**

```python
import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class RevenueSummary:
    """Revenue summary metrics for dashboard"""
    total_revenue: float = strawberry.field(
        description="Gross revenue before any deductions"
    )
    net_sales: float = strawberry.field(
        description="Revenue after returns and adjustments"
    )
    gross_profit: float = strawberry.field(
        description="Revenue minus cost of goods sold"
    )
    gross_profit_margin: float = strawberry.field(
        description="Gross profit as percentage of revenue"
    )
    total_transactions: int = strawberry.field(
        description="Total number of transactions"
    )
    unique_products: int = strawberry.field(
        description="Number of unique products"
    )
    unique_branches: int = strawberry.field(
        description="Number of unique branches"
    )
    unique_employees: int = strawberry.field(
        description="Number of unique employees"
    )
```

### **Query Schema**

```python
@strawberry.type
class Query:
    @strawberry.field
    async def revenue_summary(
        self,
        start_date: str,
        end_date: str,
        branch: Optional[str] = None,
        product_line: Optional[str] = None
    ) -> RevenueSummary:
        """Get revenue summary metrics"""
        # Implementation here

    @strawberry.field
    async def monthly_sales_growth(
        self,
        start_date: str,
        end_date: str,
        branch: Optional[str] = None
    ) -> List[MonthlySalesGrowthEntry]:
        """Get monthly sales growth data"""
        # Implementation here
```

## 📋 **Query Patterns**

### **Dashboard Data Query**

```graphql
query DashboardData($startDate: String!, $endDate: String!) {
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
}
```

## 🚨 **Error Handling**

### **Error Response Format**

```json
{
  "data": null,
  "errors": [
    {
      "message": "Failed to fetch data",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    }
  ]
}
```

### **Error Codes**

- `VALIDATION_ERROR`: Invalid input parameters
- `DATA_NOT_FOUND`: No data for specified filters
- `INTERNAL_ERROR`: Backend processing error
- `QUERY_TIMEOUT`: Query execution timeout

## 🔄 **Data Flow**

1. **GraphQL Query**: Frontend sends query with variables
2. **Resolver Execution**: Strawberry resolver calls service
3. **Data Fetching**: Service queries Druid through Polars
4. **Lazy Processing**: Apply filters using Polars LazyFrames
5. **Metric Calculation**: Calculate metrics using standardized classes
6. **Response**: Return formatted data through GraphQL

## 📱 **Frontend Integration**

### **Apollo Client Setup**

```typescript
import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: "all" },
    query: { errorPolicy: "all" },
  },
});
```

### **React Query Usage**

```typescript
const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
  variables: { startDate, endDate },
  onSuccess: (data) => console.log("Query successful"),
  onError: (error) => console.error("Query failed:", error),
});
```

## 📋 **Implementation Status**

### **✅ Completed**

- [x] GraphQL schema definitions
- [x] Query resolvers
- [x] Error handling patterns
- [x] Response formats

### **🔄 In Progress**

- [ ] Performance optimization
- [ ] Comprehensive error handling
- [ ] Query caching strategies

### **📝 To Do**

- [ ] Unit tests for resolvers
- [ ] Integration tests
- [ ] Performance benchmarking

---

**This document serves as the authoritative reference for all API contracts and GraphQL operations.**
