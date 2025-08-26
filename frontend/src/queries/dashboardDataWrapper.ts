import { GraphQLClient } from 'graphql-request';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Define the variables interface
export interface DashboardDataQueryVariables {
  startDate: string;
  endDate: string;
  branch?: string | null;
  productLine?: string | null;
  itemGroups?: string[] | null;
  target?: number | null;
}

// Flattened data structure that matches what the frontend expects
export type FlattenedDashboardData = {
  // From dashboardData
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
  branchProductHeatmap: Array<{
    branch: string;
    product: string;
    sales?: number | null;
  }>;
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
  // From root level
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
};

// Mock implementation for now - we'll replace this with actual GraphQL calls
const mockDashboardData: FlattenedDashboardData = {
  revenueSummary: {
    totalRevenue: 0,
    netSales: 0,
    grossProfit: 0,
    lineItemCount: 0,
    returnsValue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    uniqueProducts: 0,
    uniqueBranches: 0,
    uniqueEmployees: 0,
    netUnitsSold: 0,
  },
  monthlySalesGrowth: [],
  targetAttainment: {
    attainmentPercentage: 0,
    totalSales: 0,
    target: 0,
  },
  productPerformance: [],
  branchProductHeatmap: [],
  topCustomers: [],
  marginTrends: [],
  returnsAnalysis: [],
  profitabilityByDimension: [],
  branchList: [],
  productAnalytics: [],
  dataAvailabilityStatus: {
    status: "loading",
    isMockData: true,
    isFallback: false,
    druidConnected: false,
    message: "Mock data loaded",
  },
  systemHealth: { status: "healthy" },
  druidHealth: { druidStatus: "unknown", isAvailable: false },
  druidDatasources: { datasources: [], count: 0 },
  dataRange: { earliestDate: "", latestDate: "", totalRecords: 0 },
  salesPerformance: [],
  salespersonProductMix: [],
  branchPerformance: [],
  branchGrowth: [],
};

// Wrapper hook that provides mock data for now
export const useDashboardData = <
  TData = FlattenedDashboardData,
  TError = unknown
>(
  client: GraphQLClient,
  variables: DashboardDataQueryVariables,
  options?: UseQueryOptions<FlattenedDashboardData, TError, TData>,
  headers?: any
) => {
  // For now, return mock data
  // TODO: Implement actual GraphQL query when backend is ready
  return useQuery<FlattenedDashboardData, TError, TData>({
    queryKey: ['dashboardData', variables],
    queryFn: () => Promise.resolve(mockDashboardData),
    ...options,
  });
};
