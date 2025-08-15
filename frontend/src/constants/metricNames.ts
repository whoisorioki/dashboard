/**
 * Standardized Metric Names and Titles
 * 
 * This file defines the standardized metric names and titles used across the frontend.
 * All metric names should be consistent with the backend GraphQL schema and follow
 * the naming conventions defined in the documentation.
 */

// Standardized metric names (camelCase for frontend)
export const METRIC_NAMES = {
  // Revenue Metrics
  TOTAL_REVENUE: 'totalRevenue',
  NET_SALES: 'netSales',
  TOTAL_SALES: 'totalSales',
  
  // Profit Metrics
  GROSS_PROFIT: 'grossProfit',
  GROSS_PROFIT_MARGIN: 'grossProfitMargin',
  
  // Transaction Metrics
  TOTAL_TRANSACTIONS: 'totalTransactions',
  AVERAGE_TRANSACTION: 'averageTransaction',
  
  // Quantity Metrics
  TOTAL_UNITS_SOLD: 'totalUnitsSold',
  NET_UNITS_SOLD: 'netUnitsSold',
  
  // Returns Metrics
  RETURNS_VALUE: 'returnsValue',
  RETURN_RATE: 'returnRate',
  
  // Unique Count Metrics
  UNIQUE_PRODUCTS: 'uniqueProducts',
  UNIQUE_BRANCHES: 'uniqueBranches',
  UNIQUE_EMPLOYEES: 'uniqueEmployees',
  UNIQUE_CUSTOMERS: 'uniqueCustomers',
} as const;

// Standardized KPI card titles
export const KPI_TITLES = {
  [METRIC_NAMES.TOTAL_REVENUE]: 'Total Revenue',
  [METRIC_NAMES.NET_SALES]: 'Net Sales',
  [METRIC_NAMES.TOTAL_SALES]: 'Total Sales',
  [METRIC_NAMES.GROSS_PROFIT]: 'Gross Profit',
  [METRIC_NAMES.GROSS_PROFIT_MARGIN]: 'Gross Profit Margin %',
  [METRIC_NAMES.TOTAL_TRANSACTIONS]: 'Total Transactions',
  [METRIC_NAMES.AVERAGE_TRANSACTION]: 'Average Transaction',
  [METRIC_NAMES.TOTAL_UNITS_SOLD]: 'Total Units Sold',
  [METRIC_NAMES.NET_UNITS_SOLD]: 'Net Units Sold',
  [METRIC_NAMES.RETURNS_VALUE]: 'Returns Value',
  [METRIC_NAMES.RETURN_RATE]: 'Return Rate %',
  [METRIC_NAMES.UNIQUE_PRODUCTS]: 'Unique Products',
  [METRIC_NAMES.UNIQUE_BRANCHES]: 'Unique Branches',
  [METRIC_NAMES.UNIQUE_EMPLOYEES]: 'Unique Employees',
  [METRIC_NAMES.UNIQUE_CUSTOMERS]: 'Unique Customers',
} as const;

// Standardized tooltip descriptions
export const TOOLTIP_DESCRIPTIONS = {
  [METRIC_NAMES.TOTAL_REVENUE]: 'Gross revenue before any deductions or adjustments',
  [METRIC_NAMES.NET_SALES]: 'Revenue after returns and adjustments',
  [METRIC_NAMES.TOTAL_SALES]: 'Total sales revenue (alias for net sales)',
  [METRIC_NAMES.GROSS_PROFIT]: 'Revenue minus cost of goods sold',
  [METRIC_NAMES.GROSS_PROFIT_MARGIN]: 'Gross profit margin percentage for the selected period',
  [METRIC_NAMES.TOTAL_TRANSACTIONS]: 'Total number of transactions for the selected period',
  [METRIC_NAMES.AVERAGE_TRANSACTION]: 'Average transaction value for the selected period',
  [METRIC_NAMES.TOTAL_UNITS_SOLD]: 'Total units sold for the selected period',
  [METRIC_NAMES.NET_UNITS_SOLD]: 'Units sold minus returns for the selected period',
  [METRIC_NAMES.RETURNS_VALUE]: 'Total value of returned items for the selected period',
  [METRIC_NAMES.RETURN_RATE]: 'Return rate as percentage for the selected period',
  [METRIC_NAMES.UNIQUE_PRODUCTS]: 'Number of unique products for the selected period',
  [METRIC_NAMES.UNIQUE_BRANCHES]: 'Number of unique branches for the selected period',
  [METRIC_NAMES.UNIQUE_EMPLOYEES]: 'Number of unique employees for the selected period',
  [METRIC_NAMES.UNIQUE_CUSTOMERS]: 'Number of unique customers for the selected period',
} as const;

// Metric categories for grouping
export const METRIC_CATEGORIES = {
  REVENUE: [METRIC_NAMES.TOTAL_REVENUE, METRIC_NAMES.NET_SALES, METRIC_NAMES.TOTAL_SALES],
  PROFIT: [METRIC_NAMES.GROSS_PROFIT, METRIC_NAMES.GROSS_PROFIT_MARGIN],
  TRANSACTIONS: [METRIC_NAMES.TOTAL_TRANSACTIONS, METRIC_NAMES.AVERAGE_TRANSACTION],
  QUANTITY: [METRIC_NAMES.TOTAL_UNITS_SOLD, METRIC_NAMES.NET_UNITS_SOLD],
  RETURNS: [METRIC_NAMES.RETURNS_VALUE, METRIC_NAMES.RETURN_RATE],
  UNIQUE_COUNTS: [METRIC_NAMES.UNIQUE_PRODUCTS, METRIC_NAMES.UNIQUE_BRANCHES, METRIC_NAMES.UNIQUE_EMPLOYEES, METRIC_NAMES.UNIQUE_CUSTOMERS],
} as const;

// Helper function to get KPI title
export const getKpiTitle = (metricName: keyof typeof METRIC_NAMES): string => {
  return KPI_TITLES[METRIC_NAMES[metricName]] || metricName;
};

// Helper function to get tooltip description
export const getTooltipDescription = (metricName: keyof typeof METRIC_NAMES): string => {
  return TOOLTIP_DESCRIPTIONS[METRIC_NAMES[metricName]] || '';
};

// Helper function to check if metric is a monetary value
export const isMonetaryMetric = (metricName: string): boolean => {
  const monetaryMetrics = [
    METRIC_NAMES.TOTAL_REVENUE,
    METRIC_NAMES.NET_SALES,
    METRIC_NAMES.TOTAL_SALES,
    METRIC_NAMES.GROSS_PROFIT,
    METRIC_NAMES.AVERAGE_TRANSACTION,
    METRIC_NAMES.RETURNS_VALUE,
  ];
  return monetaryMetrics.includes(metricName as any);
};

// Helper function to check if metric is a percentage
export const isPercentageMetric = (metricName: string): boolean => {
  const percentageMetrics = [
    METRIC_NAMES.GROSS_PROFIT_MARGIN,
    METRIC_NAMES.RETURN_RATE,
  ];
  return percentageMetrics.includes(metricName as any);
};

// Helper function to check if metric is a count
export const isCountMetric = (metricName: string): boolean => {
  const countMetrics = [
    METRIC_NAMES.TOTAL_TRANSACTIONS,
    METRIC_NAMES.TOTAL_UNITS_SOLD,
    METRIC_NAMES.NET_UNITS_SOLD,
    METRIC_NAMES.UNIQUE_PRODUCTS,
    METRIC_NAMES.UNIQUE_BRANCHES,
    METRIC_NAMES.UNIQUE_EMPLOYEES,
    METRIC_NAMES.UNIQUE_CUSTOMERS,
  ];
  return countMetrics.includes(metricName as any);
}; 