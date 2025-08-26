import { apiClient } from './apiClient';

export interface BranchData {
  branchPerformance: Array<{
    branch: string;
    totalSales: number;
    transactionCount: number;
    averageSale: number;
    uniqueCustomers: number;
    uniqueProducts: number;
  }>;
  branchGrowth: Array<{
    branch: string;
    monthYear: string;
    growthPct: number;
  }>;
  branchProductHeatmap: Array<{
    branch: string;
    product: string;
    sales: number;
  }>;
}

export const branchesService = {
  async getBranchData(startDate: string, endDate: string, branch?: string, productLine?: string): Promise<BranchData> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(branch && { branch }),
        ...(productLine && { product_line: productLine })
      });

      // Fetch branch performance data
      const branchPerformanceResponse = await apiClient.get(`/api/charts/branch-performance?${params}`);
      const branchPerformanceData = branchPerformanceResponse.data?.data;

      // Fetch sales data to calculate branch metrics
      const salesDataResponse = await apiClient.get(`/api/tables/sales-data?${params}`);
      const salesData = salesDataResponse.data?.data;

      // Transform and combine data
      const branchDataResult: BranchData = {
        branchPerformance: this.transformBranchPerformanceData(salesData),
        branchGrowth: this.calculateBranchGrowth(branchPerformanceData),
        branchProductHeatmap: this.transformBranchProductHeatmap(salesData),
      };

      return branchDataResult;
    } catch (error) {
      console.error('Error fetching branch data:', error);
      throw error;
    }
  },

  transformBranchPerformanceData(data: any): Array<{
    branch: string;
    totalSales: number;
    transactionCount: number;
    averageSale: number;
    uniqueCustomers: number;
    uniqueProducts: number;
  }> {
    if (!data || !Array.isArray(data)) return [];
    
    // Group by branch and aggregate
    const branchesData: Record<string, {
      branch: string;
      totalSales: number;
      transactionCount: number;
      customers: Set<string>;
      products: Set<string>;
    }> = {};
    
    data.forEach((item: any) => {
      // Handle both array format [Date, Branch, Revenue, Products, Sales Person] and object format
      let branch, revenue, products, salesPerson;
      
      if (Array.isArray(item)) {
        // Array format: [Date, Branch, Revenue, Products, Sales Person]
        [, branch, revenue, products, salesPerson] = item;
      } else {
        // Object format: { branch, revenue, products, salesPerson }
        branch = item.branch || item.branchName || 'Unknown';
        revenue = item.sales || item.revenue || 0;
        products = item.productLine || item.product || 'Unknown';
        salesPerson = item.customer || item.customerName || 'Unknown';
      }
      
      if (!branchesData[branch]) {
        branchesData[branch] = {
          branch,
          totalSales: 0,
          transactionCount: 0,
          customers: new Set(),
          products: new Set()
        };
      }
      branchesData[branch].totalSales += Number(revenue) || 0;
      branchesData[branch].transactionCount += 1;
      branchesData[branch].customers.add(salesPerson || 'Unknown');
      branchesData[branch].products.add(products || 'Unknown');
    });

    return Object.values(branchesData).map(branch => ({
      branch: branch.branch,
      totalSales: branch.totalSales,
      transactionCount: branch.transactionCount,
      averageSale: branch.totalSales / branch.transactionCount,
      uniqueCustomers: branch.customers.size,
      uniqueProducts: branch.products.size
    }));
  },

  calculateBranchGrowth(data: any): Array<{
    branch: string;
    monthYear: string;
    growthPct: number;
  }> {
    if (!data || !Array.isArray(data)) return [];
    
    // For now, create placeholder growth data
    // In a real implementation, this would fetch historical data
    const branches = [...new Set(data.map((item: any) => item.branch || item.branchName || 'Unknown'))];
    
    return branches.map(branch => ({
      branch,
      monthYear: '2024-12',
      growthPct: Math.random() * 20 - 10 // Random growth between -10% and +10%
    }));
  },

  transformBranchProductHeatmap(data: any): Array<{
    branch: string;
    product: string;
    sales: number;
  }> {
    if (!data || !Array.isArray(data)) return [];
    
    // Group by branch and product
    const heatmapData: Record<string, Record<string, number>> = {};
    
    data.forEach((item: any) => {
      // Handle both array format [Date, Branch, Revenue, Products, Sales Person] and object format
      let branch, revenue, products;
      
      if (Array.isArray(item)) {
        // Array format: [Date, Branch, Revenue, Products, Sales Person]
        [, branch, revenue, products] = item;
      } else {
        // Object format: { branch, revenue, products }
        branch = item.branch || item.branchName || 'Unknown';
        revenue = item.sales || item.revenue || 0;
        products = item.productLine || item.product || 'Unknown';
      }
      
      if (!heatmapData[branch]) {
        heatmapData[branch] = {};
      }
      if (!heatmapData[branch][products]) {
        heatmapData[branch][products] = 0;
      }
      
      heatmapData[branch][products] += Number(revenue) || 0;
    });

    // Flatten to array format
    const result: Array<{ branch: string; product: string; sales: number }> = [];
    Object.entries(heatmapData).forEach(([branch, products]) => {
      Object.entries(products).forEach(([product, sales]) => {
        result.push({ branch, product, sales });
      });
    });

    return result;
  }
};
