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
import GeographicProfitabilityMap from "../components/GeographicProfitabilityMap";
import EnhancedTopCustomersTable from "../components/EnhancedTopCustomersTable";
import ChartEmptyState from "../components/states/ChartEmptyState";
import DataStateWrapper from "../components/DataStateWrapper";
import { useDashboardDataQuery } from "../queries/dashboardData.generated";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";
import { useDataRange } from "../hooks/useDataRange";

import { useNavigate } from "react-router-dom";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import FilterBar from "../components/FilterBar";
import { useFilterStore, FilterStore } from "../store/filterStore";
import Alert from '@mui/material/Alert';

// Type guards for API responses
// Remove legacy type guards; use generated types directly

const Dashboard = () => {
  const [debugMode, setDebugMode] = useState(false);
  // Remove useFilters/context usage
  // const { date_range, start_date, end_date, selected_branch, selected_product_line, sales_target, setSalesTarget } = useFilters();

  // Zustand global filter state
  // Explicitly type the store usage
  const filterStore: FilterStore = useFilterStore();
  const startDate = filterStore.startDate;
  const endDate = filterStore.endDate;
  const selectedBranches = filterStore.selectedBranches;
  const selectedProductLines = filterStore.selectedProductLines;
  const selectedItemGroups = filterStore.selectedItemGroups;
  const salesTarget = filterStore.salesTarget;
  const setStartDate = filterStore.setStartDate;
  const setEndDate = filterStore.setEndDate;
  const setBranches = filterStore.setBranches;
  const setProductLines = filterStore.setProductLines;
  const setItemGroups = filterStore.setItemGroups;
  const setSalesTarget = filterStore.setSalesTarget;
  const clearFilters = filterStore.clearFilters;

  // Get data range constraints
  const { minDate, maxDate, isLoading: dataRangeLoading } = useDataRange();

  // Set default dates if none are selected - ensure we use dates where data exists
  const effectiveStartDate = startDate || minDate || new Date('2025-01-01');
  const effectiveEndDate = endDate || maxDate || new Date('2025-01-31');

  // Ensure we don't query beyond the available data range
  const finalStartDate = maxDate && effectiveStartDate > maxDate ? maxDate : effectiveStartDate;
  const finalEndDate = minDate && effectiveEndDate < minDate ? minDate : effectiveEndDate;

  // Development-only: Force reset to January 2025 if dates are wrong
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && startDate && endDate) {
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endYear = endDate.getFullYear();

      // If dates are not January 2025, reset them
      if (startYear !== 2025 || startMonth !== 0 || endYear !== 2025 || endMonth !== 0) {
        console.log('Development: Resetting dates to January 2025');
        filterStore.resetToDefaults();
      }
    }
  }, [startDate, endDate, filterStore]);

  // Calculate previous period
  const currentStart = finalStartDate;
  const currentEnd = finalEndDate;
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
    dateRange: { start: finalStartDate, end: finalEndDate },
    branches: selectedBranches,
    productLines: selectedProductLines,
    itemGroups: selectedItemGroups,
    target: salesTarget ? parseFloat(salesTarget) : undefined,
  }), [finalStartDate, finalEndDate, selectedBranches, selectedProductLines, selectedItemGroups, salesTarget]);
  const prevFilters = useMemo(() => ({
    dateRange: { start: prevStartStr, end: prevEndStr },
    branches: selectedBranches,
    productLines: selectedProductLines,
    itemGroups: selectedItemGroups,
    target: salesTarget ? parseFloat(salesTarget) : undefined,
  }), [prevStartStr, prevEndStr, selectedBranches, selectedProductLines, selectedItemGroups, salesTarget]);

  // Dynamic query key for React Query
  const dashboardQueryKey = useMemo(() => [
    'dashboardData',
    {
      startDate: format(finalStartDate, 'yyyy-MM-dd'),
      endDate: format(finalEndDate, 'yyyy-MM-dd'),
      branches: selectedBranches,
      productLines: selectedProductLines,
      itemGroups: selectedItemGroups,
      target: salesTarget,
    }
  ], [finalStartDate, finalEndDate, selectedBranches, selectedProductLines, selectedItemGroups, salesTarget]);

  // Fetch dashboard data with all filters
  const { data: dashboardDataResult, isLoading: loadingDashboard, error: dashboardError } = useDashboardDataQuery(
    graphqlClient,
    {
      startDate: format(finalStartDate, 'yyyy-MM-dd'),
      endDate: format(finalEndDate, 'yyyy-MM-dd'),
      branch: selectedBranches.length === 1 ? selectedBranches[0] : undefined,
      productLine: selectedProductLines.length === 1 ? selectedProductLines[0] : undefined,
      itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
      target: salesTarget ? parseFloat(salesTarget) : undefined,
    },
    {
      queryKey: dashboardQueryKey,
    }
  );
  const dashboardData = dashboardDataResult?.dashboardData;

  // Effect: update dateRangeHasData based on dashboardData
  useEffect(() => {
    // If dashboardData is undefined or empty, set warning
    if (!loadingDashboard && dashboardDataResult && (!dashboardData || Object.keys(dashboardData).length === 0)) {
      // setDateRangeHasData(false); // Removed as per edit hint
    } else {
      // setDateRangeHasData(true); // Removed as per edit hint
    }
  }, [dashboardData, dashboardDataResult, loadingDashboard]); // Removed setDateRangeHasData from dependency array

  // Log GraphQL query error to the console if present
  useEffect(() => {
    if (dashboardError) {
      // Log the error object for debugging
      // eslint-disable-next-line no-console
      console.error('Dashboard Query Error:', dashboardError);
    }
  }, [dashboardError]);

  const { data: prevDashboardDataResult, isLoading: loadingPrevDashboard } = useDashboardDataQuery(
    graphqlClient,
    {
      startDate: prevStartStr,
      endDate: prevEndStr,
      branch: selectedBranches.length === 1 ? selectedBranches[0] : undefined,
      productLine: selectedProductLines.length === 1 ? selectedProductLines[0] : undefined,
      itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
      target: salesTarget ? parseFloat(salesTarget) : undefined,
    },
    {
      queryKey: ["dashboardData", prevFilters],
    }
  );
  const prevDashboardData = prevDashboardDataResult?.dashboardData;

  // Extract options for filter bar (fallback to static if no data)
  const branchOptions = useMemo(() => {
    if (dashboardData?.branchList && Array.isArray(dashboardData.branchList)) {
      return dashboardData.branchList.map((b: any) => b.branch).filter(Boolean);
    }
    return [];
  }, [dashboardData]);
  const productLineOptions = useMemo(() => {
    if (dashboardData?.productAnalytics && Array.isArray(dashboardData.productAnalytics)) {
      return Array.from(new Set(dashboardData.productAnalytics.map((p: any) => p.productLine))).filter(Boolean);
    }
    return [];
  }, [dashboardData]);
  const itemGroupOptions = useMemo(() => {
    if (dashboardData?.productAnalytics && Array.isArray(dashboardData.productAnalytics)) {
      return Array.from(new Set(dashboardData.productAnalytics.map((p: any) => p.itemGroup))).filter(Boolean);
    }
    return [];
  }, [dashboardData]);

  // Use all fields from backend output directly
  const safeMonthlySalesGrowth = dashboardData?.monthlySalesGrowth ?? [];
  const safePrevMonthlySalesGrowth = prevDashboardData?.monthlySalesGrowth ?? [];
  const safeRevenueSummary = dashboardData?.revenueSummary || null;
  const safePrevRevenueSummary = prevDashboardData?.revenueSummary || null;
  const safeTargetAttainment = dashboardData?.targetAttainment || null;
  const safePrevTargetAttainment = prevDashboardData?.targetAttainment || null;
  const safeProductPerformance = dashboardData?.productPerformance ?? [];
  const safeHeatmapData = dashboardData?.branchProductHeatmap ?? [];
  const safeTopCustomers = dashboardData?.topCustomers ?? [];
  const safeMarginTrends = dashboardData?.marginTrends ?? [];
  const safeReturns = dashboardData?.returnsAnalysis ?? [];
  const safeProfitability = dashboardData?.profitabilityByDimension ?? [];

  // TODO: Add and display all other KPIs as needed

  // Calculate KPI values using revenue summary data (more accurate)
  const totalSales = safeRevenueSummary?.totalRevenue ?? 0;
  const prevTotalSales = safePrevRevenueSummary?.totalRevenue ?? 0;
  const totalSalesChange = totalSales - prevTotalSales;
  const totalSalesDirection = totalSalesChange > 0 ? 'up' : totalSalesChange < 0 ? 'down' : 'neutral';

  // Gross Profit
  const grossProfit = safeRevenueSummary?.grossProfit ?? 0;
  const prevGrossProfit = safePrevRevenueSummary?.grossProfit ?? 0;
  const grossProfitChange = grossProfit - prevGrossProfit;
  const grossProfitDirection = grossProfitChange > 0 ? 'up' : grossProfitChange < 0 ? 'down' : 'neutral';

  // Gross Profit Margin %
  const grossProfitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const prevGrossProfitMargin = prevTotalSales > 0 ? (prevGrossProfit / prevTotalSales) * 100 : 0;
  const grossProfitMarginChange = grossProfitMargin - prevGrossProfitMargin;
  const grossProfitMarginDirection = grossProfitMarginChange > 0 ? 'up' : grossProfitMarginChange < 0 ? 'down' : 'neutral';

  // Avg Deal Size (using lineItemCount for transaction count)
  const avgDealSize = safeRevenueSummary?.lineItemCount && safeRevenueSummary.lineItemCount > 0
    ? totalSales / safeRevenueSummary.lineItemCount
    : null;
  const prevAvgDealSize = safePrevRevenueSummary?.lineItemCount && safePrevRevenueSummary.lineItemCount > 0
    ? prevTotalSales / safePrevRevenueSummary.lineItemCount
    : null;
  const avgDealSizeChange = (avgDealSize ?? 0) - (prevAvgDealSize ?? 0);
  const avgDealSizeDirection = avgDealSizeChange > 0 ? 'up' : avgDealSizeChange < 0 ? 'down' : 'neutral';

  // Prepare sparkline data for the last 12 periods
  const getLastN = (arr, n) => arr.slice(-n);
  const salesSparkline = getLastN(safeMonthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.totalSales || 0 }));
  const grossProfitSparkline = getLastN(safeMonthlySalesGrowth, 12).map(d => ({ x: d.month || d.date || '', y: d.grossProfit || 0 }));
  const avgDealSizeSparkline = getLastN(safeMonthlySalesGrowth, 12).map(d => ({
    x: d.month || d.date || '',
    y: d.totalTransactions ? d.totalSales / d.totalTransactions : 0,
  }));
  const grossProfitMarginSparkline = getLastN(safeMonthlySalesGrowth, 12).map(d => ({
    x: d.month || d.date || '',
    y: d.totalSales ? ((d.grossProfit || 0) / d.totalSales) * 100 : 0,
  }));

  // Add a warning message if no data is returned
  const noDataWarning = (dashboardData as any)?.warning || (Array.isArray(safeMonthlySalesGrowth) && safeMonthlySalesGrowth.length === 0);

  // Show warning if no data for selected date range
  const showNoDataWarning = !dashboardData; // Changed to check if dashboardData is available

  return (
    <>
      {showNoDataWarning && (
        <Alert severity="warning" sx={{ mt: 0, mb: 0 }}>
          No data found for the selected date range. Please adjust your filters.
        </Alert>
      )}
      <PageHeader
        title="Sales Analytics Dashboard"
        subtitle="Real-time insights and performance metrics"
        icon={<DashboardIcon />}
      />

      {/* Dynamic Summary Sentence */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          {totalSales > 0 ? (
            <>
              {grossProfitDirection === 'up' ? 'Strong' : grossProfitDirection === 'down' ? 'Challenging' : 'Stable'} performance with{' '}
              <strong>{formatKshAbbreviated(totalSales)}</strong> in sales and{' '}
              <strong>{formatKshAbbreviated(grossProfit)}</strong> in gross profit
              ({formatPercentage(grossProfitMargin)} margin).
              {grossProfitMargin > 20 ? ' Excellent profitability maintained.' :
                grossProfitMargin > 10 ? ' Good profitability levels.' :
                  ' Focus on margin improvement needed.'}
            </>
          ) : (
            'No sales data available for the selected period. Please adjust your filters or date range.'
          )}
        </Typography>
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
            vsValue={totalSalesChange}
            vsPercent={prevTotalSales > 0 ? (totalSalesChange / prevTotalSales) * 100 : 0}
            vsDirection={totalSalesDirection}
            vsColor={totalSalesDirection === 'up' ? 'success' : totalSalesDirection === 'down' ? 'error' : 'default'}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Gross Profit"
            value={grossProfit}
            icon={<TrendingUpIcon />}
            tooltipText="Gross profit for the selected period."
            isLoading={loadingDashboard}
            trend={grossProfitDirection}
            trendValue={formatKshAbbreviated(grossProfit)}
            color="success"
            metricKey="grossProfit"
            sparklineData={grossProfitSparkline}
            vsValue={grossProfitChange}
            vsPercent={prevGrossProfit > 0 ? (grossProfitChange / prevGrossProfit) * 100 : 0}
            vsDirection={grossProfitDirection}
            vsColor={grossProfitDirection === 'up' ? 'success' : grossProfitDirection === 'down' ? 'error' : 'default'}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Avg Deal Size"
            value={avgDealSize}
            icon={<ReceiptLongIcon />}
            tooltipText="Average value per transaction."
            isLoading={loadingDashboard}
            trend={avgDealSizeDirection}
            trendValue={formatKshAbbreviated(avgDealSize ?? 0)}
            color="info"
            metricKey="avgDealSize"
            sparklineData={avgDealSizeSparkline}
            vsValue={avgDealSizeChange}
            vsPercent={prevAvgDealSize && prevAvgDealSize > 0 ? (avgDealSizeChange / prevAvgDealSize) * 100 : 0}
            vsDirection={avgDealSizeDirection}
            vsColor={avgDealSizeDirection === 'up' ? 'success' : avgDealSizeDirection === 'down' ? 'error' : 'default'}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Gross Profit Margin %"
            value={formatPercentage(grossProfitMargin)}
            icon={<TargetIcon />}
            tooltipText="Gross profit margin percentage for the selected period."
            isLoading={loadingDashboard}
            trend={grossProfitMarginDirection}
            trendValue={formatPercentage(grossProfitMargin)}
            color="warning"
            metricKey="grossProfitMargin"
            sparklineData={grossProfitMarginSparkline}
            vsValue={grossProfitMarginChange}
            vsPercent={grossProfitMarginChange}
            vsDirection={grossProfitMarginDirection}
            vsColor={grossProfitMarginDirection === 'up' ? 'success' : grossProfitMarginDirection === 'down' ? 'error' : 'default'}
          />
        </Grid>
      </Grid>

      {/* CHARTS SECTION - F-Pattern Layout: Most critical info top-left */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Sales vs. Profit Trend Chart (Primary - Top Left) */}
        <Grid item xs={12} md={8}>
          <MonthlySalesTrendChart
            data={safeMonthlySalesGrowth}
            isLoading={loadingDashboard}
          />
        </Grid>

        {/* Geographic Profitability Map (Secondary - Top Right) */}
        <Grid item xs={12} md={4}>
          <GeographicProfitabilityMap
            data={safeProfitability}
            isLoading={loadingDashboard}
          />
        </Grid>
      </Grid>

      {/* Second Row - Top Customers Table (Full Width) */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <EnhancedTopCustomersTable
            customers={safeTopCustomers}
            monthlyData={safeMonthlySalesGrowth}
            isLoading={loadingDashboard}
          />
        </Grid>
      </Grid>


      {
        debugMode && (
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
        )
      }
    </>
  );
};
export default Dashboard;

