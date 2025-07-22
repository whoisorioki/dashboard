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
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Public as RegionIcon,
  TrendingUp as GrowthIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  RotateLeft as RotateLeftIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import BranchProductHeatmap from "../components/BranchProductHeatmap";
import { useFilters } from "../context/FilterContext";
import { useBranchesPageDataQuery } from "../queries/branchesPageData.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartEmptyState from "../components/states/ChartEmptyState";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";

const Branches = () => {
  const { start_date, end_date, selected_branch, selected_product_line } = useFilters();
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    branch: selected_branch !== "all" ? selected_branch : undefined,
  }), [start_date, end_date, selected_product_line, selected_branch]);
  const [selectedMetric, setSelectedMetric] = useState<string>("sales");
  const [sortBy, setSortBy] = useState<string>("sales");

  const handleResetLocalFilters = () => {
    setSelectedMetric("sales");
    setSortBy("sales");
  };

  const { data, error, isLoading } = useBranchesPageDataQuery(
    graphqlClient,
    {
      startDate: start_date,
      endDate: end_date,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    },
    {
      queryKey: queryKeys.branchPerformance ? queryKeys.branchPerformance(filters) : ["branchPerformance", filters],
    }
  );
  const safeBranchPerformanceData =
    data?.branchPerformance || [];

  const safeBranchGrowthData = data?.branchGrowth || [];

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
  const totalSales =
    safeBranchPerformanceData?.reduce(
      (sum, branch) => sum + branch.totalSales,
      0
    ) || 0;
  const totalTransactions =
    safeBranchPerformanceData?.reduce(
      (sum, branch) => sum + branch.transactionCount,
      0
    ) || 0;
  const totalCustomers =
    safeBranchPerformanceData?.reduce(
      (sum, branch) => sum + branch.uniqueCustomers,
      0
    ) || 0;
  const totalProducts =
    safeBranchPerformanceData?.reduce(
      (sum, branch) => sum + branch.uniqueProducts,
      0
    ) || 0;

  // Calculate average growth from growth data
  const latestGrowthData = safeBranchGrowthData?.reduce(
    (acc: Record<string, { monthYear: string; growthPct: number }>, item) => {
      if (!acc[item.branch] || item.monthYear > acc[item.branch].monthYear) {
        acc[item.branch] = item;
      }
      return acc;
    },
    {}
  );

  const averageGrowth =
    latestGrowthData && Object.values(latestGrowthData).length > 0
      ? Object.values(latestGrowthData).reduce(
          (sum, item) => sum + item.growthPct,
          0
        ) / Object.values(latestGrowthData).length
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
    return latestGrowthData[branchName].growthPct;
  };

  // Prepare data for BranchProductHeatmap
  const heatmapData = safeBranchPerformanceData.map((branch) => ({
    branch: branch.branch,
    product: "All", // No product breakdown available here
    sales: branch.totalSales,
  }));

  // Show loading state
  if (isLoading) {
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
        <Typography sx={{ ml: 2 }}>Loading branch data...</Typography>
      </Box>
    );
  }

  // Standardize error state
  if (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Error loading branch data.";
    return <ChartEmptyState isError message={errorMsg} />;
  }

  return (
    <Box
      sx={{
        mt: { xs: 2, sm: 3 },
        p: { xs: 1, sm: 2 },
      }}
    >
      <PageHeader
        title="Branch Performance"
        subtitle="Kenya branch analysis and location insights"
        icon={<LocationIcon />}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Controls */}
        {/* Remove the full-width controls row here */}

        {/* Summary KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Sales"
            value={totalSales}
            icon={<StoreIcon />}
            tooltipText="Combined revenue across all branches for the selected period"
            isLoading={isLoading}
            trend={averageGrowth >= 0 ? "up" : "down"}
            trendValue={`${formatPercentage(averageGrowth)}`}
            color="primary"
            metricKey="totalSales"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Transactions"
            value={formatNumber(totalTransactions)}
            icon={<RegionIcon />}
            tooltipText="Total number of transactions across all branches"
            isLoading={isLoading}
            trend="up"
            trendValue="All branches"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Unique Customers"
            value={formatNumber(totalCustomers)}
            icon={<PeopleIcon />}
            tooltipText="Number of unique customers/employees served"
            isLoading={isLoading}
            trend="up"
            trendValue="Active"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Products Sold"
            value={formatNumber(totalProducts)}
            icon={<GrowthIcon />}
            tooltipText="Unique products sold across all branches"
            isLoading={isLoading}
            trend={averageGrowth >= 0 ? "up" : "down"}
            trendValue={`${formatPercentage(averageGrowth)} avg growth`}
            color="warning"
          />
        </Grid>

        {/* Branch Performance Table */}
        <Grid item xs={12} lg={8}>
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
              {safeBranchPerformanceData.length === 0 ? (
                <ChartEmptyState message="No branch performance data available." />
              ) : (
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
                        <TableCell align="right">Performance</TableCell>
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
                                label={`${
                                  growth >= 0 ? "+" : ""
                                }${formatPercentage(growth)}`}
                                color={getGrowthColor(growth)}
                                size="small"
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell align="right">
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
                                  %
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Product Heatmap */}
        <Grid item xs={12} lg={4}>
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

        {/* Additional Analytics Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Branches
              </Typography>
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branch Growth Summary
              </Typography>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Branches;
