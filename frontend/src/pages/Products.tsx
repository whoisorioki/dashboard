import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Inventory2 as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as PriceIcon,
  ShoppingCart as CartIcon,
  Inventory as ProductsIcon,
  Category as CategoryIcon,
  RotateLeft as RotateLeftIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import ProductPerformanceChart from "../components/ProductPerformanceChart";
import { useFilterStore } from "../store/filterStore";
import ChartEmptyState from "../components/states/ChartEmptyState";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import { useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';

const Products = () => {
  const filterStore = useFilterStore();
  const startDate = filterStore.startDate;
  const endDate = filterStore.endDate;
  const selectedBranches = filterStore.selectedBranches;
  const selectedProductLines = filterStore.selectedProductLines;
  const selectedItemGroups = filterStore.selectedItemGroups;

  // Convert dates to strings for API calls
  const start_date = startDate ? format(startDate, 'yyyy-MM-dd') : null;
  const end_date = endDate ? format(endDate, 'yyyy-MM-dd') : null;
  const selected_branch = selectedBranches.length === 1 ? selectedBranches[0] : "all";
  const selected_product_line = selectedProductLines.length === 1 ? selectedProductLines[0] : "all";
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    branch: selected_branch !== "all" ? selected_branch : undefined,
    itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
  }), [start_date, end_date, selected_product_line, selected_branch, selectedItemGroups]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("totalSales");

  const handleResetLocalFilters = () => {
    setSelectedCategory("all");
    setSortBy("totalSales");
  };

  // Fetch data using React Query - call the detailed product analytics endpoint directly
  const { data: productAnalyticsData, isLoading: isProductAnalyticsLoading } = useQuery({
    queryKey: ['productAnalytics', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: start_date || '2023-01-01',
        end_date: end_date || '2025-05-27',
        ...(selected_branch !== "all" && { branch: selected_branch }),
        ...(selected_product_line !== "all" && { product_line: selected_product_line })
      });

      const response = await fetch(`/api/kpis/product-analytics?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch basic product performance for charts
  const { data: productPerformanceData, isLoading: isProductPerformanceLoading } = useQuery({
    queryKey: ['productPerformance', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: start_date || '2023-01-01',
        end_date: end_date || '2025-05-27',
        ...(selected_branch !== "all" && { branch: selected_branch }),
        ...(selected_product_line !== "all" && { product_line: selected_product_line })
      });

      const response = await fetch(`/kpis/product-performance?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  const productData = productAnalyticsData || [];
  const productPerformance = productPerformanceData || [];

  const safeProductData = productData || [];
  const safeRevenueSummary = { uniqueProducts: safeProductData.length };
  const isLoading = isProductAnalyticsLoading || isProductPerformanceLoading;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getPerformanceColor = (sales: number, avgSales: number) => {
    const ratio = sales / avgSales;
    if (ratio >= 2) return "success";
    if (ratio >= 1) return "warning";
    return "error";
  };

  // Filter and sort product data
  const filteredData =
    safeProductData.filter((product: any) => {
      const categoryMatch =
        selectedCategory === "all" || product.ProductLine === selectedCategory;
      // Note: selectedProductLine is now applied globally at API level
      return categoryMatch;
    }) || [];

  const sortedProductData = [...filteredData].sort((a: any, b: any) => {
    switch (sortBy) {
      case "totalSales":
        return b.total_sales - a.total_sales;
      case "grossProfit":
        return b.grossProfit - a.grossProfit;
      case "totalQty":
        return b.total_qty - a.total_qty;
      case "transactionCount":
        return b.transaction_count - a.transaction_count;
      case "averagePrice":
        return b.average_price - a.average_price;
      default:
        return 0;
    }
  });

  // Calculate metrics
  const totalProductSales = filteredData.reduce(
    (sum, product: any) => sum + product.total_sales,
    0
  );
  const totalQuantitySold = filteredData.reduce(
    (sum, product: any) => sum + product.total_qty,
    0
  );
  const avgProductSales =
    filteredData.length > 0 ? totalProductSales / filteredData.length : 0;

  // Get unique categories for filters
  const uniqueCategories: string[] = [
    ...new Set((safeProductData as any[] || []).map((p: any) => p.ProductLine as string).filter(Boolean)),
  ];

  // Prepare placeholder sparkline data for the last 12 periods (flat line)
  const makeFlatSparkline = (value: number) => Array(12).fill(0).map((_, i) => ({ x: `P${i + 1}`, y: value }));
  const totalProductsValue = safeProductData.length || 0;
  const totalProductSalesValue = totalProductSales;
  const totalQuantitySoldValue = totalQuantitySold;
  const avgProductSalesValue = avgProductSales;
  const totalProductsSparkline = makeFlatSparkline(totalProductsValue);
  const productRevenueSparkline = makeFlatSparkline(totalProductSalesValue);
  const unitsSoldSparkline = makeFlatSparkline(totalQuantitySoldValue);
  const avgProductValueSparkline = makeFlatSparkline(avgProductSalesValue);

  return (
    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
      <PageHeader
        title="Product Analytics"
        subtitle="Product performance and inventory insights"
        icon={<ProductsIcon />}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Products"
            value={formatNumber(safeRevenueSummary?.uniqueProducts || 0)}
            icon={<InventoryIcon />}
            tooltipText="Total number of unique products"
            isLoading={isLoading}
            color="primary"
            sparklineData={totalProductsSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Product Revenue"
            value={totalProductSales}
            icon={<PriceIcon />}
            tooltipText="Total revenue from selected products"
            isLoading={isLoading}
            color="success"
            metricKey="totalSales"
            sparklineData={productRevenueSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Units Sold"
            value={formatNumber(totalQuantitySold)}
            icon={<CartIcon />}
            tooltipText="Total quantity of products sold"
            isLoading={isLoading}
            color="info"
            sparklineData={unitsSoldSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Avg Product Value"
            value={avgProductSales}
            icon={<TrendingUpIcon />}
            tooltipText="Average sales value per product"
            isLoading={isLoading}
            color="warning"
            metricKey="avgDealSize"
            sparklineData={avgProductValueSparkline}
          />
        </Grid>

        {/* Product Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Performance Chart
              </Typography>
              <ProductPerformanceChart
                data={
                  productPerformance.map((p: any) => ({
                    product: p.product,
                    sales: p.sales,
                  })) ?? []
                }
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products Summary */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              {sortedProductData.length > 0 ? (
                <Stack spacing={2}>
                  {sortedProductData.slice(0, 5).map((product: any, index) => (
                    <Box
                      key={`${product.ItemName}-${index}`}
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {product.ItemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatNumber(product.total_qty)} units
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatKshAbbreviated(product.total_sales)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No product data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Product Analytics Table */}
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Product Performance Details
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {uniqueCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="totalSales">Total Sales</MenuItem>
                      <MenuItem value="grossProfit">Gross Profit</MenuItem>
                      <MenuItem value="totalQty">Quantity Sold</MenuItem>
                      <MenuItem value="transactionCount">
                        Transactions
                      </MenuItem>
                      <MenuItem value="averagePrice">Avg Price</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<RotateLeftIcon />}
                    onClick={handleResetLocalFilters}
                    sx={{
                      height: '40px',
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Brand</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Gross Profit</TableCell>
                      <TableCell align="right">Margin</TableCell>
                      <TableCell align="right">Qty Sold</TableCell>
                      <TableCell align="right">Avg Price</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Branches</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedProductData.slice(0, 20).map((product: any, index) => (
                      <TableRow
                        key={`${product.ItemName}-${index}`}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ maxWidth: 300 }}>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              noWrap
                            >
                              {product.ItemName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {product.ProductLine}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.ProductLine}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            icon={<CategoryIcon fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.ItemGroup}
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatKshAbbreviated(product.total_sales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            {formatKshAbbreviated(product.grossProfit || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPercentage(product.grossProfit || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(product.total_qty)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatKshAbbreviated(product.average_price)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(product.transaction_count)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={product.unique_branches}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              (
                                (product.total_sales / (avgProductSales || 1)) *
                                100
                              ).toFixed(0) + "%"
                            }
                            size="small"
                            color={getPerformanceColor(
                              product.total_sales,
                              avgProductSales
                            )}
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Products;
