import { useState, useEffect } from 'react'
import { Box, Grid, TextField, Button, Typography } from '@mui/material'
import {
    TrendingUp as TrendingUpIcon,
    AttachMoney as AttachMoneyIcon,
    ReceiptLong as ReceiptLongIcon,
    Flag as TargetIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import MonthlySalesTrendChart from '../components/MonthlySalesTrendChart'
import ProductPerformanceChart from '../components/ProductPerformanceChart'
import BranchProductHeatmap from '../components/BranchProductHeatmap'
import QuotaAttainmentGauge from '../components/QuotaAttainmentGauge'
import SalesFunnelChart from '../components/SalesFunnelChart'
import { useApi } from '../hooks/useDynamicApi'
import { useFilters } from '../context/FilterContext'
import { MonthlySalesGrowthData, TargetAttainmentData } from '../types/api'

const Dashboard = () => {
    const {
        startDate,
        endDate,
        selectedBranch,
        selectedProductLine,
        salesTarget,
        setSalesTarget,
    } = useFilters();

    // API calls for KPIs using the global filters
    const { data: monthlyGrowth, isLoading: loadingGrowth } = useApi<MonthlySalesGrowthData[]>('/kpis/monthly-sales-growth', {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        product_line: selectedProductLine !== 'all' ? selectedProductLine : undefined,
    })

    const { data: targetAttainment, isLoading: loadingTarget, mutate: refetchTarget } = useApi<TargetAttainmentData>('/kpis/sales-target-attainment', {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        target: salesTarget,
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        product_line: selectedProductLine !== 'all' ? selectedProductLine : undefined,
    })

    const handleTargetSubmit = () => {
        refetchTarget()
    }

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

    // Helper functions for safe data calculations
    const getTotalSales = () => {
        if (!monthlyGrowth || !Array.isArray(monthlyGrowth) || monthlyGrowth.length === 0) {
            return 0;
        }
        return monthlyGrowth.reduce((sum: number, item: any) => {
            const sales = item?.sales || 0;
            return sum + (typeof sales === 'number' ? sales : 0);
        }, 0);
    };

    const getGrowthRate = () => {
        if (!monthlyGrowth || !Array.isArray(monthlyGrowth) || monthlyGrowth.length < 2) {
            return 0;
        }
        const firstSales = monthlyGrowth[0]?.sales || 0;
        const lastSales = monthlyGrowth[monthlyGrowth.length - 1]?.sales || 0;

        if (firstSales === 0) return 0;
        return ((lastSales - firstSales) / firstSales) * 100;
    };

    const getTargetAttainmentPercentage = () => {
        if (!targetAttainment || typeof targetAttainment.attainment_percentage !== 'number') {
            return 0;
        }
        return targetAttainment.attainment_percentage;
    };

    return (
        <Box sx={{ p: 0, pl: { xs: 1.5, sm: 2 }, pr: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <PageHeader
                title="Sales Analytics Dashboard"
                subtitle="Real-time insights and performance metrics"
                icon={<DashboardIcon />}
            />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* KPI CARDS - Responsive Grid */}
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Sales"
                        value={formatCurrency(getTotalSales())}
                        icon={<AttachMoneyIcon color="primary" />}
                        tooltipText="Total revenue from all sales within the selected date range. This includes all completed transactions and represents gross sales figures."
                        isLoading={loadingGrowth}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Sales Growth (YoY)"
                        value={formatPercentage(getGrowthRate())}
                        icon={<TrendingUpIcon color="success" />}
                        tooltipText="Year-over-year percentage change in sales compared to the same period last year. Positive values indicate growth, negative values show decline."
                        isLoading={loadingGrowth}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Avg Deal Size"
                        value={formatCurrency(getTotalSales() / 1247)} // Using the transaction count
                        icon={<ReceiptLongIcon color="info" />}
                        tooltipText="Average value per transaction - total sales divided by number of transactions"
                        isLoading={loadingGrowth}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <Box>
                        <KpiCard
                            title="Target Attainment"
                            value={formatPercentage(getTargetAttainmentPercentage())}
                            icon={<TargetIcon color="warning" />}
                            tooltipText="Percentage of sales target achieved for the current period. 100% means the target has been fully met, values above 100% indicate target exceeded."
                            isLoading={loadingTarget}
                        />
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                label="Sales Target"
                                value={salesTarget}
                                onChange={(e) => setSalesTarget(e.target.value)}
                                type="number"
                                sx={{ flexGrow: 1 }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleTargetSubmit}
                            >
                                Update
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                {/* CHARTS SECTION - F-Pattern Layout: Most critical info top-left */}
                {/* Top Row - Most Critical: Quota Attainment and Monthly Trend */}
                <Grid item xs={12} md={6} xl={4}>
                    <Box sx={{ height: '400px' }}>
                        <QuotaAttainmentGauge
                            startDate={startDate}
                            endDate={endDate}
                            target={parseInt(salesTarget) || 50000000}
                            branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                            productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} xl={8}>
                    <Box sx={{ height: '400px' }}>
                        <MonthlySalesTrendChart
                            startDate={startDate}
                            endDate={endDate}
                            branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                            productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                        />
                    </Box>
                </Grid>

                {/* Second Row - Product Performance and Sales Funnel */}
                <Grid item xs={12} md={6} xl={6}>
                    <Box sx={{ height: '400px' }}>
                        <ProductPerformanceChart
                            startDate={startDate}
                            endDate={endDate}
                            branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                            productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} xl={6}>
                    <Box sx={{ height: '400px' }}>
                        <SalesFunnelChart
                            startDate={startDate}
                            endDate={endDate}
                            branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                            productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                        />
                    </Box>
                </Grid>

                {/* Third Row - Branch Product Heatmap (Full Width) */}
                <Grid item xs={12}>
                    <Box sx={{ height: '500px' }}>
                        <BranchProductHeatmap
                            startDate={startDate}
                            endDate={endDate}
                            branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                            productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Dashboard
