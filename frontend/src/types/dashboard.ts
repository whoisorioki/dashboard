// Simple types for dashboard components - extracted from our wrapper

export interface BranchProductHeatmap {
  branch: string;
  product: string;
  sales?: number | null;
}

export interface DashboardData {
  revenueSummary: {
    totalRevenue?: number | null;
    netSales?: number | null;
    grossProfit?: number | null;
    lineItemCount?: number | null;
    returnsValue?: number | null;
    totalTransactions: number;
    averageTransaction?: number | null;
    uniqueProducts: number;
    uniqueBranches: number;
    uniqueEmployees: number;
    netUnitsSold?: number | null;
  };
  monthlySalesGrowth: Array<{
    date: string;
    totalSales?: number | null;
    grossProfit?: number | null;
  }>;
  targetAttainment: {
    attainmentPercentage?: number | null;
    totalSales?: number | null;
    target?: number | null;
  };
  productPerformance: Array<{
    product: string;
    sales?: number | null;
  }>;
  branchProductHeatmap: Array<BranchProductHeatmap>;
  topCustomers: Array<{
    cardName: string;
    salesAmount?: number | null;
    grossProfit?: number | null;
  }>;
  marginTrends: Array<{
    date: string;
    marginPct?: number | null;
  }>;
  returnsAnalysis: Array<{
    reason: string;
    count: number;
  }>;
  profitabilityByDimension: Array<{
    branch?: string | null;
    grossProfit?: number | null;
    grossMargin?: number | null;
  }>;
  branchList: Array<{
    branch: string;
  }>;
  productAnalytics: Array<{
    itemName: string;
    productLine: string;
    itemGroup: string;
    totalSales: number;
    grossProfit?: number | null;
    margin?: number | null;
    totalQty: number;
    transactionCount: number;
    uniqueBranches: number;
    averagePrice: number;
  }>;
  dataAvailabilityStatus: {
    status: string;
    isMockData: boolean;
    isFallback: boolean;
    druidConnected: boolean;
    message: string;
  };
  systemHealth: {
    status: string;
  };
  druidHealth: {
    druidStatus: string;
    isAvailable: boolean;
  };
  druidDatasources: {
    datasources: Array<string>;
    count: number;
  };
  dataRange: {
    earliestDate: string;
    latestDate: string;
    totalRecords: number;
  };
  salesPerformance: Array<{
    salesPerson: string;
    totalSales?: number | null;
    grossProfit?: number | null;
    transactionCount: number;
    averageSale?: number | null;
    uniqueBranches: number;
    uniqueProducts: number;
    avgMargin?: number | null;
  }>;
  salespersonProductMix: Array<{
    salesperson: string;
    productLine: string;
    avgProfitMargin?: number | null;
  }>;
  branchPerformance: Array<{
    branch: string;
    totalSales?: number | null;
    transactionCount: number;
    averageSale?: number | null;
    uniqueCustomers: number;
    uniqueProducts: number;
  }>;
  branchGrowth: Array<{
    branch: string;
    monthYear: string;
    monthlySales?: number | null;
    growthPct?: number | null;
  }>;
}

export type MonthlySalesGrowth = DashboardData['monthlySalesGrowth'][0];
export type ProductAnalytics = DashboardData['productAnalytics'][0];
export type TargetAttainment = DashboardData['targetAttainment'];
export type SalesPerformance = DashboardData['salesPerformance'][0];
