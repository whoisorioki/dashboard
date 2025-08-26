import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
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
  Avatar,
  Stack,
  Button,
} from "@mui/material";
// Removed centralized layout imports - using Dashboard-style layout
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as SalesIcon,
  Person as PersonIcon,
  RotateLeft as RotateLeftIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import MonthlySalesTrendChart from "../components/MonthlySalesTrendChart";
import { useFilterStore } from "../store/filterStore";
import { useMemo } from "react";
import ChartEmptyState from "../components/states/ChartEmptyState";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import SalespersonProductMixTable from "../components/SalespersonProductMixTable";
import { salesService } from "../services/salesService";

const Sales = () => {
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
  const [sortBy, setSortBy] = useState<string>("totalSales");

  const handleResetLocalFilters = () => {
    setSortBy("totalSales");
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['salesData', filters],
    queryFn: () => salesService.getSalesData(
      start_date || '2023-01-01',
      end_date || '2025-05-27',
      selected_branch !== "all" ? selected_branch : undefined,
      selected_product_line !== "all" ? selected_product_line : undefined
    ),
  });

  const safeSalesData = data?.topPerformers || [];
  const safeSalesByBranch = data?.salesByBranch || [];
  const safeSalesByProduct = data?.salesByProduct || [];

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
    safeSalesData?.reduce((sum, emp) => sum + emp.sales, 0) || 0;
  const totalTransactions =
    safeSalesData?.reduce((sum, emp) => sum + emp.transactions, 0) || 0;
  const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const avgSales =
    safeSalesData && safeSalesData.length > 0
      ? totalSales / safeSalesData.length
      : 0;

  // Sort sales data
  const sortedSalesData = safeSalesData
    ? [...safeSalesData].sort((a, b) => {
      switch (sortBy) {
        case "totalSales":
          return (b.sales || 0) - (a.sales || 0);
        case "grossProfit":
          return (b.margin || 0) - (a.margin || 0);
        case "transactionCount":
          return (b.transactions || 0) - (a.transactions || 0);
        case "averageSale":
          return (b.sales / b.transactions || 0) - (a.sales / a.transactions || 0);
        case "uniqueBranches":
          return (safeSalesByBranch.length || 0) - (safeSalesByBranch.length || 0);
        default:
          return 0;
      }
    })
    : [];

  // Prepare sparkline data for the last 12 periods
  const getLastN = (arr, n) => arr ? arr.slice(-n) : [];
  const salesSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || '', y: d.sales || 0 }));
  const transactionsSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || '', y: d.sales || 0 })); // Using sales as proxy for transactions
  const avgTransactionSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || '', y: d.sales || 0 })); // Using sales as proxy
  const uniqueEmployeesSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || '', y: safeSalesData?.length || 0 }));

  return (
    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
      <PageHeader
        title="Sales Performance"
        subtitle="Employee and salesperson analytics"
        icon={<SalesIcon />}
      />

      {/* Sales Overview */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        {/* Controls */}
        {/* Removed local Reset and Sort By from here */}
        {/* Summary KPI Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Revenue"
            value={formatKshAbbreviated(totalSales)}
            icon={<MoneyIcon />}
            tooltipText="Total gross revenue for the selected period."
            isLoading={isLoading}
            color="primary"
            metricKey="totalRevenue"
            sparklineData={salesSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Transactions"
            value={formatNumber(totalTransactions)}
            icon={<ReceiptIcon />}
            tooltipText="Total number of sales transactions"
            isLoading={isLoading}
            color="info"
            sparklineData={transactionsSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Avg Transaction"
            value={formatKshAbbreviated(averageSale)}
            icon={<TrendingUpIcon />}
            tooltipText="Average transaction value"
            isLoading={isLoading}
            color="success"
            metricKey="avgDealSize"
            sparklineData={avgTransactionSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Active Employees"
            value={formatNumber(safeSalesData?.length || 0)}
            icon={<PersonIcon />}
            tooltipText="Number of active sales employees"
            isLoading={isLoading}
            color="warning"
            sparklineData={uniqueEmployeesSparkline}
          />
        </Grid>

        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Sales Trend
              </Typography>
              <MonthlySalesTrendChart
                data={data?.monthlySalesGrowth?.map((item) => ({
                  date: item.month || '',
                  totalSales: item.sales || 0,
                  grossProfit: item.sales * 0.3, // Estimate profit as 30% of sales
                })) || []}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              {sortedSalesData.length > 0 ? (
                <Stack spacing={2}>
                  {sortedSalesData.slice(0, 5).map((employee, index) => (
                    <Box
                      key={`${employee.salesPerson}-${index}`}
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {employee.salesPerson}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatNumber(employee.transactions)} transactions
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatKshAbbreviated(employee.sales)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No performance data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Performance Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="totalSales">Total Sales</MenuItem>
                    <MenuItem value="grossProfit">Gross Profit</MenuItem>
                    <MenuItem value="transactionCount">Transactions</MenuItem>
                    <MenuItem value="averageSale">Avg Sale</MenuItem>
                    <MenuItem value="uniqueBranches">Branches</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="h6" gutterBottom>
                Sales Employee Performance
              </Typography>
              {sortedSalesData.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell align="right">Total Sales</TableCell>
                        <TableCell align="right">Gross Profit</TableCell>
                        <TableCell align="right">Avg. Margin</TableCell>
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
                          key={`${employee.salesPerson}-${index}`}
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
                                {employee.salesPerson.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {employee.salesPerson}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatKshAbbreviated(employee.sales)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium" color="success.main">
                              {formatKshAbbreviated(employee.margin)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatPercentage(employee.margin / employee.sales * 100 || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatNumber(employee.transactions)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatKshAbbreviated(employee.sales / employee.transactions)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={safeSalesByBranch.length}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatNumber(safeSalesByProduct.length)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(
                                  (employee.sales / (avgSales || 1)) * 50,
                                  100
                                )}
                                color={getPerformanceColor(
                                  employee.sales,
                                  avgSales
                                )}
                                sx={{ height: 6, borderRadius: 1 }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatPercentage(
                                  (employee.sales / (avgSales || 1)) *
                                  100
                                )}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No employee performance data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Performance Details */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Performance Details
              </Typography>
              <SalespersonProductMixTable rows={(data as any)?.salespersonProductMix ?? []} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Sales;
