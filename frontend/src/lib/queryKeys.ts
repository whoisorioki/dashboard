// Hierarchical query key factory for React Query with normalized caching
export const queryKeys = {
  sales: ['sales'] as const,
  kpis: ['kpis'] as const,
  analytics: ['analytics'] as const,

  // KPI queries with normalized cache keys
  salesPerformance: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'performance',
    normalizeFilters(filters),
  ] as const,
  
  targetAttainment: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'targetAttainment',
    normalizeFilters(filters),
  ] as const,
  
  marginTrends: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'marginTrends',
    normalizeFilters(filters),
  ] as const,
  
  profitabilityByDimension: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'profitabilityByDimension',
    normalizeFilters(filters),
  ] as const,
  
  returnsAnalysis: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'returnsAnalysis',
    normalizeFilters(filters),
  ] as const,
  
  topCustomers: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'topCustomers',
    normalizeFilters(filters),
  ] as const,
  
  customerValue: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.kpis,
    'customerValue',
    normalizeFilters(filters),
  ] as const,

  // Analytics/Product queries with normalized cache keys
  salesData: (filters: { dateRange: any; branch?: string | null; productLine?: string | null }) => [
    ...queryKeys.sales,
    'data',
    normalizeFilters(filters),
  ] as const,
  
  monthlyTrends: (filters: { dateRange: any; branch?: string | null }) => [
    ...queryKeys.analytics,
    'trends',
    'monthly',
    normalizeFilters(filters),
  ] as const,
  
  productAnalytics: (filters: { dateRange: any; productLine?: string | null }) => [
    ...queryKeys.analytics,
    'products',
    normalizeFilters(filters),
  ] as const,

  // Dashboard queries with unified cache strategy
  dashboard: (filters: DashboardFilters) => [
    'dashboard',
    'data',
    normalizeFilters(filters),
  ] as const,

  // Monthly sales growth with normalized keys
  monthlySalesGrowth: (filters: { startDate: string; endDate: string; branch?: string; productLine?: string }) => [
    'monthlySalesGrowth',
    normalizeDateFilters(filters),
  ] as const,

  // Branch performance with normalized keys
  branchPerformance: (filters: { startDate: string; endDate: string; productLine?: string }) => [
    'branchPerformance',
    normalizeDateFilters(filters),
  ] as const,

  // Data range query
  dataRange: ['dataRange'] as const,

  // System health queries
  systemHealth: ['systemHealth'] as const,
  druidHealth: ['druidHealth'] as const,
  druidDatasources: ['druidDatasources'] as const,

  // All queries (for cache invalidation)
  all: ['all'] as const,
};

// Type definitions for better type safety
export interface DashboardFilters {
  startDate: string;
  endDate: string;
  branch?: string;
  productLine?: string;
  itemGroups?: string[];
  target?: number;
}

export interface DateFilters {
  startDate: string;
  endDate: string;
  branch?: string;
  productLine?: string;
}

// Normalize filter objects for consistent cache keys
export function normalizeFilters(filters: any): any {
  if (!filters) return {};
  
  return {
    dateRange: filters.dateRange ? {
      start: filters.dateRange.start?.toISOString?.() || filters.dateRange.start,
      end: filters.dateRange.end?.toISOString?.() || filters.dateRange.end,
    } : undefined,
    branch: filters.branch || 'all',
    productLine: filters.productLine || 'all',
    itemGroups: filters.itemGroups?.sort() || [],
    target: filters.target || 0,
  };
}

// Normalize date filters for consistent cache keys
export function normalizeDateFilters(filters: DateFilters): DateFilters {
  return {
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    branch: filters.branch || 'all',
    productLine: filters.productLine || 'all',
  };
}

// Cache key utilities
export const cacheUtils = {
  // Create a stable cache key from any object
  createStableKey: (prefix: string, data: any): string => {
    const normalized = JSON.stringify(data, Object.keys(data).sort());
    return `${prefix}-${normalized}`;
  },

  // Check if two filters are equivalent for caching
  areFiltersEqual: (filters1: any, filters2: any): boolean => {
    const key1 = cacheUtils.createStableKey('', filters1);
    const key2 = cacheUtils.createStableKey('', filters2);
    return key1 === key2;
  },

  // Get cache key for dashboard data
  getDashboardKey: (filters: DashboardFilters): readonly unknown[] => {
    return queryKeys.dashboard(filters);
  },

  // Get cache key for monthly sales growth
  getMonthlySalesKey: (filters: DateFilters): readonly unknown[] => {
    return queryKeys.monthlySalesGrowth(filters);
  },
}; 