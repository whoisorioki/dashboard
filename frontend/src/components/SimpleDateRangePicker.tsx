import { useState, useRef } from 'react';
import {
    Box,
    TextField,
    Popover,
    Stack,
    Button,
    Typography,
    useTheme,
    Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarMonth } from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

interface SimpleDateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    minDate?: Date;
    maxDate?: Date;
    onChange: (range: [Date | null, Date | null]) => void;
}

export default function SimpleDateRangePicker({
    startDate,
    endDate,
    minDate,
    maxDate,
    onChange,
}: SimpleDateRangePickerProps) {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Dayjs | null>(
        startDate ? dayjs(startDate) : null
    );
    const [tempEndDate, setTempEndDate] = useState<Dayjs | null>(
        endDate ? dayjs(endDate) : null
    );
    const anchorRef = useRef<HTMLDivElement>(null);

    // Display the selected date range
    const displayValue = startDate && endDate
        ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        : startDate
            ? `${format(startDate, 'dd/MM/yyyy')} - Select end date`
            : 'Select date range';

    // Show duration info
    const getDuration = () => {
        if (startDate && endDate) {
            const days = differenceInDays(endDate, startDate) + 1;
            return `${days} days`;
        }
        return '';
    };

    const handleOpen = () => {
        // Reset temp dates to current values
        setTempStartDate(startDate ? dayjs(startDate) : null);
        setTempEndDate(endDate ? dayjs(endDate) : null);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleApply = () => {
        const newStartDate = tempStartDate?.toDate() || null;
        const newEndDate = tempEndDate?.toDate() || null;
        
        console.log('📅 Simple Date Picker - Applying dates:', {
            start: newStartDate ? format(newStartDate, 'yyyy-MM-dd') : null,
            end: newEndDate ? format(newEndDate, 'yyyy-MM-dd') : null,
            duration: newStartDate && newEndDate ? differenceInDays(newEndDate, newStartDate) + 1 : 0
        });
        
        onChange([newStartDate, newEndDate]);
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempStartDate(null);
        setTempEndDate(null);
    };

    // Quick preset functions
    const handleQuickSelect = (preset: string) => {
        const today = new Date();
        let start: Date, end: Date;

        switch (preset) {
            case 'last7':
                end = new Date(today);
                start = new Date(today);
                start.setDate(start.getDate() - 6);
                break;
            case 'last30':
                end = new Date(today);
                start = new Date(today);
                start.setDate(start.getDate() - 29);
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'dec2024':
                // Default to December 2024 where we know data exists
                start = new Date(2024, 11, 1); // December 1, 2024
                end = new Date(2024, 11, 31); // December 31, 2024
                break;
            default:
                return;
        }

        // Respect min/max constraints
        if (minDate && start < minDate) start = new Date(minDate);
        if (maxDate && end > maxDate) end = new Date(maxDate);

        setTempStartDate(dayjs(start));
        setTempEndDate(dayjs(end));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                                    color: 'primary.main',
                                    fontSize: '1.2rem'
                                }}
                            />
                        ),
                    }}
                    sx={{
                        minWidth: 300,
                        cursor: 'pointer',
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: theme.palette.background.paper,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                                borderColor: theme.palette.primary.main,
                            },
                        },
                    }}
                />

                {/* Duration chip */}
                {startDate && endDate && (
                    <Chip
                        label={getDuration()}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                )}

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
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 2,
                                boxShadow: theme.shadows[8],
                                minWidth: 480,
                                maxWidth: 600,
                                p: 3,
                            },
                        },
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: 'primary.main'
                        }}
                    >
                        Select Date Range
                    </Typography>

                    {/* Quick Presets */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Quick Select
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickSelect('dec2024')}
                            sx={{ mb: 1 }}
                        >
                            Dec 2024 (Sample Data)
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickSelect('last7')}
                            sx={{ mb: 1 }}
                        >
                            Last 7 Days
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickSelect('last30')}
                            sx={{ mb: 1 }}
                        >
                            Last 30 Days
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickSelect('thisMonth')}
                            sx={{ mb: 1 }}
                        >
                            This Month
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickSelect('lastMonth')}
                            sx={{ mb: 1 }}
                        >
                            Last Month
                        </Button>
                    </Stack>

                    {/* Date Inputs */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Custom Range
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <DatePicker
                            label="Start Date"
                            value={tempStartDate}
                            onChange={setTempStartDate}
                            minDate={minDate ? dayjs(minDate) : undefined}
                            maxDate={tempEndDate || (maxDate ? dayjs(maxDate) : undefined)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                },
                            }}
                        />
                        <DatePicker
                            label="End Date"
                            value={tempEndDate}
                            onChange={setTempEndDate}
                            minDate={tempStartDate || (minDate ? dayjs(minDate) : undefined)}
                            maxDate={maxDate ? dayjs(maxDate) : undefined}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                },
                            }}
                        />
                    </Stack>

                    {/* Duration Display */}
                    {tempStartDate && tempEndDate && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Selected Duration: {differenceInDays(tempEndDate.toDate(), tempStartDate.toDate()) + 1} days
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Range: {format(tempStartDate.toDate(), 'MMM dd, yyyy')} to {format(tempEndDate.toDate(), 'MMM dd, yyyy')}
                            </Typography>
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                    >
                        <Button
                            variant="outlined"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                            disabled={!tempStartDate || !tempEndDate}
                        >
                            Apply
                        </Button>
                    </Stack>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}
