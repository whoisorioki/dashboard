import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  ReceiptLong as ReceiptLongIcon,
  Flag as TargetIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import MonthlySalesTrendChart from "../components/MonthlySalesTrendChart";
import ProductPerformanceChart from "../components/ProductPerformanceChart";
import BranchProductHeatmap from "../components/BranchProductHeatmap";
import QuotaAttainmentGauge from "../components/QuotaAttainmentGauge";
import ChartEmptyState from "../components/states/ChartEmptyState";
import { useDashboardDataQuery } from "../queries/dashboardData.generated";
import { useFilters } from "../context/FilterContext";

import { useNavigate } from "react-router-dom";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";

// Type guards for API responses
// Remove legacy type guards; use generated types directly

const Dashboard = () => {
  const [debugMode, setDebugMode] = useState(false);
  const {
    start_date,
    end_date,
    selected_branch,
    selected_product_line,
    sales_target,
    setSalesTarget,
  } = useFilters();

  const navigate = useNavigate();

  // Single API call for all dashboard data
  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardDataQuery(
    graphqlClient,
    {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      branch: selected_branch !== 'all' ? selected_branch : undefined,
      productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
      target: sales_target ? parseFloat(sales_target) : undefined,
    }
  );

  // Use all fields from backend output directly
  const safeMonthlySalesGrowth = dashboardData?.monthlySalesGrowth ?? [];
  const safeRevenueSummary = dashboardData?.revenueSummary || null;
  const safeProductAnalytics = dashboardData?.productAnalytics ?? [];
  const safeTargetAttainment = dashboardData?.targetAttainment || null;
  const safeProductPerformance = dashboardData?.productPerformance ?? [];
  const safeHeatmapData = dashboardData?.branchProductHeatmap ?? [];
  const safeTopCustomers = dashboardData?.topCustomers ?? [];
  const safeMarginTrends = dashboardData?.marginTrends ?? [];
  const safeReturns = dashboardData?.returnsAnalysis ?? [];
  const safeProfitability = dashboardData?.profitabilityByDimension ?? [];

  // TODO: Add and display all other KPIs as needed

  const formatCurrency = (value: number | undefined | null) => {
    if (value == null || isNaN(value)) return "KSh 0";
    return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value == null || isNaN(value) || !isFinite(value)) return "0%";
    return `${value.toFixed(1)}%`;
  };

  // Helper functions for canonical calculations
  const totalSales = Array.isArray(safeMonthlySalesGrowth)
    ? safeMonthlySalesGrowth.reduce((sum, entry) => sum + (entry.totalSales || 0), 0)
    : 0;
  const salesGrowth =
    Array.isArray(safeMonthlySalesGrowth) && safeMonthlySalesGrowth.length > 1
      ? ((safeMonthlySalesGrowth[safeMonthlySalesGrowth.length - 1].totalSales -
          safeMonthlySalesGrowth[0].totalSales) /
          safeMonthlySalesGrowth[0].totalSales) *
        100
      : 0;
  // Avg Deal Size: Not available until backend provides totalTransactions
  // (Backend already provides totalTransactions in revenue summary)
  const avgDealSize = safeRevenueSummary?.totalTransactions
    ? safeRevenueSummary.totalRevenue / safeRevenueSummary.totalTransactions
    : null;

  const getTargetAttainmentPercentage = () => {
    if (!safeTargetAttainment || typeof safeTargetAttainment.attainmentPercentage !== "number") {
      return 0;
    }
    return safeTargetAttainment.attainmentPercentage;
  };

  // Show loading state
  if (loadingDashboard) {
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
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // Standardize error state
  if (!safeProductAnalytics) {
    return <ChartEmptyState isError message="Failed to load product analytics data." />;
  }

  // Fallback UI for each widget
  if (!safeMonthlySalesGrowth.length) {
    return <ChartEmptyState isError message="Monthly sales growth data is missing or invalid." />;
  }
  if (!safeRevenueSummary) {
    return <ChartEmptyState isError message="Revenue summary data is missing or invalid." />;
  }

  // TODO: Expand all tables/charts to display all backend fields for each KPI
  // For example, for product analytics, show ItemName, ProductLine, ItemGroup, total_sales, etc.
  // For branch performance, show Branch, total_sales, transaction_count, etc.
  // For customer value, show cardName, salesAmount, grossProfit, etc.

  return (
    <Box
      sx={{
        mt: { xs: 6, sm: 8 },
        p: { xs: 2, sm: 3 },
      }}
    >
      <PageHeader
        title="Sales Analytics Dashboard"
        subtitle="Real-time insights and performance metrics"
        icon={<DashboardIcon />}
      />

      {/* Add summary sentence and refactor KPI card layout */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {/* Dynamic summary: Example logic, can be improved */}
          {salesGrowth > 0
            ? `Sales are trending up this quarter.`
            : salesGrowth < 0
            ? `Sales are trending down this quarter.`
            : `Sales are steady this quarter.`}
        </Typography>
      </Box>
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Sales"
            value={totalSales}
            icon={<AttachMoneyIcon />}
            tooltipText="Total sales revenue for the selected period."
            isLoading={loadingDashboard}
            trend={salesGrowth >= 0 ? "up" : "down"}
            trendValue={formatPercentage(salesGrowth)}
            color="primary"
            metricKey="totalSales"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Sales Growth (YoY)"
            value={salesGrowth}
            icon={<TrendingUpIcon />}
            tooltipText="Year-over-year sales growth rate."
            isLoading={loadingDashboard}
            trend={salesGrowth >= 0 ? "up" : "down"}
            trendValue={formatPercentage(salesGrowth)}
            color="primary"
            metricKey="salesGrowth"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Avg Deal Size"
            value={avgDealSize}
            icon={<ReceiptLongIcon />}
            tooltipText="Average value per transaction (requires backend update)."
            isLoading={loadingDashboard}
            trend={undefined}
            trendValue={undefined}
            color="primary"
            metricKey="avgDealSize"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          {/* Target Attainment card with inline edit prep */}
          <KpiCard
            title="Target Attainment"
            value={getTargetAttainmentPercentage()}
            icon={<TargetIcon />}
            tooltipText="Percentage of sales target achieved. Click edit to update target."
            isLoading={loadingDashboard}
            color="warning"
            metricKey="targetAttainment"
            editableTarget
            targetValue={sales_target}
            onTargetEdit={setSalesTarget}
          />
        </Grid>
      </Grid>

      {/* CHARTS SECTION - F-Pattern Layout: Most critical info top-left */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6} xl={4}>
          <Box sx={{ height: "400px" }}>
            <QuotaAttainmentGauge
              data={safeTargetAttainment}
              isLoading={loadingDashboard}
              target={parseInt(sales_target) || 50000000}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} xl={8}>
          <Box sx={{ height: "400px" }}>
            <MonthlySalesTrendChart
              data={safeMonthlySalesGrowth}
              isLoading={loadingDashboard}
            />
          </Box>
        </Grid>

        {/* Second Row - Product Performance and Sales Funnel */}
        <Grid item xs={12} md={6} xl={6}>
          <Box sx={{ height: "400px" }}>
            <ProductPerformanceChart
              data={safeProductPerformance ?? []}
              isLoading={loadingDashboard}
            />
          </Box>
        </Grid>

        {/* Third Row - Branch Product Heatmap (Full Width) */}
        <Grid item xs={12}>
          <Box sx={{ height: "500px" }}>
            <BranchProductHeatmap
              data={safeHeatmapData || []}
              isLoading={loadingDashboard}
            />
          </Box>
        </Grid>

        {/* --- NEW KPIs --- */}
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Customers
              </Typography>
              {loadingDashboard ? (
                <CircularProgress />
              ) : safeTopCustomers.length === 0 ? (
                <ChartEmptyState message="No top customers data available." />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Total Sales</TableCell>
                      <TableCell align="right">Gross Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeTopCustomers.map((row, idx) => (
                      <TableRow key={row.cardName || idx}>
                        <TableCell>{row.cardName}</TableCell>
                        <TableCell align="right">{formatKshAbbreviated(row.salesAmount)}</TableCell>
                        <TableCell align="right">{formatKshAbbreviated(row.grossProfit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Margin Trends
              </Typography>
              {loadingDashboard ? (
                <CircularProgress />
              ) : safeMarginTrends.length === 0 ? (
                <ChartEmptyState message="No margin trends data available." />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Margin %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeMarginTrends.map((row, idx) => (
                      <TableRow key={row.date || idx}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell align="right">{formatPercentage(row.marginPct)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profitability by Branch
              </Typography>
              {loadingDashboard ? (
                <CircularProgress />
              ) : safeProfitability.length === 0 ? (
                <ChartEmptyState message="No profitability by branch data available." />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Branch</TableCell>
                      <TableCell align="right">Profit</TableCell>
                      <TableCell align="right">Margin %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeProfitability.map((row, idx) => (
                      <TableRow key={row.branch || idx}>
                        <TableCell>{row.branch}</TableCell>
                        <TableCell align="right">{formatKshAbbreviated(row.grossProfit ?? 0)}</TableCell>
                        <TableCell align="right">{formatPercentage(row.grossMargin ?? 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Returns Analysis
              </Typography>
              {loadingDashboard ? (
                <CircularProgress />
              ) : safeReturns.length === 0 ? (
                <ChartEmptyState message="No returns analysis data available." />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeReturns.map((row, idx) => (
                      <TableRow key={row.reason || idx}>
                        <TableCell>{row.reason}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {debugMode && (
        <Box
          sx={{
            my: 2,
            p: 2,
            bgcolor: "#f5f5f5",
            borderRadius: 2,
            fontSize: "0.85em",
            overflowX: "auto",
          }}
        >
          <Typography variant="caption" color="secondary">
            Raw dashboardData:
          </Typography>
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};
export default Dashboard;
