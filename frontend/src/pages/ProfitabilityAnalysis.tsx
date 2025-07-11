import { Box, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import TrendChart from '../components/TrendChart';
import ProfitabilityByDimensionChart from '../components/ProfitabilityByDimensionChart';
import ReturnsAnalysis from '../components/ReturnsAnalysis';
import { useFilters } from '../context/FilterContext';

const ProfitabilityAnalysis = () => {
    const { startDate, endDate, selectedBranch, selectedProductLine } = useFilters();

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title="Profitability Analysis"
                subtitle="Explore margins, costs, and profitability drivers"
                icon={<MonetizationOnIcon />}
            />
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TrendChart
                        endpoint="/kpis/margin-trends"
                        chartTitle="Margin Trend Analysis"
                        yAxisLabel="Gross Margin (%)"
                        dataKey="margin"
                        startDate={startDate}
                        endDate={endDate}
                        branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                        productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ProfitabilityByDimensionChart
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ReturnsAnalysis
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfitabilityAnalysis;
