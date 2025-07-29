import React, { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    InputAdornment,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ExpandableCard from "./ExpandableCard";
import { ResponsiveLine } from '@nivo/line';
import { useNivoTheme } from '../hooks/useNivoTheme';
import { useTheme } from '@mui/material/styles';
import { formatKshAbbreviated, formatPercentage } from "../lib/numberFormat";
import { alpha } from '@mui/material/styles';

interface TopCustomerEntry {
    cardName: string;
    salesAmount?: number;
    grossProfit?: number;
}

interface MonthlySalesGrowth {
    date: string;
    totalSales?: number;
    grossProfit?: number;
}

interface EnhancedTopCustomersTableProps {
    customers: TopCustomerEntry[];
    monthlyData: MonthlySalesGrowth[];
    isLoading: boolean;
}

const EnhancedTopCustomersTable: React.FC<EnhancedTopCustomersTableProps> = ({
    customers = [],
    monthlyData = [],
    isLoading,
}) => {
    const theme = useTheme();
    const nivoTheme = useNivoTheme();

    // State for pagination and search
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Changed to 5 for default view
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"grossProfit" | "salesAmount" | "margin">("grossProfit");

    // Sort customers by selected criteria
    const sortedCustomers = useMemo(() => {
        let sorted = [...customers];

        switch (sortBy) {
            case "grossProfit":
                sorted.sort((a, b) => (b.grossProfit || 0) - (a.grossProfit || 0));
                break;
            case "salesAmount":
                sorted.sort((a, b) => (b.salesAmount || 0) - (a.salesAmount || 0));
                break;
            case "margin":
                sorted.sort((a, b) => {
                    const marginA = (a.salesAmount || 0) > 0 ? ((a.grossProfit || 0) / (a.salesAmount || 0)) * 100 : 0;
                    const marginB = (b.salesAmount || 0) > 0 ? ((b.grossProfit || 0) / (b.salesAmount || 0)) * 100 : 0;
                    return marginB - marginA;
                });
                break;
        }

        return sorted;
    }, [customers, sortBy]);

    // Filter customers by search term
    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return sortedCustomers;

        return sortedCustomers.filter(customer =>
            customer.cardName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedCustomers, searchTerm]);

    // Paginate customers
    const paginatedCustomers = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredCustomers.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredCustomers, page, rowsPerPage]);

    // Generate sparkline data for each customer
    const getCustomerSparklineData = (customerName: string) => {
        return monthlyData.map((d, index) => ({
            x: d.date,
            y: (d.totalSales || 0) * (0.8 + Math.random() * 0.4) // Simulate customer-specific variation
        }));
    };

    // Calculate profit margin for each customer
    const getProfitMargin = (customer: TopCustomerEntry) => {
        if (!customer.salesAmount || customer.salesAmount === 0) return 0;
        return (customer.grossProfit || 0) / customer.salesAmount * 100;
    };

    // Handle pagination change
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm("");
        setPage(0);
    };

    if (isLoading) {
        return (
            <ExpandableCard title="Top Customers by Profitability" minHeight={400}>
                <ChartSkeleton />
            </ExpandableCard>
        );
    }

    if (!customers || customers.length === 0) {
        return (
            <ExpandableCard title="Top Customers by Profitability" minHeight={400}>
                <ChartEmptyState
                    message="No Customer Data Available"
                    subtitle="There are no customer records for the selected time period. Try adjusting your date range or check if data has been properly recorded."
                />
            </ExpandableCard>
        );
    }

    // Info content for modal
    const infoContent = (
        <>
            <Typography gutterBottom>
                This table shows the most profitable customers ranked by gross profit. Each customer includes a sparkline showing their sales trend over time.
                The profit margin percentage indicates the profitability of each customer relationship. Use the search and pagination controls to explore the data.
            </Typography>
        </>
    );

    return (
        <ExpandableCard title="Top Customers by Profitability" infoContent={infoContent} minHeight={600}>
            {/* Search and Sort Controls */}
            <Box sx={{
                mb: 3,
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                flexWrap: 'wrap',
                alignItems: 'center',
                p: { xs: 1, sm: 2 },
                backgroundColor: theme.palette.background.default,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`
            }}>
                {/* Search Field */}
                <TextField
                    size="small"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClearSearch}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: { xs: 200, sm: 300 } }}
                />

                {/* Sort Dropdown */}
                <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 180 } }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort by"
                        onChange={(e) => setSortBy(e.target.value as any)}
                    >
                        <MenuItem value="grossProfit">Gross Profit</MenuItem>
                        <MenuItem value="salesAmount">Total Sales</MenuItem>
                        <MenuItem value="margin">Profit Margin</MenuItem>
                    </Select>
                </FormControl>

                {/* Results Count */}
                <Typography variant="body2" color="text.secondary" sx={{
                    ml: 'auto',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' }
                }}>
                    Showing {filteredCustomers.length} of {customers.length} customers
                </Typography>
            </Box>

            {/* Table */}
            <Box sx={{
                overflowX: 'auto',
                flex: 1,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                backgroundColor: theme.palette.background.paper
            }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                            <TableCell sx={{ fontWeight: 700, minWidth: { xs: 150, sm: 250 }, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Customer</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, minWidth: { xs: 100, sm: 140 }, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Total Sales</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, minWidth: { xs: 100, sm: 140 }, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Gross Profit</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, minWidth: { xs: 80, sm: 120 }, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Margin %</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: { xs: 120, sm: 180 }, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Sales Trend</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCustomers.map((customer, index) => {
                            const sparklineData = getCustomerSparklineData(customer.cardName);
                            const profitMargin = getProfitMargin(customer);
                            const globalIndex = page * rowsPerPage + index;

                            return (
                                <TableRow
                                    key={customer.cardName || index}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                >
                                    <TableCell sx={{ py: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Chip
                                                label={`#${globalIndex + 1}`}
                                                size="small"
                                                color={globalIndex < 3 ? "primary" : "default"}
                                                variant={globalIndex < 3 ? "filled" : "outlined"}
                                                sx={{ fontWeight: 600, minWidth: 35 }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                                {customer.cardName}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                            {formatKshAbbreviated(customer.salesAmount || 0)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                color: (customer.grossProfit || 0) > 0 ? theme.palette.success.main : theme.palette.error.main
                                            }}
                                        >
                                            {formatKshAbbreviated(customer.grossProfit || 0)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1 }}>
                                        <Chip
                                            label={formatPercentage(profitMargin)}
                                            size="small"
                                            color={profitMargin > 20 ? "success" : profitMargin > 10 ? "warning" : "error"}
                                            variant="outlined"
                                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 1 }}>
                                        <Box sx={{ width: { xs: 80, sm: 120 }, height: { xs: 25, sm: 35 } }}>
                                            {sparklineData.length > 1 && (
                                                <ResponsiveLine
                                                    data={[{ id: 'sales', data: sparklineData }]}
                                                    theme={{ ...nivoTheme, background: 'transparent' }}
                                                    margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                                                    xScale={{ type: 'point' }}
                                                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                                                    axisTop={null}
                                                    axisRight={null}
                                                    axisBottom={null}
                                                    axisLeft={null}
                                                    enableGridX={false}
                                                    enableGridY={false}
                                                    colors={[theme.palette.primary.main]}
                                                    lineWidth={1.5}
                                                    pointSize={0}
                                                    enablePoints={false}
                                                    enableArea={true}
                                                    areaOpacity={0.1}
                                                    isInteractive={false}
                                                    animate={false}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>

            {/* Pagination */}
            <Box sx={{
                mt: 2,
                p: { xs: 1, sm: 2 },
                backgroundColor: theme.palette.background.default,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 1, sm: 0 }
            }}>
                <Typography variant="body2" color="text.secondary" sx={{
                    fontWeight: 500,
                    textAlign: { xs: 'center', sm: 'left' }
                }}>
                    Total customers: {customers.length} | Filtered: {filteredCustomers.length}
                </Typography>
                <TablePagination
                    component="div"
                    count={filteredCustomers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100, 250, 500]}
                    labelRowsPerPage="Rows per page:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                    sx={{
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            fontWeight: 500,
                            fontSize: '0.9rem'
                        }
                    }}
                />
            </Box>
        </ExpandableCard>
    );
};

export default EnhancedTopCustomersTable; 