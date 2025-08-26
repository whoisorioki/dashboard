import { apiClient } from './apiClient';

export interface DashboardData {
  revenueSummary?: {
    totalRevenue: number;
    grossProfit: number;
    netSales: number;
    transactionCount: number;
    averageTransactionValue: number;
    profitMargin: number;
    monthlyGrowth: number;
    topPerformingBranch: string;
    topSellingProduct: string;
    lastUpdated: string;
    dataSource: string;
    period: string;
  };
  monthlySalesGrowth?: Array<{
    month: string;
    sales: number;
    growth: number;
  }>;
  targetAttainment?: {
    currentTarget: number;
    achieved: number;
    percentage: number;
  };
  productPerformance?: Array<{
    productLine: string;
    sales: number;
    margin: number;
    units: number;
  }>;
  branchProductHeatmap?: Array<{
    branch: string;
    productLine: string;
    sales: number;
    margin: number;
  }>;
  topCustomers?: Array<{
    customer: string;
    sales: number;
    transactions: number;
    margin: number;
  }>;
  marginTrends?: Array<{
    period: string;
    margin: number;
    trend: number;
  }>;
  returnsAnalysis?: Array<{
    productLine: string;
    returns: number;
    value: number;
    reason: string;
  }>;
  profitabilityByDimension?: Array<{
    dimension: string;
    value: string;
    sales: number;
    margin: number;
  }>;
  branchList?: Array<{
    branch: string;
    sales: number;
    margin: number;
  }>;
  productAnalytics?: Array<{
    productLine: string;
    itemGroup: string;
    sales: number;
    margin: number;
  }>;
}

export const dashboardService = {
  async getDashboardData(startDate: string, endDate: string, branch?: string, productLine?: string, itemGroups?: string[]): Promise<DashboardData> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(branch && { branch }),
        ...(productLine && { product_line: productLine }),
        ...(itemGroups && itemGroups.length > 0 && { item_groups: itemGroups.join(',') })
      });

      // Fetch KPI data
      const kpiResponse = await apiClient.get(`/api/kpis/summary?${params}`);
      const kpiData = kpiResponse.data?.data;

      // Fetch chart data
      const salesTrendResponse = await apiClient.get(`/api/charts/sales-trend?${params}`);
      const productPerformanceResponse = await apiClient.get(`/api/charts/product-performance?${params}`);
      const branchPerformanceResponse = await apiClient.get(`/api/charts/branch-performance?${params}`);

      // Fetch table data
      const salesDataResponse = await apiClient.get(`/api/tables/sales-data?${params}`);
      const productDataResponse = await apiClient.get(`/api/tables/product-data?${params}`);

      // Fetch filter options
      const filtersResponse = await apiClient.get('/api/filters/options');
      const filtersData = filtersResponse.data?.data;

      // Transform and combine all data into dashboard format
      const dashboardData: DashboardData = {
        revenueSummary: kpiData,
        monthlySalesGrowth: this.transformSalesTrendData(salesTrendResponse.data?.data),
        targetAttainment: this.calculateTargetAttainment(kpiData),
        productPerformance: this.transformProductPerformanceData(productPerformanceResponse.data?.data),
        branchProductHeatmap: this.transformBranchPerformanceData(branchPerformanceResponse.data?.data),
        topCustomers: this.transformSalesDataToTopCustomers(salesDataResponse.data?.data),
        marginTrends: this.calculateMarginTrends(kpiData),
        returnsAnalysis: this.transformProductDataToReturns(productDataResponse.data?.data),
        profitabilityByDimension: this.transformBranchPerformanceData(branchPerformanceResponse.data?.data),
        branchList: filtersData?.branches || [],
        productAnalytics: this.transformProductPerformanceData(productPerformanceResponse.data?.data),
      };

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async getPreviousPeriodData(startDate: string, endDate: string, branch?: string, productLine?: string, itemGroups?: string[]): Promise<DashboardData> {
    try {
      // For previous period, we'll use the same endpoints but with different dates
      // This is a simplified approach - you might want to create specific endpoints for historical data
      return await this.getDashboardData(startDate, endDate, branch, productLine, itemGroups);
    } catch (error) {
      console.error('Error fetching previous period data:', error);
      throw error;
    }
  },

  // Data transformation methods
  transformSalesTrendData(data: any): Array<{ month: string; sales: number; growth: number }> {
    if (!data || !data.labels) return [];
    
    return data.labels.map((label: string, index: number) => ({
      month: label,
      sales: data.datasets?.[0]?.data?.[index] || 0,
      growth: index > 0 ? ((data.datasets?.[0]?.data?.[index] || 0) - (data.datasets?.[0]?.data?.[index - 1] || 0)) / (data.datasets?.[0]?.data?.[index - 1] || 1) * 100 : 0
    }));
  },

  transformProductPerformanceData(data: any): Array<{ productLine: string; sales: number; margin: number; units: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
      productLine: item.productLine || item.product || 'Unknown',
      sales: item.sales || item.revenue || 0,
      margin: item.margin || item.profit || 0,
      units: item.units || item.quantity || 0
    }));
  },

  transformBranchPerformanceData(data: any): Array<{ branch: string; productLine: string; sales: number; margin: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
      branch: item.branch || item.branchName || 'Unknown',
      productLine: item.productLine || item.product || 'All',
      sales: item.sales || item.revenue || 0,
      margin: item.margin || item.profit || 0
    }));
  },

  transformSalesDataToTopCustomers(data: any): Array<{ customer: string; sales: number; transactions: number; margin: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
      customer: item.customer || item.customerName || item.salesPerson || 'Unknown',
      sales: item.sales || item.revenue || 0,
      transactions: item.transactions || item.transactionCount || 1,
      margin: item.margin || item.profit || 0
    }));
  },

  transformProductDataToReturns(data: any): Array<{ productLine: string; returns: number; value: number; reason: string }> {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
      productLine: item.productLine || item.product || 'Unknown',
      returns: item.returns || item.returnCount || 0,
      value: item.value || item.returnValue || 0,
      reason: item.reason || 'N/A'
    }));
  },

  calculateTargetAttainment(kpiData: any): { currentTarget: number; achieved: number; percentage: number } | null {
    if (!kpiData) return null;
    
    const target = 250000000; // 250M KSh target
    const achieved = kpiData.totalRevenue || 0;
    
    return {
      currentTarget: target,
      achieved,
      percentage: (achieved / target) * 100
    };
  },

  calculateMarginTrends(kpiData: any): Array<{ period: string; margin: number; trend: number }> {
    if (!kpiData) return [];
    
    const currentMargin = kpiData.profitMargin || 0;
    
    return [
      { period: 'Current', margin: currentMargin, trend: 0 },
      { period: 'Previous', margin: Math.max(0, currentMargin - 5), trend: -5 },
      { period: 'Trend', margin: currentMargin + 2, trend: 2 }
    ];
  }
};
