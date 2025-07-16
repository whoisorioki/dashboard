import { useState } from "react";
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
} from "@mui/material";
import {
  Inventory2 as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as PriceIcon,
  ShoppingCart as CartIcon,
  Inventory as ProductsIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import ProductPerformanceChart from "../components/ProductPerformanceChart";
import { useFilters } from "../context/FilterContext";
import { useProductAnalyticsQuery } from "../queries/productAnalytics.generated";
import { useRevenueSummaryQuery } from "../queries/revenueSummary.generated";
import { graphqlClient } from "../graphqlClient";
import ChartEmptyState from "../components/states/ChartEmptyState";

const Products = () => {
  const { start_date, end_date, selected_branch, selected_product_line } =
    useFilters();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("total_sales");

  // Fetch product analytics data from real API
  const {
    data: productData,
    error: productError,
    isLoading: productLoading,
  } = useProductAnalyticsQuery(graphqlClient, {
    startDate: start_date,
    endDate: end_date,
    branch: selected_branch !== "all" ? selected_branch : undefined,
    productLine:
      selected_product_line !== "all" ? selected_product_line : undefined,
  });
  const safeProductData = Array.isArray(productData) ? productData : [];

  // Fetch revenue summary data
  const {
    data: revenueSummary,
    error: revenueError,
    isLoading: revenueLoading,
  } = useRevenueSummaryQuery(graphqlClient, {
    startDate: start_date,
    endDate: end_date,
    branch: selected_branch !== "all" ? selected_branch : undefined,
    productLine:
      selected_product_line !== "all" ? selected_product_line : undefined,
  });

  const formatCurrency = (value: number) => {
    if (value == null || isNaN(value)) return "KSh 0";
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
  };

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
    safeProductData.filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.itemGroup === selectedCategory;
      // Note: selectedProductLine is now applied globally at API level
      return categoryMatch;
    }) || [];

  const sortedProductData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "total_sales":
        return b.totalSales - a.totalSales;
      case "total_qty":
        return b.totalQty - a.totalQty;
      case "transaction_count":
        return b.transactionCount - a.transactionCount;
      case "average_price":
        return b.averagePrice - a.averagePrice;
      default:
        return 0;
    }
  });

  // Calculate metrics
  const totalProductSales = filteredData.reduce(
    (sum, product) => sum + product.totalSales,
    0
  );
  const totalQuantitySold = filteredData.reduce(
    (sum, product) => sum + product.totalQty,
    0
  );
  const avgProductSales =
    filteredData.length > 0 ? totalProductSales / filteredData.length : 0;

  // Get unique categories and product lines for filters
  const uniqueCategories = [
    ...new Set(safeProductData.map((p) => p.itemGroup) || []),
  ];
  const uniqueProductLines = [
    ...new Set(safeProductData.map((p) => p.productLine) || []),
  ];

  const isUsingMockData = false; // Removed usingMockProductAnalytics and usingMockRevenueSummary

  // Show loading state
  if (productLoading || revenueLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading product data...</Typography>
      </Box>
    );
  }

  // Standardize error state
  if (productError || revenueError) {
    const errorMsg =
      productError instanceof Error
        ? productError.message
        : revenueError instanceof Error
        ? revenueError.message
        : "Error loading product data.";
    return <ChartEmptyState isError message={errorMsg} />;
  }

  return (
    <Box
      sx={{
        p: 0,
        pl: { xs: 1.5, sm: 2 },
        pr: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 3 },
      }}
    >
      <PageHeader
        title="Product Analytics"
        subtitle="Product performance and inventory insights"
        icon={<ProductsIcon />}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Summary KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Products"
            value={formatNumber(revenueSummary?.uniqueProducts || 0)}
            icon={<InventoryIcon />}
            tooltipText="Total number of unique products"
            isLoading={false}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Product Revenue"
            value={formatCurrency(totalProductSales)}
            icon={<PriceIcon />}
            tooltipText="Total revenue from selected products"
            isLoading={false}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Units Sold"
            value={formatNumber(totalQuantitySold)}
            icon={<CartIcon />}
            tooltipText="Total quantity of products sold"
            isLoading={false}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Avg Product Value"
            value={formatCurrency(avgProductSales)}
            icon={<TrendingUpIcon />}
            tooltipText="Average sales value per product"
            isLoading={false}
            color="warning"
          />
        </Grid>

        {/* Product Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Performance Chart
              </Typography>
              {safeProductData.length === 0 ? (
                <ChartEmptyState message="No product data available." />
              ) : (
                <ProductPerformanceChart
                  data={
                    safeProductData.map((p) => ({
                      product: p.itemName,
                      sales: p.totalSales,
                    })) ?? []
                  }
                  isLoading={productLoading}
                />
              )}
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
              <Stack spacing={2}>
                {sortedProductData.slice(0, 5).map((product, index) => (
                  <Box
                    key={`${product.itemName}-${product.productLine}-${index}`}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {product.itemName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.productLine} • {formatNumber(product.totalQty)}{" "}
                        units
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(product.totalSales)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Analytics Table */}
        <Grid item xs={12}>
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
                      <MenuItem value="total_sales">Total Sales</MenuItem>
                      <MenuItem value="total_qty">Quantity Sold</MenuItem>
                      <MenuItem value="transaction_count">
                        Transactions
                      </MenuItem>
                      <MenuItem value="average_price">Avg Price</MenuItem>
                    </Select>
                  </FormControl>
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
                      <TableCell align="right">Qty Sold</TableCell>
                      <TableCell align="right">Avg Price</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Branches</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedProductData.slice(0, 20).map((product, index) => (
                      <TableRow
                        key={`${product.itemName}-${product.productLine}-${index}`}
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
                              {product.itemName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {product.itemName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.itemGroup}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            icon={<CategoryIcon fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.productLine}
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(product.totalSales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(product.totalQty)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(product.averagePrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(product.transactionCount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={product.uniqueBranches}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              (
                                (product.totalSales / (avgProductSales || 1)) *
                                100
                              ).toFixed(0) + "%"
                            }
                            size="small"
                            color={getPerformanceColor(
                              product.totalSales,
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
