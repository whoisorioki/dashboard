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
import { differenceInCalendarDays, subDays, parseISO } from "date-fns";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import MonthlySalesTrendChart from "../components/MonthlySalesTrendChart";
import ProductPerformanceChart from "../components/ProductPerformanceChart";
import BranchProductHeatmap from "../components/BranchProductHeatmap";
import QuotaAttainmentGauge from "../components/QuotaAttainmentGauge";
import ChartEmptyState from "../components/states/ChartEmptyState";
import DataStateWrapper from "../components/DataStateWrapper";
import { useDashboardDataQuery } from "../queries/dashboardData.generated";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";

import { useNavigate } from "react-router-dom";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";

// Type guards for API responses
// Remove legacy type guards; use generated types directly

const Dashboard = () => {
  const [debugMode, setDebugMode] = useState(false);
  const { date_range, start_date, end_date, selected_branch, selected_product_line, sales_target, setSalesTarget } = useFilters();

  // Calculate previous period
  const [currentStart, currentEnd] = date_range;
  let prevStart: Date | null = null;
  let prevEnd: Date | null = null;
  if (currentStart && currentEnd) {
    const duration = differenceInCalendarDays(currentEnd, currentStart);
    prevEnd = subDays(currentStart, 1);
    prevStart = subDays(prevEnd, duration);
  }
  const prevStartStr = prevStart ? format(prevStart, 'yyyy-MM-dd') : undefined;
  const prevEndStr = prevEnd ? format(prevEnd, 'yyyy-MM-dd') : undefined;

  // Memoized filters for query keys
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    branch: selected_branch !== 'all' ? selected_branch : undefined,
    productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
    target: sales_target ? parseFloat(sales_target) : undefined,
  }), [start_date, end_date, selected_branch, selected_product_line, sales_target]);
  const prevFilters = useMemo(() => ({
    dateRange: { start: prevStartStr, end: prevEndStr },
    branch: selected_branch !== 'all' ? selected_branch : undefined,
    productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
    target: sales_target ? parseFloat(sales_target) : undefined,
  }), [prevStartStr, prevEndStr, selected_branch, selected_product_line, sales_target]);

  // Parallel fetch: current and previous period
  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardDataQuery(
    graphqlClient,
    {
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      branch: selected_branch !== 'all' ? selected_branch : undefined,
      productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
      target: sales_target ? parseFloat(sales_target) : undefined,
    },
    {
      queryKey: queryKeys.kpis, // Use a broad key for the dashboard aggregate, or split by section if needed
    }
  );
  const { data: prevDashboardData, isLoading: loadingPrevDashboard } = useDashboardDataQuery(
    graphqlClient,
    {
      startDate: prevStartStr,
      endDate: prevEndStr,
      branch: selected_branch !== 'all' ? selected_branch : undefined,
      productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
      target: sales_target ? parseFloat(sales_target) : undefined,
    },
    {
      queryKey: queryKeys.kpis, // Use a broad key for the dashboard aggregate, or split by section if needed
    }
  );

  // Use all fields from backend output directly
  const safeMonthlySalesGrowth = dashboardData?.monthlySalesGrowth ?? [];
  const safePrevMonthlySalesGrowth = prevDashboardData?.monthlySalesGrowth ?? [];
  const safeRevenueSummary = dashboardData?.revenueSummary || null;
  const safePrevRevenueSummary = prevDashboardData?.revenueSummary || null;
  const safeProductAnalytics = dashboardData?.productAnalytics ?? [];
  const safeTargetAttainment = dashboardData?.targetAttainment || null;
  const safePrevTargetAttainment = prevDashboardData?.targetAttainment || null;
  const safeProductPerformance = dashboardData?.productPerformance ?? [];
  const safeHeatmapData = dashboardData?.branchProductHeatmap ?? [];
  const safeTopCustomers = dashboardData?.topCustomers ?? [];
  const safeMarginTrends = dashboardData?.marginTrends ?? [];
  const safeReturns = dashboardData?.returnsAnalysis ?? [];
  const safeProfitability = dashboardData?.profitabilityByDimension ?? [];

  // TODO: Add and display all other KPIs as needed

  // Calculate KPI values for current and previous period
  const totalSales = Array.isArray(safeMonthlySalesGrowth)
    ? safeMonthlySalesGrowth.reduce((sum, entry) => sum + (entry.totalSales || 0), 0)
    : 0;
  const prevTotalSales = Array.isArray(safePrevMonthlySalesGrowth)
    ? safePrevMonthlySalesGrowth.reduce((sum, entry) => sum + (entry.totalSales || 0), 0)
    : 0;
  const totalSalesChange = totalSales - prevTotalSales;
  const totalSalesChangePct = prevTotalSales ? (totalSalesChange / prevTotalSales) * 100 : 0;
  const totalSalesDirection = totalSalesChange > 0 ? 'up' : totalSalesChange < 0 ? 'down' : 'neutral';
  const totalSalesColor = totalSalesDirection === 'up' ? 'success' : totalSalesDirection === 'down' ? 'error' : 'default';

  // Sales Growth
  const salesGrowth =
    Array.isArray(safeMonthlySalesGrowth) && safeMonthlySalesGrowth.length > 1
      ? ((safeMonthlySalesGrowth[safeMonthlySalesGrowth.length - 1].totalSales -
        safeMonthlySalesGrowth[0].totalSales) /
        safeMonthlySalesGrowth[0].totalSales) *
      100
      : 0;
  const prevSalesGrowth =
    Array.isArray(safePrevMonthlySalesGrowth) && safePrevMonthlySalesGrowth.length > 1
      ? ((safePrevMonthlySalesGrowth[safePrevMonthlySalesGrowth.length - 1].totalSales -
        safePrevMonthlySalesGrowth[0].totalSales) /
        safePrevMonthlySalesGrowth[0].totalSales) *
      100
      : 0;
  const salesGrowthChange = salesGrowth - prevSalesGrowth;
  const salesGrowthDirection = salesGrowthChange > 0 ? 'up' : salesGrowthChange < 0 ? 'down' : 'neutral';
  const salesGrowthColor = salesGrowthDirection === 'up' ? 'success' : salesGrowthDirection === 'down' ? 'error' : 'default';

  // Avg Deal Size
  const avgDealSize = safeRevenueSummary?.totalTransactions
    ? safeRevenueSummary.totalRevenue / safeRevenueSummary.totalTransactions
    : null;
  const prevAvgDealSize = safePrevRevenueSummary?.totalTransactions
    ? safePrevRevenueSummary.totalRevenue / safePrevRevenueSummary.totalTransactions
    : null;
  const avgDealSizeChange = (avgDealSize ?? 0) - (prevAvgDealSize ?? 0);
  const avgDealSizeChangePct = prevAvgDealSize ? (avgDealSizeChange / prevAvgDealSize) * 100 : 0;
  const avgDealSizeDirection = avgDealSizeChange > 0 ? 'up' : avgDealSizeChange < 0 ? 'down' : 'neutral';
  const avgDealSizeColor = avgDealSizeDirection === 'up' ? 'success' : avgDealSizeDirection === 'down' ? 'error' : 'default';

  // Target Attainment
  const getTargetAttainmentPercentage = (dataObj: any) => {
    if (!dataObj || typeof dataObj.attainmentPercentage !== "number") {
      return 0;
    }
    return dataObj.attainmentPercentage;
  };
  const targetAttainment = getTargetAttainmentPercentage(safeTargetAttainment);
  const prevTargetAttainment = getTargetAttainmentPercentage(safePrevTargetAttainment);
  const targetAttainmentChange = targetAttainment - prevTargetAttainment;
  const targetAttainmentDirection = targetAttainmentChange > 0 ? 'up' : targetAttainmentChange < 0 ? 'down' : 'neutral';
  const targetAttainmentColor = targetAttainmentDirection === 'up' ? 'success' : targetAttainmentDirection === 'down' ? 'error' : 'default';

  // Helper functions for canonical calculations
  // These are now calculated directly above
  // const totalSales = Array.isArray(safeMonthlySalesGrowth)
  //   ? safeMonthlySalesGrowth.reduce((sum, entry) => sum + (entry.totalSales || 0), 0)
  //   : 0;
  // const salesGrowth =
  //   Array.isArray(safeMonthlySalesGrowth) && safeMonthlySalesGrowth.length > 1
  //     ? ((safeMonthlySalesGrowth[safeMonthlySalesGrowth.length - 1].totalSales -
  //         safeMonthlySalesGrowth[0].totalSales) /
  //         safeMonthlySalesGrowth[0].totalSales) *
  //       100
  //     : 0;
  // // Avg Deal Size: Not available until backend provides totalTransactions
  // // (Backend already provides totalTransactions in revenue summary)
  // const avgDealSize = safeRevenueSummary?.totalTransactions
  //   ? safeRevenueSummary.totalRevenue / safeRevenueSummary.totalTransactions
  //   : null;

  // Prepare sparkline data for the last 12 periods
  const getLastN = (arr, n) => arr.slice(-n);
  const salesSparkline = getLastN(safeMonthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.totalSales || 0 }));
  const salesGrowthSparkline = getLastN(safeMonthlySalesGrowth, 12).map((d, i, arr) => {
    if (i === 0) return { x: d.month || d.date || '', y: 0 };
    const prev = arr[i - 1];
    return {
      x: d.month || d.date || '',
      y: prev.totalSales ? ((d.totalSales - prev.totalSales) / prev.totalSales) * 100 : 0,
    };
  });
  const avgDealSizeSparkline = getLastN(safeMonthlySalesGrowth, 12).map(d => ({
    x: d.month || d.date || '',
    y: d.totalTransactions ? d.totalSales / d.totalTransactions : 0,
  }));
  const targetAttainmentSparkline = Array(12).fill({
    x: '',
    y: typeof safeTargetAttainment?.attainmentPercentage === 'number' ? safeTargetAttainment.attainmentPercentage : 0,
  });

  return (
    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
      <PageHeader
        title="Sales Analytics Dashboard"
        subtitle="Real-time insights and performance metrics"
        icon={<DashboardIcon />}
      />

      {/* Add summary sentence and refactor KPI card layout */}
      <Box sx={{ mb: 4 }}>
        {/* Dynamic summary: Example logic, can be improved */}
      </Box>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Sales"
            value={totalSales}
            icon={<AttachMoneyIcon />}
            tooltipText="Total sales revenue for the selected period."
            isLoading={loadingDashboard}
            trend={totalSalesDirection}
            trendValue={formatKshAbbreviated(totalSales)}
            color="primary"
            metricKey="totalSales"
            sparklineData={salesSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Sales Growth (YoY)"
            value={formatPercentage(salesGrowth)}
            icon={<TrendingUpIcon />}
            tooltipText="Year-over-year sales growth rate."
            isLoading={loadingDashboard}
            trend={salesGrowthDirection}
            trendValue={formatPercentage(salesGrowth)}
            color="primary"
            metricKey="salesGrowth"
            sparklineData={salesGrowthSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Avg Deal Size"
            value={avgDealSize}
            icon={<ReceiptLongIcon />}
            tooltipText="Average value per transaction (requires backend update)."
            isLoading={loadingDashboard}
            trend={avgDealSizeDirection}
            trendValue={formatKshAbbreviated(avgDealSize ?? 0)}
            color="primary"
            metricKey="avgDealSize"
            sparklineData={avgDealSizeSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          {/* Target Attainment card with inline edit prep */}
          <KpiCard
            title="Target Attainment"
            value={formatPercentage(targetAttainment)}
            icon={<TargetIcon />}
            tooltipText="Percentage of sales target achieved. Click edit to update target."
            isLoading={loadingDashboard}
            trend={targetAttainmentDirection}
            trendValue={formatPercentage(targetAttainment)}
            color="warning"
            metricKey="targetAttainment"
            editableTarget
            targetValue={sales_target}
            onTargetEdit={setSalesTarget}
            sparklineData={targetAttainmentSparkline}
          />
        </Grid>
      </Grid>

      {/* CHARTS SECTION - F-Pattern Layout: Most critical info top-left */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6} xl={4}>
          <Box sx={{ height: "400px" }}>
            <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeTargetAttainment ? [safeTargetAttainment] : []} emptyMessage="No target attainment data available.">
              <QuotaAttainmentGauge
                data={safeTargetAttainment}
                isLoading={false}
                target={parseInt(sales_target) || 1000000000}
              />
            </DataStateWrapper>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} xl={8}>
          <Box sx={{ height: "400px" }}>
            <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeMonthlySalesGrowth} emptyMessage="No sales data available.">
              <MonthlySalesTrendChart
                data={safeMonthlySalesGrowth}
                isLoading={false}
              />
            </DataStateWrapper>
          </Box>
        </Grid>

        {/* Second Row - Product Performance and Sales Funnel */}
        <Grid item xs={12} md={6} xl={6}>
          <Box sx={{ height: "400px" }}>
            <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeProductPerformance} emptyMessage="No product performance data available.">
              <ProductPerformanceChart
                data={safeProductPerformance ?? []}
                isLoading={false}
              />
            </DataStateWrapper>
          </Box>
        </Grid>

        {/* Third Row - Branch Product Heatmap (Full Width) */}
        <Grid item xs={12}>
          <Box sx={{ height: "500px" }}>
            <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeHeatmapData} emptyMessage="No branch product heatmap data available.">
              <BranchProductHeatmap
                data={safeHeatmapData || []}
                isLoading={false}
              />
            </DataStateWrapper>
          </Box>
        </Grid>

        {/* --- NEW KPIs --- */}
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Customers
              </Typography>
              <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeTopCustomers} emptyMessage="No top customers data available.">
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
              </DataStateWrapper>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Margin Trends
              </Typography>
              <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeMarginTrends} emptyMessage="No margin trends data available.">
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
              </DataStateWrapper>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profitability by Branch
              </Typography>
              <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeProfitability} emptyMessage="No profitability by branch data available.">
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
              </DataStateWrapper>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Returns Analysis
              </Typography>
              <DataStateWrapper isLoading={loadingDashboard} error={null} data={safeReturns} emptyMessage="No returns analysis data available.">
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
              </DataStateWrapper>
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
