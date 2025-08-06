import { useState, useRef, useCallback, useEffect } from 'react';
import { Box, TextField, Popover, IconButton, Typography, Button, useTheme, alpha } from '@mui/material';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import { addDays, format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarMonth } from '@mui/icons-material';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../theme/dateRangePickerEnhanced.css'; // Import our enhanced styles

// Define static ranges for presets
const staticRanges = [
    {
        label: 'Today',
        range: () => ({
            startDate: new Date(),
            endDate: new Date(),
        }),
    },
    {
        label: 'Yesterday',
        range: () => ({
            startDate: addDays(new Date(), -1),
            endDate: addDays(new Date(), -1),
        }),
    },
    {
        label: 'This Week',
        range: () => {
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            return {
                startDate: startOfWeek,
                endDate: endOfWeek,
            };
        },
    },
    {
        label: 'This Month',
        range: () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
                startDate: startOfMonth,
                endDate: endOfMonth,
            };
        },
    },
    {
        label: 'Last 30 Days',
        range: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            return {
                startDate: start,
                endDate: end,
            };
        },
    },
    {
        label: 'Last 90 Days',
        range: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 90);
            return {
                startDate: start,
                endDate: end,
            };
        },
    },
];

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    minDate?: Date;
    maxDate?: Date;
    onChange: (range: [Date | null, Date | null]) => void;
}

export default function DateRangePickerEnhanced({
    startDate,
    endDate,
    minDate,
    maxDate,
    onChange
}: DateRangePickerProps) {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    // Simple state management
    const [selectedRange, setSelectedRange] = useState<Range[]>([
        {
            startDate: startDate || new Date(),
            endDate: endDate || new Date(),
            key: 'selection',
        },
    ]);

    // Track if there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);

    // Sync state with props when they change
    useEffect(() => {
        if (startDate || endDate) {
            const newState = [{
                startDate: startDate || new Date(),
                endDate: endDate || new Date(),
                key: 'selection',
            }];
            setSelectedRange(newState);

            // Reset changes flag since we're syncing with external changes
            if (!isOpen) {
                setHasChanges(false);
            }
        }
    }, [startDate, endDate, isOpen]);

    // Set CSS custom properties for theme integration
    useEffect(() => {
        const root = document.documentElement;

        // Set Material-UI theme variables as CSS custom properties
        root.style.setProperty('--mui-palette-background-paper', theme.palette.background.paper);
        root.style.setProperty('--mui-palette-background-default', theme.palette.background.default);
        root.style.setProperty('--mui-palette-text-primary', theme.palette.text.primary);
        root.style.setProperty('--mui-palette-text-secondary', theme.palette.text.secondary);
        root.style.setProperty('--mui-palette-text-disabled', theme.palette.text.disabled);
        root.style.setProperty('--mui-palette-primary-main', theme.palette.primary.main);
        root.style.setProperty('--mui-palette-primary-light', theme.palette.primary.light);
        root.style.setProperty('--mui-palette-primary-dark', theme.palette.primary.dark);
        root.style.setProperty('--mui-palette-primary-contrastText', theme.palette.primary.contrastText);
        root.style.setProperty('--mui-palette-secondary-main', theme.palette.secondary.main);
        root.style.setProperty('--mui-palette-divider', theme.palette.divider);
        root.style.setProperty('--mui-palette-action-hover', theme.palette.action.hover);
        root.style.setProperty('--mui-palette-action-selected', theme.palette.action.selected);
        root.style.setProperty('--mui-palette-action-disabledBackground', theme.palette.action.disabledBackground);
        root.style.setProperty('--mui-shadows-8', theme.shadows[8]);
        root.style.setProperty('--mui-typography-fontFamily', theme.typography.fontFamily);
    }, [theme]);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false);
        // Reset changes when closing without applying
        if (hasChanges) {
            setSelectedRange([{
                startDate: startDate || new Date(),
                endDate: endDate || new Date(),
                key: 'selection',
            }]);
            setHasChanges(false);
        }
    };

    const handleOnChange = (ranges: RangeKeyDict) => {
        const { selection } = ranges;
        setSelectedRange([selection]);

        // Simple change detection
        const newStartDate = selection.startDate;
        const newEndDate = selection.endDate;
        const startDateChanged = newStartDate?.getTime() !== startDate?.getTime();
        const endDateChanged = newEndDate?.getTime() !== endDate?.getTime();
        const hasUnsavedChanges = startDateChanged || endDateChanged;

        setHasChanges(hasUnsavedChanges);
    };

    // Apply button handler
    const handleApply = () => {
        onChange([selectedRange[0].startDate || null, selectedRange[0].endDate || null]);
        setHasChanges(false);
        setIsOpen(false);
    };

    // Reset button handler
    const handleReset = () => {
        const resetState = [{
            startDate: startDate || new Date(),
            endDate: endDate || new Date(),
            key: 'selection',
        }];
        setSelectedRange(resetState);
        setHasChanges(false);
    };

    // Format the display value for the TextField
    const displayValue =
        selectedRange[0].startDate && selectedRange[0].endDate
            ? `${format(selectedRange[0].startDate, 'dd/MM/yyyy')} - ${format(selectedRange[0].endDate, 'dd/MM/yyyy')}`
            : 'Select Date Range';

    return (
        <Box>
            <TextField
                ref={anchorRef}
                value={displayValue}
                onClick={handleOpen}
                placeholder="Select date range"
                InputProps={{
                    readOnly: true,
                    startAdornment: (
                        <CalendarMonth
                            sx={{
                                mr: 1,
                                color: 'text.secondary',
                                fontSize: '1.2rem'
                            }}
                        />
                    ),
                }}
                sx={{
                    minWidth: 280,
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.background.paper,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: theme.palette.primary.main,
                            transform: 'translateY(-1px)',
                            boxShadow: theme.shadows[2],
                        },
                        '&:focus-within': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                    },
                }}
            />

            <Popover
                open={isOpen}
                anchorEl={anchorRef.current}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            border: 'none',
                            borderRadius: 0,
                            overflow: 'visible',
                        },
                    },
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <DateRange
                        onChange={handleOnChange}
                        moveRangeOnFirstSelection={false}
                        ranges={selectedRange}
                        months={2}
                        direction="horizontal"
                        staticRanges={staticRanges.map(range => ({
                            label: range.label,
                            range: range.range,
                            isSelected: () => false,
                        }))}
                        inputRanges={[]}
                        rangeColors={[theme.palette.primary.main]}
                        minDate={minDate}
                        maxDate={maxDate}
                        showDateDisplay={false}
                        weekdayDisplayFormat="E"
                        monthDisplayFormat="MMM yyyy"
                        showMonthAndYearPickers={true}
                        showMonthArrow={true}
                    />

                    {/* Custom Apply/Reset Buttons */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: -60,
                        right: 16,
                        display: 'flex',
                        gap: 1,
                        background: theme.palette.background.paper,
                        padding: '8px 16px',
                        borderRadius: 2,
                        boxShadow: theme.shadows[4],
                        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleReset}
                            disabled={!hasChanges}
                            sx={{
                                minWidth: 70,
                                borderColor: alpha(theme.palette.text.secondary, 0.3),
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: theme.palette.text.secondary,
                                    backgroundColor: alpha(theme.palette.text.secondary, 0.04),
                                },
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleApply}
                            disabled={!hasChanges}
                            sx={{
                                minWidth: 70,
                                backgroundColor: theme.palette.primary.main,
                                boxShadow: theme.shadows[2],
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                    boxShadow: theme.shadows[4],
                                },
                                '&:disabled': {
                                    backgroundColor: alpha(theme.palette.text.disabled, 0.12),
                                    color: alpha(theme.palette.text.disabled, 0.3),
                                },
                            }}
                        >
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
}
