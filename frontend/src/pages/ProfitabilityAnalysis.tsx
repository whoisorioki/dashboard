import { Box, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import TrendChart from '../components/TrendChart';
import ProfitabilityByDimensionChart from '../components/ProfitabilityByDimensionChart';
import { useFilterStore } from "../store/filterStore";
import { useDashboardData } from '../queries/dashboardDataWrapper';
import { graphqlClient } from '../lib/graphqlClient';
import DataStateWrapper from "../components/DataStateWrapper";
import { format } from "date-fns";

const ProfitabilityAnalysis = () => {
    const filterStore = useFilterStore();
    const startDate = filterStore.startDate;
    const endDate = filterStore.endDate;
    const selectedBranches = filterStore.selectedBranches;
    const selectedProductLines = filterStore.selectedProductLines;
    const selectedItemGroups = filterStore.selectedItemGroups;

    // Convert dates to strings for API calls
    const start_date = startDate ? format(startDate, 'yyyy-MM-dd') : null;
    const end_date = endDate ? format(endDate, 'yyyy-MM-dd') : null;
    const selected_branch = selectedBranches.length === 1 ? selectedBranches[0] : "all";
    const selected_product_line = selectedProductLines.length === 1 ? selectedProductLines[0] : "all";
    // Default dimension for initial load
    const dimension = 'Branch';
    const { data, isLoading, error } = useDashboardData(
        graphqlClient,
        {
            startDate: start_date || undefined,
            endDate: end_date || undefined,
            branch: selected_branch !== 'all' ? selected_branch : undefined,
            productLine: selected_product_line !== 'all' ? selected_product_line : undefined,
            itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
            // dimension parameter not available in consolidated query
        }
    );

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
                    <ProfitabilityByDimensionChart
                        data={data?.profitabilityByDimension || []}
                        isLoading={isLoading}
                        error={error}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfitabilityAnalysis;
