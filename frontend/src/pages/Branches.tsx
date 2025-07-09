import { useState } from 'react'
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    LinearProgress,
    Avatar,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    CircularProgress
} from '@mui/material'
import {
    Public as RegionIcon,
    TrendingUp as GrowthIcon,
    People as PeopleIcon,
    Store as StoreIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import BranchProductHeatmap from '../components/BranchProductHeatmap'
import { useFilters } from '../context/FilterContext'
import { useApi } from '../hooks/useDynamicApi'
import { BranchPerformanceData, BranchGrowthData } from '../types/api'

const Branches = () => {
    const {
        startDate,
        endDate,
        selectedBranch,
        selectedProductLine,
    } = useFilters();

    const [selectedMetric, setSelectedMetric] = useState<string>('sales')
    const [sortBy, setSortBy] = useState<string>('sales')

    // Fetch branch performance data from real API
    const {
        data: branchPerformanceData,
        error: branchError,
        isLoading: branchLoading
    } = useApi<BranchPerformanceData[]>('/kpis/branch-performance', {
        start_date: startDate,
        end_date: endDate,
        ...(selectedBranch !== 'all' && { branch: selectedBranch }),
        ...(selectedProductLine !== 'all' && { ProductLine: selectedProductLine })
    })

    // Fetch branch growth data from real API
    const {
        data: branchGrowthData,
        error: growthError,
        isLoading: growthLoading
    } = useApi<BranchGrowthData[]>('/kpis/branch-growth', {
        start_date: startDate,
        end_date: endDate,
        ...(selectedBranch !== 'all' && { branch: selectedBranch }),
        ...(selectedProductLine !== 'all' && { ProductLine: selectedProductLine })
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value)
    }

    const getPerformanceColor = (sales: number, target: number = 1000000) => {
        const percentage = (sales / target) * 100
        if (percentage >= 100) return 'success'
        if (percentage >= 80) return 'warning'
        return 'error'
    }

    const getGrowthColor = (growth: number) => {
        if (growth > 10) return 'success'
        if (growth > 0) return 'warning'
        return 'error'
    }

    // Calculate aggregate metrics from real data
    const totalSales = branchPerformanceData?.reduce((sum, branch) => sum + branch.total_sales, 0) || 0
    const totalTransactions = branchPerformanceData?.reduce((sum, branch) => sum + branch.transaction_count, 0) || 0
    const totalCustomers = branchPerformanceData?.reduce((sum, branch) => sum + branch.unique_customers, 0) || 0
    const totalProducts = branchPerformanceData?.reduce((sum, branch) => sum + branch.unique_products, 0) || 0

    // Calculate average growth from growth data
    const latestGrowthData = branchGrowthData?.reduce((acc, item) => {
        if (!acc[item.Branch] || item.month_year > acc[item.Branch].month_year) {
            acc[item.Branch] = item
        }
        return acc
    }, {} as Record<string, BranchGrowthData>)

    const averageGrowth = latestGrowthData
        ? Object.values(latestGrowthData).reduce((sum, item) => sum + item.growth_pct, 0) / Object.values(latestGrowthData).length
        : 0

    // Sort branches based on selected criteria
    const sortedBranches = branchPerformanceData ? [...branchPerformanceData].sort((a, b) => {
        switch (sortBy) {
            case 'sales': return b.total_sales - a.total_sales
            case 'transactions': return b.transaction_count - a.transaction_count
            case 'customers': return b.unique_customers - a.unique_customers
            case 'products': return b.unique_products - a.unique_products
            default: return 0
        }
    }) : []

    // Helper function to get latest growth for a branch
    const getBranchGrowth = (branchName: string): number => {
        if (!latestGrowthData || !latestGrowthData[branchName]) return 0
        return latestGrowthData[branchName].growth_pct
    }

    // Show loading state
    if (branchLoading || growthLoading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading branch data...</Typography>
            </Box>
        )
    }

    // Show error state
    if (branchError || growthError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Error loading branch data: {(branchError as Error)?.message || (growthError as Error)?.message}
                </Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 0, pl: { xs: 1.5, sm: 2 }, pr: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <PageHeader
                title="Branch Performance"
                subtitle="Kenya branch analysis and location insights"
                icon={<LocationIcon />}
            />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Controls */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Metric</InputLabel>
                            <Select
                                value={selectedMetric}
                                label="Metric"
                                onChange={(e) => setSelectedMetric(e.target.value)}
                            >
                                <MenuItem value="sales">Sales</MenuItem>
                                <MenuItem value="transactions">Transactions</MenuItem>
                                <MenuItem value="customers">Customers</MenuItem>
                                <MenuItem value="products">Products</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="sales">Sales</MenuItem>
                                <MenuItem value="transactions">Transactions</MenuItem>
                                <MenuItem value="customers">Customers</MenuItem>
                                <MenuItem value="products">Products</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Summary KPI Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Total Sales"
                        value={formatCurrency(totalSales)}
                        icon={<StoreIcon />}
                        tooltipText="Combined revenue across all branches for the selected period"
                        isLoading={branchLoading}
                        trend={averageGrowth >= 0 ? 'up' : 'down'}
                        trendValue={`${averageGrowth.toFixed(1)}%`}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Total Transactions"
                        value={formatNumber(totalTransactions)}
                        icon={<RegionIcon />}
                        tooltipText="Total number of transactions across all branches"
                        isLoading={branchLoading}
                        trend="up"
                        trendValue="All branches"
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Unique Customers"
                        value={formatNumber(totalCustomers)}
                        icon={<PeopleIcon />}
                        tooltipText="Number of unique customers/employees served"
                        isLoading={branchLoading}
                        trend="up"
                        trendValue="Active"
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Products Sold"
                        value={formatNumber(totalProducts)}
                        icon={<GrowthIcon />}
                        tooltipText="Unique products sold across all branches"
                        isLoading={branchLoading}
                        trend={averageGrowth >= 0 ? 'up' : 'down'}
                        trendValue={`${averageGrowth.toFixed(1)}% avg growth`}
                        color="warning"
                    />
                </Grid>

                {/* Branch Performance Table */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Branch Performance Overview
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Branch</TableCell>
                                            <TableCell align="right">Sales</TableCell>
                                            <TableCell align="right">Transactions</TableCell>
                                            <TableCell align="right">Avg. Sale</TableCell>
                                            <TableCell align="right">Customers</TableCell>
                                            <TableCell align="right">Growth</TableCell>
                                            <TableCell align="right">Performance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedBranches.map((branch, index) => {
                                            const growth = getBranchGrowth(branch.Branch)
                                            const target = 1000000 // Default target, could be made dynamic

                                            return (
                                                <TableRow
                                                    key={branch.Branch}
                                                    sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                                                {branch.Branch.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {branch.Branch}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Kenya
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {formatCurrency(branch.total_sales)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2">
                                                            {formatNumber(branch.transaction_count)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2">
                                                            {formatCurrency(branch.average_sale)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2">
                                                            {formatNumber(branch.unique_customers)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={`${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
                                                            color={getGrowthColor(growth)}
                                                            size="small"
                                                            variant="filled"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ width: '100%', mr: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min((branch.total_sales / target) * 100, 100)}
                                                                color={getPerformanceColor(branch.total_sales, target)}
                                                                sx={{ height: 8, borderRadius: 1 }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {((branch.total_sales / target) * 100).toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Branch Product Heatmap */}
                <Grid item xs={12} lg={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Product Performance by Branch
                            </Typography>
                            <BranchProductHeatmap
                                startDate={startDate}
                                endDate={endDate}
                                branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                                productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Additional Analytics Cards */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Performing Branches
                            </Typography>
                            <Stack spacing={2}>
                                {sortedBranches.slice(0, 5).map((branch, index) => (
                                    <Box key={branch.Branch} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                            {index + 1}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {branch.Branch}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatNumber(branch.transaction_count)} transactions
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatCurrency(branch.total_sales)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Branch Growth Summary
                            </Typography>
                            <Stack spacing={2}>
                                {sortedBranches.slice(0, 5).map((branch) => {
                                    const growth = getBranchGrowth(branch.Branch)
                                    return (
                                        <Box key={branch.Branch} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                {branch.Branch.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {branch.Branch}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatNumber(branch.unique_products)} products
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
                                                color={getGrowthColor(growth)}
                                                size="small"
                                                variant="filled"
                                            />
                                        </Box>
                                    )
                                })}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Branches
