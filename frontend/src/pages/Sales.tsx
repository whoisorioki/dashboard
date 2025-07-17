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
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as SalesIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import MonthlySalesTrendChart from "../components/MonthlySalesTrendChart";
import { useSalesPerformanceQuery } from "../queries/salesPerformance.generated";
import { useRevenueSummaryQuery } from "../queries/revenueSummary.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { useFilters } from "../context/FilterContext";
import ChartEmptyState from "../components/states/ChartEmptyState";

const Sales = () => {
  const { start_date, end_date, selected_branch, selected_product_line } =
    useFilters();

  const [sortBy, setSortBy] = useState<string>("total_sales");

  // Fetch sales performance data from real API
  const {
    data: salesData,
    error: salesError,
    isLoading: salesLoading,
  } = useSalesPerformanceQuery({
    client: graphqlClient,
    variables: {
      startDate: start_date,
      endDate: end_date,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine:
        selected_product_line !== "all" ? selected_product_line : undefined,
    },
  });

  // Fetch revenue summary data
  const {
    data: revenueSummary,
    error: revenueError,
    isLoading: revenueLoading,
  } = useRevenueSummaryQuery({
    client: graphqlClient,
    variables: {
      startDate: start_date,
      endDate: end_date,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine:
        selected_product_line !== "all" ? selected_product_line : undefined,
    },
  });

  const safeSalesData = Array.isArray(salesData) ? salesData : [];

  const formatCurrency = (value: number) => {
    if (value == null || isNaN(value)) return "KSh 0";
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getPerformanceColor = (sales: number, avgSales: number) => {
    const ratio = sales / avgSales;
    if (ratio >= 1.2) return "success";
    if (ratio >= 0.8) return "warning";
    return "error";
  };

  // Calculate metrics
  const totalSales =
    safeSalesData?.reduce((sum, emp) => sum + emp.total_sales, 0) || 0;
  const avgSales =
    safeSalesData && safeSalesData.length > 0
      ? totalSales / safeSalesData.length
      : 0;

  // Sort sales data
  const sortedSalesData = safeSalesData
    ? [...safeSalesData].sort((a, b) => {
        switch (sortBy) {
          case "total_sales":
            return b.total_sales - a.total_sales;
          case "transaction_count":
            return b.transaction_count - a.transaction_count;
          case "average_sale":
            return b.average_sale - a.average_sale;
          case "unique_branches":
            return b.unique_branches - a.unique_branches;
          default:
            return 0;
        }
      })
    : [];

  const isUsingMockData = false; // Removed usingMockSalesPerformance and usingMockRevenueSummary

  // Show loading state
  if (salesLoading || revenueLoading) {
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
        <Typography sx={{ ml: 2 }}>Loading sales data...</Typography>
      </Box>
    );
  }

  // Standardize error state
  if (salesError || revenueError) {
    const errorMsg =
      salesError instanceof Error
        ? salesError.message
        : revenueError instanceof Error
        ? revenueError.message
        : "Error loading sales data.";
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
        title="Sales Performance"
        subtitle="Employee and salesperson analytics"
        icon={<SalesIcon />}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Controls */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="total_sales">Total Sales</MenuItem>
                <MenuItem value="transaction_count">Transactions</MenuItem>
                <MenuItem value="average_sale">Avg Sale</MenuItem>
                <MenuItem value="unique_branches">Branches</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Summary KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(revenueSummary?.total_revenue || 0)}
            icon={<MoneyIcon />}
            tooltipText="Total revenue from all sales transactions"
            isLoading={false}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Transactions"
            value={formatNumber(revenueSummary?.total_transactions || 0)}
            icon={<ReceiptIcon />}
            tooltipText="Total number of sales transactions"
            isLoading={false}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Avg Transaction"
            value={formatCurrency(revenueSummary?.average_transaction || 0)}
            icon={<TrendingUpIcon />}
            tooltipText="Average transaction value"
            isLoading={false}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Employees"
            value={formatNumber(revenueSummary?.unique_employees || 0)}
            icon={<PersonIcon />}
            tooltipText="Number of active sales employees"
            isLoading={false}
            color="warning"
          />
        </Grid>

        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Sales Trend
              </Typography>
              {safeSalesData.length === 0 ? (
                <ChartEmptyState message="No sales data available." />
              ) : (
                <MonthlySalesTrendChart
                  data={safeSalesData}
                  isLoading={salesLoading}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers Summary */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <Stack spacing={2}>
                {sortedSalesData.slice(0, 5).map((employee, index) => (
                  <Box
                    key={`${employee.SalesPerson}-${index}`}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {employee.SalesPerson}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatNumber(employee.transaction_count)} transactions
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(employee.total_sales)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Performance Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Employee Performance
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Total Sales</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Avg Sale</TableCell>
                      <TableCell align="right">Branches</TableCell>
                      <TableCell align="right">Products</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedSalesData.map((employee, index) => (
                      <TableRow
                        key={`${employee.SalesPerson}-${index}`}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: "secondary.main",
                              }}
                            >
                              {employee.SalesPerson.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {employee.SalesPerson}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(employee.total_sales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(employee.transaction_count)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(employee.average_sale)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={employee.unique_branches}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(employee.unique_products)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(
                                (employee.total_sales / (avgSales || 1)) * 50,
                                100
                              )}
                              color={getPerformanceColor(
                                employee.total_sales,
                                avgSales
                              )}
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {(
                                (employee.total_sales / (avgSales || 1)) *
                                100
                              ).toFixed(0)}
                              %
                            </Typography>
                          </Box>
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

export default Sales;
