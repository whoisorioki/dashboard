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
    Avatar,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress
} from '@mui/material'
import {
    Inventory2 as InventoryIcon,
    TrendingUp as TrendingUpIcon,
    LocalOffer as PriceIcon,
    ShoppingCart as CartIcon,
    Inventory as ProductsIcon,
    Category as CategoryIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import ProductPerformanceChart from '../components/ProductPerformanceChart'
import { useFilters } from '../context/FilterContext'
import { useApi } from '../hooks/useDynamicApi'
import { ProductAnalyticsData, RevenueSummaryData } from '../types/api'

const Products = () => {
    const {
        startDate,
        endDate,
        selectedBranch,
        selectedProductLine,
    } = useFilters();

    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('total_sales')

    // Fetch product analytics data from real API
    const {
        data: productData,
        error: productError,
        isLoading: productLoading
    } = useApi<ProductAnalyticsData[]>('/kpis/product-analytics', {
        start_date: startDate,
        end_date: endDate,
        ...(selectedBranch !== 'all' && { branch: selectedBranch }),
        ...(selectedProductLine !== 'all' && { ProductLine: selectedProductLine })
    })

    // Fetch revenue summary data
    const {
        data: revenueSummary,
        error: revenueError,
        isLoading: revenueLoading
    } = useApi<RevenueSummaryData>('/kpis/revenue-summary', {
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

    const getPerformanceColor = (sales: number, avgSales: number) => {
        const ratio = sales / avgSales
        if (ratio >= 2) return 'success'
        if (ratio >= 1) return 'warning'
        return 'error'
    }

    // Filter and sort product data
    const filteredData = productData?.filter(product => {
        const categoryMatch = selectedCategory === 'all' || product.ItemGroup === selectedCategory
        // Note: selectedProductLine is now applied globally at API level
        return categoryMatch
    }) || []

    const sortedProductData = [...filteredData].sort((a, b) => {
        switch (sortBy) {
            case 'total_sales': return b.total_sales - a.total_sales
            case 'total_qty': return b.total_qty - a.total_qty
            case 'transaction_count': return b.transaction_count - a.transaction_count
            case 'average_price': return b.average_price - a.average_price
            default: return 0
        }
    })

    // Calculate metrics
    const totalProductSales = filteredData.reduce((sum, product) => sum + product.total_sales, 0)
    const totalQuantitySold = filteredData.reduce((sum, product) => sum + product.total_qty, 0)
    const avgProductSales = filteredData.length > 0 ? totalProductSales / filteredData.length : 0

    // Get unique categories and product lines for filters
    const uniqueCategories = [...new Set(productData?.map(p => p.ItemGroup) || [])]
    const uniqueProductLines = [...new Set(productData?.map(p => p.ProductLine) || [])]

    // Show loading state
    if (productLoading || revenueLoading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading product data...</Typography>
            </Box>
        )
    }

    // Show error state
    if (productError || revenueError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Error loading product data: {(productError as Error)?.message || (revenueError as Error)?.message}
                </Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 0, pl: { xs: 1.5, sm: 2 }, pr: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <PageHeader
                title="Product Analytics"
                subtitle="Product performance and inventory insights"
                icon={<ProductsIcon />}
            />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Controls */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={selectedCategory}
                                label="Category"
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {uniqueCategories.map(category => (
                                    <MenuItem key={category} value={category}>{category}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="total_sales">Total Sales</MenuItem>
                                <MenuItem value="total_qty">Quantity Sold</MenuItem>
                                <MenuItem value="transaction_count">Transactions</MenuItem>
                                <MenuItem value="average_price">Avg Price</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Summary KPI Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Total Products"
                        value={formatNumber(revenueSummary?.unique_products || 0)}
                        icon={<InventoryIcon />}
                        tooltipText="Total number of unique products"
                        isLoading={false}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Product Revenue"
                        value={formatCurrency(totalProductSales)}
                        icon={<PriceIcon />}
                        tooltipText="Total revenue from selected products"
                        isLoading={false}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Units Sold"
                        value={formatNumber(totalQuantitySold)}
                        icon={<CartIcon />}
                        tooltipText="Total quantity of products sold"
                        isLoading={false}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Avg Product Value"
                        value={formatCurrency(avgProductSales)}
                        icon={<TrendingUpIcon />}
                        tooltipText="Average sales value per product"
                        isLoading={false}
                        color="warning"
                    />
                </Grid>

                {/* Product Performance Chart */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Product Performance Chart
                            </Typography>
                            <ProductPerformanceChart
                                startDate={startDate}
                                endDate={endDate}
                                branch={selectedBranch !== 'all' ? selectedBranch : undefined}
                                productLine={selectedProductLine !== 'all' ? selectedProductLine : undefined}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Products Summary */}
                <Grid item xs={12} lg={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Selling Products
                            </Typography>
                            <Stack spacing={2}>
                                {sortedProductData.slice(0, 5).map((product, index) => (
                                    <Box key={product.ItemName} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                            {index + 1}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight="medium" noWrap>
                                                {product.ItemName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {product.ProductLine} • {formatNumber(product.total_qty)} units
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatCurrency(product.total_sales)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Product Analytics Table */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Product Performance Details
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Brand</TableCell>
                                            <TableCell align="right">Sales</TableCell>
                                            <TableCell align="right">Qty Sold</TableCell>
                                            <TableCell align="right">Avg Price</TableCell>
                                            <TableCell align="right">Transactions</TableCell>
                                            <TableCell align="right">Branches</TableCell>
                                            <TableCell align="center">Performance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedProductData.slice(0, 20).map((product) => (
                                            <TableRow
                                                key={product.ItemName}
                                                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    <Box sx={{ maxWidth: 300 }}>
                                                        <Typography variant="body2" fontWeight="medium" noWrap>
                                                            {product.ItemName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {product.ItemName}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={product.ItemGroup}
                                                        size="small"
                                                        color="secondary"
                                                        variant="outlined"
                                                        icon={<CategoryIcon fontSize="small" />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={product.ProductLine}
                                                        size="small"
                                                        color="primary"
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {formatCurrency(product.total_sales)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {formatNumber(product.total_qty)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {formatCurrency(product.average_price)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {formatNumber(product.transaction_count)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={product.unique_branches}
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={((product.total_sales / (avgProductSales || 1)) * 100).toFixed(0) + '%'}
                                                        size="small"
                                                        color={getPerformanceColor(product.total_sales, avgProductSales)}
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Products
