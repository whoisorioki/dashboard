import React from 'react';
import {
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Button,
    Stack,
    Typography,
    IconButton,
} from '@mui/material';
import { DarkMode, LightMode, AccountCircle } from '@mui/icons-material';
import DateRangePicker from '../DateRangePicker';
import { useFilterStore } from '../../store/filterStore';
import { useTheme } from '../../context/ThemeContext';
import { useDashboardData } from '../../queries/dashboardData.generated';
import { format } from 'date-fns';
import { graphqlClient } from '../../lib/graphqlClient';

/**
 * MergedHeader component that combines the filter bar with theme toggle and user profile.
 *
 * This component serves as the topmost element in the dashboard, containing all filter controls
 * along with theme toggle and user profile functionality in a single, compact header.
 *
 * Args:
 *   None - uses context and store for state management.
 *
 * Returns:
 *   A Paper component containing the complete filter system with theme and user controls.
 *
 * Example:
 *   <MergedHeader />
 */
export default function MergedHeader() {
    const {
        startDate,
        endDate,
        selectedBranches,
        selectedProductLines,
        selectedItemGroups,
        setStartDate,
        setEndDate,
        setBranches,
        setProductLines,
        setItemGroups,
        clearFilters,
    } = useFilterStore();

    const { isDarkMode, toggleTheme } = useTheme();

    // Get dynamic filter options from dashboard data
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '2024-12-01';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '2024-12-31';

    const { data: dashboardDataResult } = useDashboardData(
        graphqlClient,
        {
            startDate: startDateStr,
            endDate: endDateStr,
        },
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );
    const dashboardData = dashboardDataResult;

    // Extract dynamic filter options
    const availableBranches = React.useMemo(() => {
        if (dashboardData?.branchList && Array.isArray(dashboardData.branchList)) {
            return dashboardData.branchList.map((b: any) => b.branch).filter(Boolean);
        }
        return [];
    }, [dashboardData]);

    const availableProductLines = React.useMemo(() => {
        if (dashboardData?.productAnalytics && Array.isArray(dashboardData.productAnalytics)) {
            return Array.from(new Set(dashboardData.productAnalytics.map((p: any) => p.productLine))).filter(Boolean);
        }
        return [];
    }, [dashboardData]);

    const availableItemGroups = React.useMemo(() => {
        if (dashboardData?.productAnalytics && Array.isArray(dashboardData.productAnalytics)) {
            return Array.from(new Set(dashboardData.productAnalytics.map((p: any) => p.itemGroup))).filter(Boolean);
        }
        return [];
    }, [dashboardData]);

    // Handle date changes from the DateRangePicker
    const handleDateRangeChange = ([start, end]: [Date | null, Date | null]) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handleMultiSelect = (
        event: any,
        setter: (value: string[]) => void,
        currentValue: string[]
    ) => {
        const {
            target: { value },
        } = event;
        setter(typeof value === 'string' ? value.split(',') : value);
    };

    const renderChips = (selected: string[]) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
            ))}
        </Box>
    );

    return (
        <Box
            sx={{
                width: "100%",
                bgcolor: "background.paper",
                borderBottom: (theme) =>
                    `1px solid ${theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(0, 0, 0, 0.12)"
                    }`,
                zIndex: 1200,
                position: "relative",
            }}
        >
            {/* Filter Section with Theme and User Controls */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 2, sm: 4, md: 6 },
                    py: 2,
                }}
            >
                {/* Left side - Filters */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                        flex: 1,
                    }}
                >
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateRangeChange}
                    />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Branches</InputLabel>
                        <Select
                            multiple
                            value={selectedBranches}
                            onChange={(e) => handleMultiSelect(e, setBranches, selectedBranches)}
                            input={<OutlinedInput label="Branches" />}
                            renderValue={renderChips}
                        >
                            {availableBranches.map((branch) => (
                                <MenuItem key={String(branch)} value={branch as string}>
                                    {String(branch)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Product Lines</InputLabel>
                        <Select
                            multiple
                            value={selectedProductLines}
                            onChange={(e) => handleMultiSelect(e, setProductLines, selectedProductLines)}
                            input={<OutlinedInput label="Product Lines" />}
                            renderValue={renderChips}
                        >
                            {availableProductLines.map((productLine) => (
                                <MenuItem key={String(productLine)} value={productLine as string}>
                                    {String(productLine)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Item Groups</InputLabel>
                        <Select
                            multiple
                            value={selectedItemGroups}
                            onChange={(e) => handleMultiSelect(e, setItemGroups, selectedItemGroups)}
                            input={<OutlinedInput label="Item Groups" />}
                            renderValue={renderChips}
                        >
                            {availableItemGroups.map((itemGroup) => (
                                <MenuItem key={String(itemGroup)} value={itemGroup as string}>
                                    {String(itemGroup)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={clearFilters}
                        sx={{ minWidth: 120 }}
                    >
                        Reset Filters
                    </Button>
                </Box>

                {/* Right side - Theme toggle and User profile */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {isDarkMode ? <LightMode /> : <DarkMode />}
                    </IconButton>
                    <IconButton color="inherit">
                        <AccountCircle />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
} 