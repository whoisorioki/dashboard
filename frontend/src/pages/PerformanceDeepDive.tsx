import { Box, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { Insights as InsightsIcon } from '@mui/icons-material';
import SalespersonLeaderboard from '../components/SalespersonLeaderboard';
import ProductPerformanceMatrix from '../components/ProductPerformanceMatrix';
import BranchProductHeatmap from '../components/BranchProductHeatmap';
import TopCustomerAnalysis from '../components/TopCustomerAnalysis';
import { useFilters } from '../context/FilterContext';

const PerformanceDeepDive = () => {
    const { startDate, endDate, selectedBranch, selectedProductLine } = useFilters();

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title="Performance Deep Dive"
                subtitle="Detailed analysis of sales and product performance"
                icon={<InsightsIcon />}
            />
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <SalespersonLeaderboard
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ProductPerformanceMatrix
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Grid>
                <Grid item xs={12}>
                    <BranchProductHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                        productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TopCustomerAnalysis
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PerformanceDeepDive;
