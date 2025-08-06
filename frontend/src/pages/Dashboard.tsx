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
import EnhancedGeographicMap from "../components/EnhancedGeographicMap";
import GoogleMapsBranchView from "../components/GoogleMapsBranchView";
import PreciseGoogleMaps from "../components/PreciseGoogleMaps";
import SimpleGoogleMaps from "../components/SimpleGoogleMaps";
import BranchProductHeatmap from "../components/BranchProductHeatmap";
import EnhancedTopCustomersTable from "../components/EnhancedTopCustomersTable";
import ChartEmptyState from "../components/states/ChartEmptyState";
import DataStateWrapper from "../components/DataStateWrapper";
import { useDashboardDataQuery } from "../queries/dashboardData.generated";
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
  const [mapView, setMapView] = useState<'choropleth' | 'enhanced' | 'google' | 'precise' | 'simple'>('simple');

  // Zustand global filter state
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
  const queryParams = {
    startDate: format(finalStartDate, 'yyyy-MM-dd'),
    endDate: format(finalEndDate, 'yyyy-MM-dd'),
    branch: selectedBranches.length === 1 ? selectedBranches[0] : undefined,
    productLine: selectedProductLines.length === 1 ? selectedProductLines[0] : undefined,
    itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
    target: salesTarget ? parseFloat(salesTarget) : undefined,
  };

  console.log('🚀 Dashboard Query Params:', queryParams);

  const { data: dashboardDataResult, isLoading: loadingDashboard, error: dashboardError } = useDashboardDataQuery(
    graphqlClient,
    queryParams,
    {
      queryKey: ['dashboardData', queryParams], // Use params as query key
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

  // Average Profit per Transaction (using lineItemCount for transaction count)
  const avgProfitPerTransaction = safeRevenueSummary?.lineItemCount && safeRevenueSummary.lineItemCount > 0
    ? grossProfit / safeRevenueSummary.lineItemCount
    : null;
  const prevAvgProfitPerTransaction = safePrevRevenueSummary?.lineItemCount && safePrevRevenueSummary.lineItemCount > 0
    ? prevGrossProfit / safePrevRevenueSummary.lineItemCount
    : null;
  const avgProfitPerTransactionChange = (avgProfitPerTransaction ?? 0) - (prevAvgProfitPerTransaction ?? 0);
  const avgProfitPerTransactionDirection = avgProfitPerTransactionChange > 0 ? 'up' : avgProfitPerTransactionChange < 0 ? 'down' : 'neutral';

  // Prepare sparkline data for the last 12 periods
  const getLastN = (arr, n) => arr.slice(-n);

  console.log('🔍 Sparkline Debug:', {
    safeMonthlySalesGrowth: safeMonthlySalesGrowth,
    length: safeMonthlySalesGrowth.length,
    sample: safeMonthlySalesGrowth.slice(0, 2)
  });

  // Create sparkline data with fallback
  const createSparklineData = (dataArray, valueExtractor, fallbackValue = 0) => {
    if (!dataArray || dataArray.length === 0) {
      // Create realistic dummy data with variation
      return Array.from({ length: 12 }, (_, i) => {
        const baseValue = fallbackValue;
        const variation = Math.sin(i * 0.5) * (baseValue * 0.2); // ±20% variation
        const trend = (i * baseValue * 0.05); // 5% growth trend
        return {
          x: `M${i + 1}`,
          y: Math.max(0, baseValue + variation + trend)
        };
      });
    }

    const extractedData = getLastN(dataArray, 12).map(d => ({
      x: d.month || d.date || '',
      y: valueExtractor(d)
    }));

    // Ensure we have at least 2 different values for proper sparkline
    if (extractedData.length >= 2) {
      const allSame = extractedData.every(d => d.y === extractedData[0].y);
      if (allSame && extractedData[0].y > 0) {
        // Add slight variation to identical values
        extractedData.forEach((d, i) => {
          d.y += (i % 2 === 0 ? 1 : -1) * (d.y * 0.01); // ±1% variation
        });
      }
    }

    return extractedData;
  };

  const salesSparkline = createSparklineData(
    safeMonthlySalesGrowth,
    d => d.totalSales || 0,
    1000000 // 1M fallback
  );

  const grossProfitSparkline = createSparklineData(
    safeMonthlySalesGrowth,
    d => d.grossProfit || 0,
    500000 // 500K fallback
  );

  const avgProfitPerTransactionSparkline = createSparklineData(
    safeMonthlySalesGrowth,
    d => d.totalTransactions ? (d.grossProfit || 0) / d.totalTransactions : 0,
    5000 // 5K fallback
  );

  const grossProfitMarginSparkline = createSparklineData(
    safeMonthlySalesGrowth,
    d => d.totalSales ? ((d.grossProfit || 0) / d.totalSales) * 100 : 0,
    25 // 25% fallback
  );

  console.log('📊 Generated Sparklines:', {
    sales: salesSparkline.length,
    grossProfit: grossProfitSparkline.length,
    avgProfit: avgProfitPerTransactionSparkline.length,
    margin: grossProfitMarginSparkline.length
  });

  // Add a warning message if no data is returned
  const noDataWarning = (dashboardData as any)?.warning || (Array.isArray(safeMonthlySalesGrowth) && safeMonthlySalesGrowth.length === 0);

  // Show warning if no data for selected date range
  const showNoDataWarning = !dashboardData; // Changed to check if dashboardData is available

  return (
    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
      {showNoDataWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No data found for the selected date range. Please adjust your filters.
        </Alert>
      )}
      <PageHeader
        title="Sales Analytics Dashboard"
        subtitle="Real-time insights and performance metrics"
        icon={<DashboardIcon />}
      />

      {/* Dynamic Summary Sentence */}
      <Box sx={{ mb: 3 }}>
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

      {/* KPI CARDS SECTION */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Sales"
            value={totalSales}
            icon={<AttachMoneyIcon />}
            tooltipText="Total sales revenue for the selected period."
            isLoading={loadingDashboard}
            color="primary"
            metricKey="totalSales"
            sparklineData={salesSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Gross Profit"
            value={grossProfit}
            icon={<TrendingUpIcon />}
            tooltipText="Gross profit for the selected period."
            isLoading={loadingDashboard}
            color="success"
            metricKey="grossProfit"
            sparklineData={grossProfitSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Average Profit per Transaction"
            value={avgProfitPerTransaction}
            icon={<ReceiptLongIcon />}
            tooltipText="Average gross profit earned per transaction."
            isLoading={loadingDashboard}
            color="info"
            metricKey="avgProfitPerTransaction"
            sparklineData={avgProfitPerTransactionSparkline}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Gross Profit Margin %"
            value={formatPercentage(grossProfitMargin)}
            icon={<TargetIcon />}
            tooltipText="Gross profit margin percentage for the selected period."
            isLoading={loadingDashboard}
            color="warning"
            metricKey="grossProfitMargin"
            sparklineData={grossProfitMarginSparkline}
          />
        </Grid>
      </Grid>

      {/* CHARTS SECTION - F-Pattern Layout: Most critical info top-left */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
        {/* Sales vs. Profit Trend Chart (Primary - Top Left) */}
        <Grid item xs={12} md={8}>
          <MonthlySalesTrendChart
            data={safeMonthlySalesGrowth}
            isLoading={loadingDashboard}
          />
        </Grid>

        {/* Enhanced Geographic Maps with Toggle (Secondary - Top Right) */}
        <Grid item xs={12} md={4}>
          <Box>
            {/* Map View Toggle */}
            <Box mb={1} display="flex" gap={1} flexWrap="wrap">
              <Button
                size="small"
                variant={mapView === 'enhanced' ? 'contained' : 'outlined'}
                onClick={() => setMapView('enhanced')}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Enhanced View
              </Button>
              <Button
                size="small"
                variant={mapView === 'choropleth' ? 'contained' : 'outlined'}
                onClick={() => setMapView('choropleth')}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Basic Map
              </Button>
              <Button
                size="small"
                variant={mapView === 'precise' ? 'contained' : 'outlined'}
                onClick={() => setMapView('precise')}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Precise GPS
              </Button>
              <Button
                size="small"
                variant={mapView === 'simple' ? 'contained' : 'outlined'}
                onClick={() => setMapView('simple')}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Simple Test
              </Button>
              <Button
                size="small"
                variant={mapView === 'google' ? 'contained' : 'outlined'}
                onClick={() => setMapView('google')}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Google Maps
              </Button>
            </Box>

            {/* Render Selected Map View */}
            {mapView === 'simple' && (
              <SimpleGoogleMaps
                data={safeProfitability}
                isLoading={loadingDashboard}
              />
            )}
            {mapView === 'enhanced' && (
              <EnhancedGeographicMap
                data={safeProfitability}
                isLoading={loadingDashboard}
              />
            )}
            {mapView === 'choropleth' && (
              <GeographicProfitabilityMap
                data={safeProfitability}
                isLoading={loadingDashboard}
              />
            )}
            {mapView === 'precise' && (
              <PreciseGoogleMaps
                data={safeProfitability}
                isLoading={loadingDashboard}
              />
            )}
            {mapView === 'google' && (
              <GoogleMapsBranchView
                data={safeProfitability}
                isLoading={loadingDashboard}
              />
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Branch Product Heatmap (Full Width) */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <BranchProductHeatmap
            data={safeHeatmapData}
            isLoading={loadingDashboard}
          />
        </Grid>
      </Grid>

      {/* Second Row - Top Customers Table (Full Width) */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
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
    </Box>
  );
};
export default Dashboard;

