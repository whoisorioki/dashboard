import { Box, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { BarChart as BarChartIcon, MonetizationOn, TrendingUp, AttachMoney } from '@mui/icons-material';
import ContextualKpiCard from '../components/ContextualKpiCard';
import CombinationChart from '../components/CombinationChart';
import DonutChart from '../components/DonutChart';
import QuotaAttainmentGauge from '../components/QuotaAttainmentGauge';
import { useApi } from '../hooks/useDynamicApi';
import { useFilters } from '../context/FilterContext';
import { ProfitSummaryData } from '../types/api';

const ExecutiveSummary = () => {
    const { startDate, endDate, selectedBranch, selectedProductLine, salesTarget } = useFilters();

    const { data: profitSummary, isLoading: loadingProfitSummary } = useApi<ProfitSummaryData>('/kpis/profit-summary', {
        start_date: startDate,
        end_date: endDate,
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        product_line: selectedProductLine !== 'all' ? selectedProductLine : undefined,
    });

    const { data: marginTrends, isLoading: loadingMarginTrends } = useApi<any[]>('/kpis/margin-trends', {
        start_date: startDate,
        end_date: endDate,
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        product_line: selectedProductLine !== 'all' ? selectedProductLine : undefined,
    });

    const { data: revenueByProductLine, isLoading: loadingRevenueByProductLine } = useApi<any[]>('/kpis/profitability-by-dimension', {
        dimension: 'ProductLine',
        start_date: startDate,
        end_date: endDate,
    });

    const { data: revenueByBranch, isLoading: loadingRevenueByBranch } = useApi<any[]>('/kpis/profitability-by-dimension', {
        dimension: 'Branch',
        start_date: startDate,
        end_date: endDate,
    });

    const formatCurrency = (value: number | undefined | null) => {
        if (value == null || isNaN(value)) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatPercentage = (value: number | undefined | null) => {
        if (value == null || isNaN(value) || !isFinite(value)) return '0%';
        return `${value.toFixed(1)}%`
    }

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title="Executive Summary"
                subtitle="High-level overview of key business metrics"
                icon={<BarChartIcon />}
            />
            <Grid container spacing={3}>
                {/* KPI Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <ContextualKpiCard
                        title="Net Revenue"
                        value={formatCurrency(profitSummary?.net_revenue)}
                        icon={<AttachMoney color="primary" />}
                        tooltipText="Revenue after returns and deductions."
                        isLoading={loadingProfitSummary}
                        trendValue="+5.4%"
                        sparklineData={[12, 19, 3, 5, 2, 3, 10]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <ContextualKpiCard
                        title="Gross Profit"
                        value={formatCurrency(profitSummary?.gross_profit)}
                        icon={<MonetizationOn color="success" />}
                        tooltipText="The profit a company makes after deducting the costs associated with making and selling its products."
                        isLoading={loadingProfitSummary}
                        trendValue="+12.8%"
                        sparklineData={[5, 10, 15, 12, 18, 20, 25]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <ContextualKpiCard
                        title="Gross Margin"
                        value={formatPercentage(profitSummary?.gross_margin)}
                        icon={<TrendingUp color="info" />}
                        tooltipText="Gross Profit as a percentage of Net Revenue."
                        isLoading={loadingProfitSummary}
                        trendValue="-1.2%"
                        sparklineData={[30, 28, 29, 31, 30, 28, 27]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <QuotaAttainmentGauge
                        target={parseInt(salesTarget) || 50000000}
                        value={profitSummary?.total_revenue || 0}
                        isLoading={loadingProfitSummary}
                    />
                </Grid>

                {/* Combination Chart */}
                <Grid item xs={12}>
                    <CombinationChart
                        data={marginTrends || []}
                        barDataKey="total_revenue"
                        lineDataKey="margin"
                        xAxisDataKey="date"
                        barName="Total Revenue"
                        lineName="Gross Margin (%)"
                        isLoading={loadingMarginTrends}
                    />
                </Grid>

                {/* Donut Charts */}
                <Grid item xs={12} md={6}>
                    <DonutChart
                        data={revenueByProductLine || []}
                        dataKey="total_revenue"
                        nameKey="ProductLine"
                        title="Revenue by Product Line"
                        isLoading={loadingRevenueByProductLine}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DonutChart
                        data={revenueByBranch || []}
                        dataKey="total_revenue"
                        nameKey="Branch"
                        title="Revenue by Branch"
                        isLoading={loadingRevenueByBranch}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ExecutiveSummary;
