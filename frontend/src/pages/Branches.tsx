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
  Avatar,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
// Removed centralized layout imports - using Dashboard-style layout
import {
  Public as RegionIcon,
  TrendingUp as GrowthIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import BranchProductHeatmap from "../components/BranchProductHeatmap";
import { useFilterStore } from "../store/filterStore";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import { branchesService } from "../services/branchesService";
import { useQuery } from '@tanstack/react-query';

const Branches = () => {
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
  const filters = {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
  };

  const [selectedMetric, setSelectedMetric] = useState<string>("sales");
  const [sortBy, setSortBy] = useState<string>("sales");

  const handleResetLocalFilters = () => {
    setSelectedMetric("sales");
    setSortBy("sales");
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['branchData', filters],
    queryFn: () => branchesService.getBranchData(
      start_date || '2023-01-01',
      end_date || '2025-05-27',
      selected_branch !== "all" ? selected_branch : undefined,
      selected_product_line !== "all" ? selected_product_line : undefined
    ),
  });

  const safeBranchPerformanceData = (data as any)?.branchPerformance || [];
  const safeBranchGrowthData = (data as any)?.branchGrowth || [];

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getPerformanceColor = (sales: number, target: number = 1000000) => {
    const percentage = (sales / target) * 100;
    if (percentage >= 100) return "success";
    if (percentage >= 80) return "warning";
    return "error";
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return "success";
    if (growth > 0) return "warning";
    return "error";
  };

  // Calculate aggregate metrics from real data
  const totalSales = safeBranchPerformanceData?.reduce(
    (sum, branch) => sum + branch.totalSales, 0
  ) || 0;

  const totalTransactions = safeBranchPerformanceData?.reduce(
    (sum, branch) => sum + branch.transactionCount, 0
  ) || 0;

  const totalCustomers = safeBranchPerformanceData?.reduce(
    (sum, branch) => sum + branch.uniqueCustomers, 0
  ) || 0;

  const totalProducts = safeBranchPerformanceData?.reduce(
    (sum, branch) => sum + branch.uniqueProducts, 0
  ) || 0;

  // Calculate average growth from growth data
  const latestGrowthData = safeBranchGrowthData?.reduce(
    (acc: Record<string, { monthYear: string; growthPct?: number }>, item) => {
      if (!acc[item.branch] || item.monthYear > acc[item.branch].monthYear) {
        acc[item.branch] = item;
      }
      return acc;
    },
    {}
  );

  const averageGrowth = latestGrowthData && Object.values(latestGrowthData).length > 0
    ? (Object.values(latestGrowthData).reduce(
      (sum, item: any) => sum + (item.growthPct || 0), 0
    ) as number) / Object.values(latestGrowthData).length
    : 0;

  // Sort branches based on selected criteria
  const sortedBranches = safeBranchPerformanceData
    ? [...safeBranchPerformanceData].sort((a, b) => {
      switch (sortBy) {
        case "sales":
          return b.totalSales - a.totalSales;
        case "transactions":
          return b.transactionCount - a.transactionCount;
        case "customers":
          return b.uniqueCustomers - a.uniqueCustomers;
        case "products":
          return b.uniqueProducts - a.uniqueProducts;
        default:
          return 0;
      }
    })
    : [];

  // Helper function to get latest growth for a branch
  const getBranchGrowth = (branchName: string): number => {
    if (!latestGrowthData || !latestGrowthData[branchName]) return 0;
    return latestGrowthData[branchName].growthPct || 0;
  };

  // Prepare data for BranchProductHeatmap
  const heatmapData = safeBranchPerformanceData.map((branch) => ({
    branch: branch.branch,
    product: "All", // No product breakdown available here
    sales: branch.totalSales,
  }));

  // Prepare placeholder sparkline data for the last 12 periods (flat line)
  const makeFlatSparkline = (value) => Array(12).fill(0).map((_, i) => ({ x: `P${i + 1}`, y: value }));
  const totalSalesSparkline = makeFlatSparkline(totalSales);
  const totalTransactionsSparkline = makeFlatSparkline(totalTransactions);
  const totalCustomersSparkline = makeFlatSparkline(totalCustomers);
  const totalProductsSparkline = makeFlatSparkline(totalProducts);

  return (
    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
      <PageHeader
        title="Branch Performance"
        subtitle="Kenya branch analysis and location insights"
        icon={<LocationIcon />}
      />

      {/* Branch Overview */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        {/* Summary KPI Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Sales"
            value={formatKshAbbreviated(totalSales)}
            icon={<StoreIcon />}
            tooltipText="Combined revenue across all branches for the selected period"
            isLoading={isLoading}
            color="primary"
            metricKey="totalSales"
            sparklineData={totalSalesSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Transactions"
            value={formatNumber(totalTransactions)}
            icon={<RegionIcon />}
            tooltipText="Total number of transactions across all branches"
            isLoading={isLoading}
            color="info"
            sparklineData={totalTransactionsSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Unique Customers"
            value={formatNumber(totalCustomers)}
            icon={<PeopleIcon />}
            tooltipText="Number of unique customers/employees served"
            isLoading={isLoading}
            color="success"
            sparklineData={totalCustomersSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Products Sold"
            value={formatNumber(totalProducts)}
            icon={<GrowthIcon />}
            tooltipText="Unique products sold across all branches"
            isLoading={isLoading}
            color="warning"
            sparklineData={totalProductsSparkline}
          />
        </Grid>
      </Grid>

      {/* Branch Performance Details */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
        {/* Branch Performance Table */}
        <Grid item xs={12} lg={8}>
          {/* Branch Performance Table */}
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
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Branch Performance Overview
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Metric</InputLabel>
                    <Select
                      value={selectedMetric}
                      label="Metric"
                      onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="transactions">Transactions</MenuItem>
                      <MenuItem value="customers">Customers</MenuItem>
                      <MenuItem value="products">Products</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="transactions">Transactions</MenuItem>
                      <MenuItem value="customers">Customers</MenuItem>
                      <MenuItem value="products">Products</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
              {sortedBranches.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Branch</TableCell>
                        <TableCell align="right">Sales</TableCell>
                        <TableCell align="right">Transactions</TableCell>
                        <TableCell align="right">Avg. Sale</TableCell>
                        <TableCell align="right">Customers</TableCell>
                        <TableCell align="right">Growth</TableCell>
                        <TableCell align="center">Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedBranches.map((branch, index) => {
                        const growth = getBranchGrowth(branch.branch);
                        const target = 1000000; // Default target, could be made dynamic

                        return (
                          <TableRow
                            key={`${branch.branch}-${index}`}
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
                                    bgcolor: "primary.main",
                                  }}
                                >
                                  {branch.branch.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {branch.branch}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Kenya
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {formatKshAbbreviated(branch.totalSales)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {formatNumber(branch.transactionCount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {formatKshAbbreviated(branch.averageSale)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {formatNumber(branch.uniqueCustomers)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${growth >= 0 ? "+" : ""}${formatPercentage(growth)}`}
                                color={getGrowthColor(growth)}
                                size="small"
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(
                                    (branch.totalSales / target) * 100,
                                    100
                                  )}
                                  color={getPerformanceColor(
                                    branch.totalSales,
                                    target
                                  )}
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatPercentage(
                                    (branch.totalSales / target) * 100
                                  )}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No branch performance data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Branch Product Heatmap */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Performance by Branch
              </Typography>
              <BranchProductHeatmap
                data={heatmapData}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Analytics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Branches
              </Typography>
              {sortedBranches.length > 0 ? (
                <Stack spacing={2}>
                  {sortedBranches.slice(0, 5).map((branch, index) => (
                    <Box
                      key={`${branch.branch}-${index}`}
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {branch.branch}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatNumber(branch.transactionCount)} transactions
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatKshAbbreviated(branch.totalSales)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No branch data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Growth Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branch Growth Summary
              </Typography>
              {sortedBranches.length > 0 ? (
                <Stack spacing={2}>
                  {sortedBranches.slice(0, 5).map((branch, index) => {
                    const growth = getBranchGrowth(branch.branch);
                    return (
                      <Box
                        key={`${branch.branch}-${index}`}
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                        >
                          {branch.branch.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {branch.branch}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(branch.uniqueProducts)} products
                          </Typography>
                        </Box>
                        <Chip
                          label={`${growth >= 0 ? "+" : ""}${formatPercentage(growth)}`}
                          color={getGrowthColor(growth)}
                          size="small"
                          variant="filled"
                        />
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No branch data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Branches;
