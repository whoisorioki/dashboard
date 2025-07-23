import { Box, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import TrendChart from '../components/TrendChart';
import ProfitabilityByDimensionChart from '../components/ProfitabilityByDimensionChart';
import { useFilters } from '../context/FilterContext';
import { useMarginTrendsQuery } from '../queries/marginTrends.generated';
import { graphqlClient } from '../lib/graphqlClient';
import DataStateWrapper from "../components/DataStateWrapper";

const ProfitabilityAnalysis = () => {
    const { start_date, end_date, selected_branch, selected_product_line } = useFilters();

    const { data, isLoading, error } = useMarginTrendsQuery(graphqlClient, {
        startDate: start_date || undefined,
        endDate: end_date || undefined,
        branch: selected_branch !== 'all' ? selected_branch : undefined,
        productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
    });

    return (
        <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
            <PageHeader
                title="Profitability Analysis"
                subtitle="Explore margins, costs, and profitability drivers"
                icon={<MonetizationOnIcon />}
            />
            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                    <DataStateWrapper isLoading={isLoading} error={error} data={data?.marginTrends} emptyMessage="No margin trend data available.">
                        <TrendChart
                            chartTitle="Margin Trend Analysis"
                            yAxisLabel="Gross Margin (%)"
                            dataKey="marginPct"
                            data={data?.marginTrends || []}
                            isLoading={false}
                        />
                    </DataStateWrapper>
                </Grid>
                <Grid item xs={12}>
                    {/* If ProfitabilityByDimensionChart supports isLoading/error/data, wrap it as well. Otherwise, leave as is or refactor as needed. */}
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
