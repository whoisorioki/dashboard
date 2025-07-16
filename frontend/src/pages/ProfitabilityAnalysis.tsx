import { Box, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import TrendChart from '../components/TrendChart';
import ProfitabilityByDimensionChart from '../components/ProfitabilityByDimensionChart';
import { useFilters } from '../context/FilterContext';

const ProfitabilityAnalysis = () => {
    const { start_date, end_date, selected_branch, selected_product_line } = useFilters();

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
                        startDate={start_date}
                        endDate={end_date}
                        branch={selected_branch !== 'all' ? selected_branch : undefined}
                        productLine={selected_product_line !== 'all' ? selected_product_line : undefined}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ProfitabilityByDimensionChart
                        startDate={start_date}
                        endDate={end_date}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfitabilityAnalysis;
