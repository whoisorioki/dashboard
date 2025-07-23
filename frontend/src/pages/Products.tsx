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
import { useFilters } from "../context/FilterContext";
import { useProductsPageDataQuery } from "../queries/productsPageData.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartEmptyState from "../components/states/ChartEmptyState";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";
import DataStateWrapper from "../components/DataStateWrapper";

const Products = () => {
  const { start_date, end_date, selected_branch, selected_product_line } = useFilters();
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    branch: selected_branch !== "all" ? selected_branch : undefined,
  }), [start_date, end_date, selected_product_line, selected_branch]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("totalSales");

  const handleResetLocalFilters = () => {
    setSelectedCategory("all");
    setSortBy("totalSales");
  };

  const { data, error, isLoading } = useProductsPageDataQuery(
    graphqlClient,
    {
      startDate: start_date,
      endDate: end_date,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    },
    {
      queryKey: queryKeys.productAnalytics(filters),
    }
  );
  const safeProductData = data?.productAnalytics || [];

  const safeRevenueSummary = data?.revenueSummary;

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
      case "totalSales":
        return b.totalSales - a.totalSales;
      case "grossProfit":
        return b.grossProfit - a.grossProfit;
      case "totalQty":
        return b.totalQty - a.totalQty;
      case "transactionCount":
        return b.transactionCount - a.transactionCount;
      case "averagePrice":
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

  // Get unique categories for filters
  const uniqueCategories = [
    ...new Set(safeProductData.map((p) => p.itemGroup) || []),
  ];

  // Prepare placeholder sparkline data for the last 12 periods (flat line)
  const makeFlatSparkline = (value) => Array(12).fill(0).map((_, i) => ({ x: `P${i + 1}`, y: value }));
  const totalProductsValue = safeRevenueSummary?.uniqueProducts || 0;
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
          <DataStateWrapper isLoading={isLoading} error={error} data={safeProductData} emptyMessage="No product data available.">
            <KpiCard
              title="Total Products"
              value={formatNumber(safeRevenueSummary?.uniqueProducts || 0)}
              icon={<InventoryIcon />}
              tooltipText="Total number of unique products"
              isLoading={false}
              color="primary"
              sparklineData={totalProductsSparkline}
            />
          </DataStateWrapper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeProductData} emptyMessage="No product data available.">
            <KpiCard
              title="Product Revenue"
              value={totalProductSales}
              icon={<PriceIcon />}
              tooltipText="Total revenue from selected products"
              isLoading={false}
              color="success"
              metricKey="totalSales"
              sparklineData={productRevenueSparkline}
            />
          </DataStateWrapper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeProductData} emptyMessage="No product data available.">
            <KpiCard
              title="Units Sold"
              value={formatNumber(totalQuantitySold)}
              icon={<CartIcon />}
              tooltipText="Total quantity of products sold"
              isLoading={false}
              color="info"
              sparklineData={unitsSoldSparkline}
            />
          </DataStateWrapper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeProductData} emptyMessage="No product data available.">
            <KpiCard
              title="Avg Product Value"
              value={avgProductSales}
              icon={<TrendingUpIcon />}
              tooltipText="Average sales value per product"
              isLoading={false}
              color="warning"
              metricKey="avgDealSize"
              sparklineData={avgProductValueSparkline}
            />
          </DataStateWrapper>
        </Grid>

        {/* Product Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Performance Chart
              </Typography>
              <DataStateWrapper isLoading={isLoading} error={error} data={safeProductData} emptyMessage="No product data available.">
                <ProductPerformanceChart
                  data={
                    safeProductData.map((p) => ({
                      product: p.itemName,
                      sales: p.totalSales,
                    })) ?? []
                  }
                  isLoading={false}
                />
              </DataStateWrapper>
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
                      {formatKshAbbreviated(product.totalSales)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
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
                            {formatKshAbbreviated(product.totalSales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            {formatKshAbbreviated(product.grossProfit)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPercentage(product.margin || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(product.totalQty)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatKshAbbreviated(product.averagePrice)}
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
