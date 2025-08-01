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
                            <MenuItem value="Nairobi">Nairobi</MenuItem>
                            <MenuItem value="Mombasa">Mombasa</MenuItem>
                            <MenuItem value="Kisumu">Kisumu</MenuItem>
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
                            <MenuItem value="Electronics">Electronics</MenuItem>
                            <MenuItem value="Clothing">Clothing</MenuItem>
                            <MenuItem value="Home & Garden">Home & Garden</MenuItem>
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
                            <MenuItem value="Smartphones">Smartphones</MenuItem>
                            <MenuItem value="Laptops">Laptops</MenuItem>
                            <MenuItem value="Accessories">Accessories</MenuItem>
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