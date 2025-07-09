// Raw Druid Schema Types - Exact field names from Druid
export interface DruidSalesData {
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

// API Response Types for Dashboard KPIs
export interface MonthlySalesGrowthData {
  date: string;
  sales: number;
}

export interface TargetAttainmentData {
  attainment_percentage: number;
  total_sales: number;
}

export interface ProductPerformanceData {
  product: string;
  sales: number;
}

export interface BranchProductHeatmapData {
  branch: string;
  product: string;
  sales: number;
}

// API Options Type
export interface UseApiOptions {
  [key: string]: string | number | boolean | undefined;
}

// Branch Performance Types
export interface BranchPerformanceData {
  Branch: string;          // Branch name
  total_sales: number;      // Total sales amount
  transaction_count: number; // Number of transactions
  average_sale: number;     // Average transaction value
  unique_customers: number; // Unique customers/employees
  unique_products: number;  // Unique products sold
}

export interface BranchListData {
  Branch: string;          // Branch name
  total_sales: number;      // Total sales amount
  last_activity: string;    // Last transaction date
}

export interface BranchGrowthData {
  Branch: string;          // Branch name
  month_year: string;       // Month-year period
  monthly_sales: number;    // Sales for the month
  growth_pct: number;       // Month-over-month growth percentage
}

// Sales Performance Types
export interface SalesPerformanceData {
  SalesPerson: string;
  total_sales: number;
  transaction_count: number;
  average_sale: number;
  unique_branches: number;
  unique_products: number;
}

// Product Analytics Types
export interface ProductAnalyticsData {
  ItemName: string;
  ProductLine: string;
  ItemGroup: string;
  total_sales: number;
  total_qty: number;
  transaction_count: number;
  unique_branches: number;
  average_price: number;
}

// Revenue Summary Types
export interface RevenueSummaryData {
  total_revenue: number;    // Total revenue
  total_transactions: number; // Total transaction count
  average_transaction: number; // Average transaction value
  unique_products: number;  // Unique product count
  unique_branches: number;  // Unique branch count
  unique_employees: number; // Unique employee count
}
