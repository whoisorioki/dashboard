import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useMediaQuery,
    useTheme as useMuiTheme,
    Divider,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFilters } from '../context/FilterContext';
import { useDataRange } from '../hooks/useDataRange';

const HeaderControls: React.FC = () => {
    const muiTheme = useMuiTheme();
    const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('lg'));
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

    const {
        dateRange,
        setDateRange,
        selectedBranch,
        setSelectedBranch,
        selectedProductLine,
        setSelectedProductLine,
    } = useFilters();

    const { minDate, maxDate } = useDataRange();

    const handleStartDateChange = (date: Date | null) => {
        setDateRange([date, dateRange[1]]);
    };

    const handleEndDateChange = (date: Date | null) => {
        setDateRange([dateRange[0], date]);
    };

    if (isMobile) {
        // On mobile, return a minimal version
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    Filters
                </Typography>
                <Divider orientation="vertical" flexItem />
                <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        displayEmpty
                        sx={{ '& .MuiSelect-select': { py: 0.5 } }}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="Nakuru">Nakuru</MenuItem>
                        <MenuItem value="Thika">Thika</MenuItem>
                        <MenuItem value="Nairobi">Nairobi</MenuItem>
                        <MenuItem value="Kiambu">Kiambu</MenuItem>
                        <MenuItem value="Eldoret">Eldoret</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
                minWidth: 0,
            }}
        >
            {/* Date Range Filters */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <DatePicker
                    label="Start Date"
                    value={dateRange[0]}
                    onChange={handleStartDateChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    slotProps={{
                        textField: {
                            size: 'small',
                            sx: {
                                minWidth: 140,
                                '& .MuiInputBase-input': {
                                    py: 1,
                                    fontSize: '0.875rem',
                                },
                            },
                        },
                    }}
                />
                <DatePicker
                    label="End Date"
                    value={dateRange[1]}
                    onChange={handleEndDateChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    slotProps={{
                        textField: {
                            size: 'small',
                            sx: {
                                minWidth: 140,
                                '& .MuiInputBase-input': {
                                    py: 1,
                                    fontSize: '0.875rem',
                                },
                            },
                        },
                    }}
                />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Business Context Filters */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel sx={{ fontSize: '0.875rem' }}>Branch</InputLabel>
                    <Select
                        value={selectedBranch}
                        label="Branch"
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        sx={{
                            '& .MuiSelect-select': {
                                py: 1,
                                fontSize: '0.875rem',
                            },
                        }}
                    >
                        <MenuItem value="all">All Branches</MenuItem>
                        <MenuItem value="Nakuru">Nakuru</MenuItem>
                        <MenuItem value="Thika">Thika</MenuItem>
                        <MenuItem value="Nairobi">Nairobi</MenuItem>
                        <MenuItem value="Kiambu">Kiambu</MenuItem>
                        <MenuItem value="Eldoret">Eldoret</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ fontSize: '0.875rem' }}>Product Line</InputLabel>
                    <Select
                        value={selectedProductLine}
                        label="Product Line"
                        onChange={(e) => setSelectedProductLine(e.target.value)}
                        sx={{
                            '& .MuiSelect-select': {
                                py: 1,
                                fontSize: '0.875rem',
                            },
                        }}
                    >
                        <MenuItem value="all">All Products</MenuItem>
                        <MenuItem value="TVS">TVS</MenuItem>
                        <MenuItem value="Piaggio">Piaggio</MenuItem>
                        <MenuItem value="Accessories">Accessories</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

export default HeaderControls;
