import { apiClient } from './apiClient';

export interface ProductData {
  productPerformance: Array<{
    productLine: string;
    sales: number;
    margin: number;
    units: number;
  }>;
  topSellingProducts: Array<{
    product: string;
    sales: number;
    units: number;
    margin: number;
  }>;
  productMix: Array<{
    productLine: string;
    percentage: number;
    sales: number;
  }>;
  productTrends: Array<{
    period: string;
    sales: number;
    growth: number;
  }>;
}

export const productsService = {
  async getProductData(startDate: string, endDate: string, branch?: string, productLine?: string): Promise<ProductData> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(branch && { branch }),
        ...(productLine && { product_line: productLine })
      });

      // Fetch product performance data
      const productPerformanceResponse = await apiClient.get(`/api/charts/product-performance?${params}`);
      const productPerformanceData = productPerformanceResponse.data?.data;

      // Fetch product table data
      const productDataResponse = await apiClient.get(`/api/tables/product-data?${params}`);
      const productData = productDataResponse.data?.data;

      // Transform and combine data
      const productDataResult: ProductData = {
        productPerformance: this.transformProductPerformanceData(productPerformanceData),
        topSellingProducts: this.transformProductDataToTopSelling(productData),
        productMix: this.calculateProductMix(productPerformanceData),
        productTrends: this.calculateProductTrends(productPerformanceData),
      };

      return productDataResult;
    } catch (error) {
      console.error('Error fetching product data:', error);
      throw error;
    }
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

  transformProductDataToTopSelling(data: any): Array<{ product: string; sales: number; units: number; margin: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    // Group by product and aggregate
    const productsByLine: Record<string, { product: string; sales: number; units: number; margin: number }> = {};
    
    data.forEach((item: any) => {
      const product = item.productLine || item.product || 'Unknown';
      if (!productsByLine[product]) {
        productsByLine[product] = { product, sales: 0, units: 0, margin: 0 };
      }
      productsByLine[product].sales += item.sales || item.revenue || 0;
      productsByLine[product].units += item.units || item.quantity || 0;
      productsByLine[product].margin += item.margin || item.profit || 0;
    });

    return Object.values(productsByLine)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  },

  calculateProductMix(data: any): Array<{ productLine: string; percentage: number; sales: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    const totalSales = data.reduce((sum: number, item: any) => sum + (item.sales || item.revenue || 0), 0);
    
    if (totalSales === 0) return [];
    
    return data.map((item: any) => ({
      productLine: item.productLine || item.product || 'Unknown',
      sales: item.sales || item.revenue || 0,
      percentage: ((item.sales || item.revenue || 0) / totalSales) * 100
    })).sort((a, b) => b.percentage - a.percentage);
  },

  calculateProductTrends(data: any): Array<{ period: string; sales: number; growth: number }> {
    if (!data || !Array.isArray(data)) return [];
    
    // For now, create a simple trend based on current data
    // In a real implementation, this would fetch historical data
    const totalSales = data.reduce((sum: number, item: any) => sum + (item.sales || item.revenue || 0), 0);
    
    return [
      { period: 'Current', sales: totalSales, growth: 0 },
      { period: 'Previous', sales: totalSales * 0.9, growth: -10 },
      { period: 'Trend', sales: totalSales * 1.05, growth: 5 }
    ];
  }
};
