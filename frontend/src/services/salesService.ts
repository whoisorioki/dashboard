import { apiClient } from './apiClient';

export interface SalesData {
  monthlySalesGrowth: Array<{
    month: string;
    sales: number;
    growth: number;
  }>;
  topPerformers: Array<{
    salesPerson: string;
    sales: number;
    transactions: number;
    margin: number;
  }>;
  salesByBranch: Array<{
    branch: string;
    sales: number;
    transactions: number;
    customers: number;
  }>;
  salesByProduct: Array<{
    product: string;
    sales: number;
    units: number;
    margin: number;
  }>;
}

export const salesService = {
  async getSalesData(startDate: string, endDate: string, branch?: string, productLine?: string): Promise<SalesData> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(branch && { branch }),
        ...(productLine && { product_line: productLine })
      });

      // Fetch sales trend data
      const salesTrendResponse = await apiClient.get(`/api/charts/sales-trend?${params}`);
      const salesTrendData = salesTrendResponse.data?.data;

      // Fetch sales table data
      const salesDataResponse = await apiClient.get(`/api/tables/sales-data?${params}`);
      const salesData = salesDataResponse.data?.data;

      // Fetch product performance data
      const productPerformanceResponse = await apiClient.get(`/api/charts/product-performance?${params}`);
      const productData = productPerformanceResponse.data?.data;

      // Transform and combine data
      const salesDataResult: SalesData = {
        monthlySalesGrowth: this.transformSalesTrendData(salesTrendData),
        topPerformers: this.transformSalesDataToTopPerformers(salesData),
        salesByBranch: this.transformSalesDataToBranchSales(salesData),
        salesByProduct: this.transformProductPerformanceData(productData),
      };

      return salesDataResult;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }
  },

  transformSalesTrendData(data: any): Array<{ month: string; sales: number; growth: number }> {
    if (!data || !data.labels) return [];
    
    return data.labels.map((label: string, index: number) => ({
      month: label,
      sales: data.datasets?.[0]?.data?.[index] || 0,
      growth: index > 0 ? ((data.datasets?.[0]?.data?.[index] || 0) - (data.datasets?.[0]?.data?.[index - 1] || 0)) / (data.datasets?.[0]?.data?.[index - 1] || 1) * 100 : 0
    }));
  },

  transformSalesDataToTopPerformers(data: any): Array<{ salesPerson: string; sales: number; transactions: number; margin: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    // Group by sales person and aggregate
    const salesByPerson = data.reduce((acc: any, item: any) => {
      const person = item.salesPerson || item.customer || 'Unknown';
      if (!acc[person]) {
        acc[person] = { salesPerson: person, sales: 0, transactions: 0, margin: 0 };
      }
      acc[person].sales += item.sales || item.revenue || 0;
      acc[person].transactions += 1;
      acc[person].margin += item.margin || item.profit || 0;
      return acc;
    }, {});

    return (Object.values(salesByPerson) as Array<{ salesPerson: string; sales: number; transactions: number; margin: number }>)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  },

  transformSalesDataToBranchSales(data: any): Array<{ branch: string; sales: number; transactions: number; customers: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    // Group by branch and aggregate
    const salesByBranch = data.reduce((acc: any, item: any) => {
      const branch = item.branch || item.branchName || 'Unknown';
      if (!acc[branch]) {
        acc[branch] = { branch, sales: 0, transactions: 0, customers: new Set() };
      }
      acc[branch].sales += item.sales || item.revenue || 0;
      acc[branch].transactions += 1;
      acc[branch].customers.add(item.customer || item.customerName || 'Unknown');
      return acc;
    }, {});

    return Object.values(salesByBranch).map((item: any) => ({
      branch: item.branch,
      sales: item.sales,
      transactions: item.transactions,
      customers: item.customers.size
    }));
  },

  transformProductPerformanceData(data: any): Array<{ product: string; sales: number; units: number; margin: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
      product: item.productLine || item.product || 'Unknown',
      sales: item.sales || item.revenue || 0,
      units: item.units || item.quantity || 0,
      margin: item.margin || item.profit || 0
    }));
  }
};
