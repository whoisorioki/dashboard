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
  Avatar,
  Stack,
  Button,
} from "@mui/material";
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
import { useSalesPageDataQuery } from "../queries/salesPageData.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { useFilterStore } from "../store/filterStore";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";
import ChartEmptyState from "../components/states/ChartEmptyState";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import SalespersonProductMixTable from "../components/SalespersonProductMixTable";
import DataStateWrapper from "../components/DataStateWrapper";

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

  const { data, error, isLoading } = useSalesPageDataQuery(
    graphqlClient,
    {
      startDate: start_date,
      endDate: end_date,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
      itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
    },
    {
      queryKey: queryKeys.salesPerformance(filters),
    }
  );

  const safeSalesData = data?.salesPerformance || [];
  const safeRevenueSummary = data?.revenueSummary;

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
    safeSalesData?.reduce((sum, emp) => sum + emp.totalSales, 0) || 0;
  const avgSales =
    safeSalesData && safeSalesData.length > 0
      ? totalSales / safeSalesData.length
      : 0;

  // Sort sales data
  const sortedSalesData = safeSalesData
    ? [...safeSalesData].sort((a, b) => {
      switch (sortBy) {
        case "totalSales":
          return (b.totalSales || 0) - (a.totalSales || 0);
        case "grossProfit":
          return (b.grossProfit || 0) - (a.grossProfit || 0);
        case "transactionCount":
          return (b.transactionCount || 0) - (a.transactionCount || 0);
        case "averageSale":
          return (b.averageSale || 0) - (a.averageSale || 0);
        case "uniqueBranches":
          return (b.uniqueBranches || 0) - (a.uniqueBranches || 0);
        default:
          return 0;
      }
    })
    : [];

  // Prepare sparkline data for the last 12 periods
  const getLastN = (arr, n) => arr ? arr.slice(-n) : [];
  const salesSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.totalSales || 0 }));
  const transactionsSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.totalTransactions || 0 }));
  const avgTransactionSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.totalTransactions ? d.totalSales / d.totalTransactions : 0 }));
  const uniqueEmployeesSparkline = getLastN(data?.monthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.uniqueEmployees || 0 }));

  return (
    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
      <PageHeader
        title="Sales Performance"
        subtitle="Employee and salesperson analytics"
        icon={<SalesIcon />}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Controls */}
        {/* Removed local Reset and Sort By from here */}
        {/* Summary KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeSalesData} emptyMessage="No sales data available.">
            <KpiCard
              title="Total Revenue"
              value={formatKshAbbreviated(safeRevenueSummary?.totalRevenue ?? 0)}
              icon={<MoneyIcon />}
              tooltipText="Total gross revenue for the selected period."
              isLoading={false}
              color="primary"
              metricKey="totalRevenue"
              sparklineData={salesSparkline}
            />
          </DataStateWrapper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeSalesData} emptyMessage="No sales data available.">
            <KpiCard
              title="Total Transactions"
              value={formatNumber(data?.revenueSummary?.totalTransactions || 0)}
              icon={<ReceiptIcon />}
              tooltipText="Total number of sales transactions"
              isLoading={false}
              color="info"
              sparklineData={transactionsSparkline}
            />
          </DataStateWrapper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeSalesData} emptyMessage="No sales data available.">
            <KpiCard
              title="Avg Transaction"
              value={data?.revenueSummary?.averageTransaction || 0}
              icon={<TrendingUpIcon />}
              tooltipText="Average transaction value"
              isLoading={false}
              color="success"
              metricKey="avgDealSize"
              sparklineData={avgTransactionSparkline}
            />
          </DataStateWrapper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataStateWrapper isLoading={isLoading} error={error} data={safeSalesData} emptyMessage="No sales data available.">
            <KpiCard
              title="Active Employees"
              value={formatNumber(data?.revenueSummary?.uniqueEmployees || 0)}
              icon={<PersonIcon />}
              tooltipText="Number of active sales employees"
              isLoading={false}
              color="warning"
              sparklineData={uniqueEmployeesSparkline}
            />
          </DataStateWrapper>
        </Grid>

        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Sales Trend
              </Typography>
              <DataStateWrapper isLoading={isLoading} error={error} data={data?.monthlySalesGrowth} emptyMessage="No sales trend data available.">
                <MonthlySalesTrendChart
                  data={data?.monthlySalesGrowth || []}
                  isLoading={false}
                />
              </DataStateWrapper>
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
                        {formatNumber(employee.transactionCount)} transactions
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatKshAbbreviated(employee.totalSales)}
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
                            {formatKshAbbreviated(employee.totalSales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {formatKshAbbreviated(employee.grossProfit)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPercentage(employee.avgMargin || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(employee.transactionCount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatKshAbbreviated(employee.averageSale)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={employee.uniqueBranches}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(employee.uniqueProducts)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(
                                (employee.totalSales / (avgSales || 1)) * 50,
                                100
                              )}
                              color={getPerformanceColor(
                                employee.totalSales,
                                avgSales
                              )}
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatPercentage(
                                (employee.totalSales / (avgSales || 1)) *
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
            </CardContent>
          </Card>
        </Grid>
        {/* Salesperson Product Mix Table */}
        <Grid item xs={12}>
          <SalespersonProductMixTable rows={data?.salespersonProductMix ?? []} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Sales;
