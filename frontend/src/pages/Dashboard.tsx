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
import { useTargetAttainmentQuery } from "../queries/targetAttainment.generated";
import { useProductAnalyticsQuery } from "../queries/productAnalytics.generated";
import { useFilters } from "../context/FilterContext";

import { useNavigate } from "react-router-dom";
import { useMonthlySalesGrowthQuery } from "../queries/monthlySalesGrowth.generated";
import { useRevenueSummaryQuery } from "../queries/revenueSummary.generated";
import { graphqlClient } from "../lib/graphqlClient";

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

  // API calls for KPIs using the global filters
  const { data: monthlySalesGrowthData, isLoading: loadingMonthlySalesGrowth } =
    useMonthlySalesGrowthQuery(graphqlClient, {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
    });

  const { data: revenueSummaryData, isLoading: loadingRevenueSummary } =
    useRevenueSummaryQuery(graphqlClient, {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
    });

  const { data: branchProductHeatmap, isLoading: loadingHeatmap } =
    useProductAnalyticsQuery(graphqlClient, {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine:
        selected_product_line !== "all" ? selected_product_line : undefined,
    });

  const { data: targetAttainment, isLoading: loadingTarget } =
    useTargetAttainmentQuery(graphqlClient, {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      target: sales_target ? parseFloat(sales_target) : undefined,
    });

  const { data: productAnalytics, isLoading: loadingProductAnalytics } =
    useProductAnalyticsQuery(graphqlClient, {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine:
        selected_product_line !== "all" ? selected_product_line : undefined,
    });

  // Use all fields from backend output directly
  const safeMonthlySalesGrowth = Array.isArray(monthlySalesGrowthData)
    ? monthlySalesGrowthData
    : [];
  const safeRevenueSummary = revenueSummaryData || null;
  const safeProductAnalytics = Array.isArray(productAnalytics)
    ? productAnalytics
    : [];

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
    ? safeMonthlySalesGrowth.reduce((sum, entry) => sum + (entry.sales || 0), 0)
    : 0;
  const salesGrowth =
    Array.isArray(safeMonthlySalesGrowth) && safeMonthlySalesGrowth.length > 1
      ? ((safeMonthlySalesGrowth[safeMonthlySalesGrowth.length - 1].sales -
          safeMonthlySalesGrowth[0].sales) /
          safeMonthlySalesGrowth[0].sales) *
        100
      : 0;
  // Avg Deal Size: Not available until backend provides totalTransactions
  // TODO: Update backend to include totalTransactions in revenue summary
  const avgDealSize = safeRevenueSummary?.total_transactions
    ? safeRevenueSummary.total_revenue / safeRevenueSummary.total_transactions
    : null;

  const getTargetAttainmentPercentage = () => {
    if (!targetAttainment || typeof targetAttainment.attainment_percentage !== "number") {
      return 0;
    }
    return targetAttainment.attainment_percentage;
  };

  // Show loading state
  if (
    loadingMonthlySalesGrowth ||
    loadingRevenueSummary ||
    loadingHeatmap ||
    loadingTarget ||
    loadingProductAnalytics
  ) {
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
        p: 0,
        pl: { xs: 1.5, sm: 2 },
        pr: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 3 },
      }}
    >
      <PageHeader
        title="Sales Analytics Dashboard"
        subtitle="Real-time insights and performance metrics"
        icon={<DashboardIcon />}
        actionButton={
          <Button
            variant={debugMode ? "contained" : "outlined"}
            color={debugMode ? "secondary" : "primary"}
            size="small"
            onClick={() => setDebugMode((d) => !d)}
            sx={{ ml: 2 }}
          >
            {debugMode ? "Disable Debug" : "Enable Debug"}
          </Button>
        }
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
            value={formatCurrency(totalSales)}
            icon={<AttachMoneyIcon />}
            tooltipText="Total sales revenue for the selected period."
            isLoading={loadingMonthlySalesGrowth}
            trend={salesGrowth >= 0 ? "up" : "down"}
            trendValue={formatPercentage(salesGrowth)}
            color="primary"
            metricKey="total-sales"
            onClick={() => navigateToDetail("total-sales")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Sales Growth (YoY)"
            value={formatPercentage(salesGrowth)}
            icon={<TrendingUpIcon />}
            tooltipText="Year-over-year sales growth rate."
            isLoading={loadingMonthlySalesGrowth}
            trend={salesGrowth >= 0 ? "up" : "down"}
            trendValue={formatPercentage(salesGrowth)}
            color="primary"
            metricKey="sales-growth"
            onClick={() => navigateToDetail("sales-growth")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Avg Deal Size"
            value={avgDealSize !== null ? formatCurrency(avgDealSize) : "N/A"}
            icon={<ReceiptLongIcon />}
            tooltipText="Average value per transaction (requires backend update)."
            isLoading={loadingRevenueSummary}
            trend={undefined}
            trendValue={undefined}
            color="primary"
            metricKey="avg-deal-size"
            onClick={() => navigateToDetail("avg-deal-size")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          {/* Target Attainment card with inline edit prep */}
          <KpiCard
            title="Target Attainment"
            value={formatPercentage(getTargetAttainmentPercentage())}
            icon={<TargetIcon />}
            tooltipText="Percentage of sales target achieved. Click edit to update target."
            isLoading={loadingTarget}
            color="warning"
            metricKey="target-attainment"
            onClick={() => navigateToDetail("target-attainment")}
            editableTarget
            targetValue={sales_target}
            onTargetEdit={setSalesTarget}
          />
        </Grid>
      </Grid>

      {/* CHARTS SECTION - F-Pattern Layout: Most critical info top-left */}
      {/* Top Row - Most Critical: Quota Attainment and Monthly Trend */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6} xl={4}>
          <Box sx={{ height: "400px" }}>
            <QuotaAttainmentGauge
              data={targetAttainment}
              isLoading={loadingTarget}
              target={parseInt(sales_target) || 50000000}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} xl={8}>
          <Box sx={{ height: "400px" }}>
            <MonthlySalesTrendChart
              data={safeMonthlySalesGrowth}
              isLoading={loadingMonthlySalesGrowth}
            />
          </Box>
        </Grid>

        {/* Second Row - Product Performance and Sales Funnel */}
        <Grid item xs={12} md={6} xl={6}>
          <Box sx={{ height: "400px" }}>
            <ProductPerformanceChart
              data={safeProductAnalytics}
              isLoading={loadingProductAnalytics}
            />
          </Box>
        </Grid>

        {/* <Grid item xs={12} md={6} xl={6}>
          <Box sx={{ height: "400px" }}>
            <SalesFunnelChart
              data={productAnalytics?.productAnalytics || []}
              isLoading={loadingProductAnalytics}
            />
          </Box>
        </Grid> */}

        {/* Third Row - Branch Product Heatmap (Full Width) */}
        <Grid item xs={12}>
          <Box sx={{ height: "500px" }}>
            <BranchProductHeatmap
              data={
                Array.isArray(branchProductHeatmap) ? branchProductHeatmap : []
              }
              isLoading={loadingHeatmap}
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
              {loadingProductAnalytics ? (
                <CircularProgress />
              ) : productAnalytics === null ||
                productAnalytics === undefined ? (
                <ChartEmptyState
                  isError
                  message="Failed to load top customers."
                />
              ) : safeProductAnalytics.length === 0 ? (
                <ChartEmptyState message="No top customers data available." />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Total Sales</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(safeProductAnalytics) &&
                      safeProductAnalytics.map((row, idx) => (
                        <TableRow key={row.acctName || idx}>
                          <TableCell>{row.acctName}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.salesAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.grossProfit)}
                          </TableCell>
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
              {loadingProductAnalytics ? (
                <CircularProgress />
              ) : productAnalytics === null ||
                productAnalytics === undefined ? (
                <ChartEmptyState
                  isError
                  message="Failed to load margin trends."
                />
              ) : safeProductAnalytics.length === 0 ? (
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
                    {Array.isArray(safeProductAnalytics) &&
                      safeProductAnalytics.map((row, idx) => (
                        <TableRow key={row.date || idx}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell align="right">
                            {formatPercentage(row.margin)}
                          </TableCell>
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
              {loadingProductAnalytics ? (
                <CircularProgress />
              ) : productAnalytics === null ||
                productAnalytics === undefined ? (
                <ChartEmptyState
                  isError
                  message="Failed to load profitability by branch."
                />
              ) : safeProductAnalytics.length === 0 ? (
                <ChartEmptyState message="No profitability by branch data available." />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Branch</TableCell>
                      <TableCell align="right">Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(safeProductAnalytics) &&
                      safeProductAnalytics.map((row, idx) => (
                        <TableRow key={row.dimension || idx}>
                          <TableCell>{row.dimension}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.grossProfit)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPercentage(row.grossMargin)}
                          </TableCell>
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
              {loadingProductAnalytics ? (
                <CircularProgress />
              ) : productAnalytics === null ||
                productAnalytics === undefined ? (
                <ChartEmptyState
                  isError
                  message="Failed to load returns analysis."
                />
              ) : safeProductAnalytics.length === 0 ? (
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
                    {Array.isArray(safeProductAnalytics) &&
                      safeProductAnalytics.map((row, idx) => (
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
            Raw monthlySalesGrowthData:
          </Typography>
          <pre>{JSON.stringify(monthlySalesGrowthData, null, 2)}</pre>
        </Box>
      )}
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
            Raw revenueSummaryData:
          </Typography>
          <pre>{JSON.stringify(revenueSummaryData, null, 2)}</pre>
        </Box>
      )}
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
            Raw productAnalytics:
          </Typography>
          <pre>{JSON.stringify(productAnalytics, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};
export default Dashboard;
