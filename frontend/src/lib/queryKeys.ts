// Hierarchical query key factory for React Query
export const queryKeys = {
  sales: ['sales'] as const,
  kpis: ['kpis'] as const,
  analytics: ['analytics'] as const,

  // KPI queries
  salesPerformance: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'performance',
    filters,
  ] as const,
  targetAttainment: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'targetAttainment',
    filters,
  ] as const,
  marginTrends: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'marginTrends',
    filters,
  ] as const,
  profitabilityByDimension: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'profitabilityByDimension',
    filters,
  ] as const,
  returnsAnalysis: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'returnsAnalysis',
    filters,
  ] as const,
  topCustomers: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'topCustomers',
    filters,
  ] as const,
  customerValue: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'customerValue',
    filters,
  ] as const,

  // Analytics/Product queries
  salesData: (filters: { dateRange: any; branch?: string | null; productLine?: string | null }) => [
    ...queryKeys.sales,
    'data',
    {
      dateRange: filters.dateRange,
      branch: filters.branch,
      productLine: filters.productLine,
    },
  ] as const,
  monthlyTrends: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.analytics,
    'trends',
    'monthly',
    filters,
  ] as const,
  productAnalytics: (filters: { dateRange: any; productLine?: string | null }) => [
    ...queryKeys.analytics,
    'products',
    filters,
  ] as const,
  branchPerformance: (filters: { dateRange: any; branch?: string; productLine?: string }) => [
    'branchPerformance',
    filters,
  ] as const,
  salespersonProductMix: (filters: { dateRange: any; branch?: string; productLine?: string }) => [
    'salespersonProductMix',
    filters,
  ] as const,
  dataRange: (filters: {}) => [
    'dataRange',
    filters,
  ] as const,
  
  // Page-level queries
  dashboard: (filters: any) => [
    'dashboard',
    filters,
  ] as const,
  salesPage: (filters: any) => [
    'salesPage',
    filters,
  ] as const,
  productsPage: (filters: any) => [
    'productsPage',
    filters,
  ] as const,
  branchesPage: (filters: any) => [
    'branchesPage',
    filters,
  ] as const,
  profitabilityPage: (filters: any) => [
    'profitabilityPage',
    filters,
  ] as const,
  
  // All queries
  all: ['all'] as const,
}; 