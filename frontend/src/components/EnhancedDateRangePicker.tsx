import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Box,
    TextField,
    Popover,
    Stack,
    Button,
    Typography,
    useTheme,
    alpha,
    Alert,
    Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarMonth, CheckCircle, Warning } from '@mui/icons-material';
import { format, differenceInDays, isValid } from 'date-fns';

interface EnhancedDateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    minDate?: Date;
    maxDate?: Date;
    onChange: (range: [Date | null, Date | null]) => void;
}

export default function EnhancedDateRangePicker({
    startDate,
    endDate,
    minDate,
    maxDate,
    onChange,
}: EnhancedDateRangePickerProps) {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Dayjs | null>(
        startDate ? dayjs(startDate) : null
    );
    const [tempEndDate, setTempEndDate] = useState<Dayjs | null>(
        endDate ? dayjs(endDate) : null
    );
    const [error, setError] = useState<string | null>(null);
    const anchorRef = useRef<HTMLDivElement>(null);

    // Sync with external changes
    useEffect(() => {
        setTempStartDate(startDate ? dayjs(startDate) : null);
        setTempEndDate(endDate ? dayjs(endDate) : null);
    }, [startDate, endDate]);

    // Validation
    const validateDateRange = (start: Dayjs | null, end: Dayjs | null): string | null => {
        if (!start && !end) return null;

        if (start && !end) return "Please select an end date";
        if (!start && end) return "Please select a start date";

        if (start && end && start.isAfter(end)) {
            return "Start date must be before end date";
        }

        if (minDate && start && start.isBefore(dayjs(minDate))) {
            return `Start date cannot be before ${format(minDate, 'dd/MM/yyyy')}`;
        }

        if (maxDate && end && end.isAfter(dayjs(maxDate))) {
            return `End date cannot be after ${format(maxDate, 'dd/MM/yyyy')}`;
        }

        return null;
    };

    const displayValue = useMemo(() => {
        if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
            const days = differenceInDays(endDate, startDate) + 1;
            return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')} (${days} days)`;
        }
        if (startDate && isValid(startDate)) {
            return `${format(startDate, 'dd/MM/yyyy')} - Select end date`;
        }
        return 'Select date range';
    }, [startDate, endDate]);

    const handleOpen = () => {
        setTempStartDate(startDate ? dayjs(startDate) : null);
        setTempEndDate(endDate ? dayjs(endDate) : null);
        setError(null);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setError(null);
    };

    const handleApply = () => {
        const validationError = validateDateRange(tempStartDate, tempEndDate);

        if (validationError) {
            setError(validationError);
            return;
        }

        const newStartDate = tempStartDate?.toDate() || null;
        const newEndDate = tempEndDate?.toDate() || null;

        console.log('🗓️ Applying date range:', {
            start: newStartDate,
            end: newEndDate,
            formatted: newStartDate && newEndDate ?
                `${format(newStartDate, 'yyyy-MM-dd')} to ${format(newEndDate, 'yyyy-MM-dd')}` :
                'incomplete'
        });

        onChange([newStartDate, newEndDate]);
        setIsOpen(false);
        setError(null);
    };

    const handleQuickSelect = (days: number) => {
        const today = new Date();
        let end = new Date(today);
        let start = new Date(today);

        // Adjust for data availability
        if (maxDate && today > maxDate) {
            end = new Date(maxDate);
        }

        start.setDate(end.getDate() - days + 1);

        if (minDate && start < minDate) {
            start = new Date(minDate);
        }

        setTempStartDate(dayjs(start));
        setTempEndDate(dayjs(end));
        setError(null);
    };

    const handlePreset = (preset: string) => {
        const today = new Date();
        let start: Date, end: Date;

        switch (preset) {
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'thisYear':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            case 'dataRange':
                if (minDate && maxDate) {
                    start = new Date(minDate);
                    end = new Date(maxDate);
                } else {
                    return;
                }
                break;
            default:
                return;
        }

        // Constrain to available data range
        if (minDate && start < minDate) start = new Date(minDate);
        if (maxDate && end > maxDate) end = new Date(maxDate);

        setTempStartDate(dayjs(start));
        setTempEndDate(dayjs(end));
        setError(null);
    };

    const isRangeComplete = tempStartDate && tempEndDate;
    const hasValidRange = isRangeComplete && !validateDateRange(tempStartDate, tempEndDate);

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
                                    color: hasValidRange ? 'success.main' : 'text.secondary',
                                    fontSize: '1.2rem'
                                }}
                            />
                        ),
                        endAdornment: hasValidRange ? (
                            <CheckCircle sx={{ color: 'success.main', fontSize: '1rem' }} />
                        ) : error ? (
                            <Warning sx={{ color: 'error.main', fontSize: '1rem' }} />
                        ) : null,
                    }}
                    sx={{
                        minWidth: 320,
                        cursor: 'pointer',
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: theme.palette.background.paper,
                            border: `2px solid ${hasValidRange
                                ? theme.palette.success.main
                                : error
                                    ? theme.palette.error.main
                                    : theme.palette.divider
                                }`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: alpha(
                                    hasValidRange
                                        ? theme.palette.success.main
                                        : theme.palette.primary.main,
                                    0.04
                                ),
                                borderColor: hasValidRange
                                    ? theme.palette.success.dark
                                    : theme.palette.primary.main,
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
                                p: 3,
                                minWidth: 400,
                                maxWidth: 500,
                            },
                        },
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Select Date Range
                        </Typography>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Data Range Info */}
                        {minDate && maxDate && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    Available data: {format(minDate, 'dd/MM/yyyy')} - {format(maxDate, 'dd/MM/yyyy')}
                                </Typography>
                            </Alert>
                        )}

                        {/* Date Pickers */}
                        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                            <DatePicker
                                label="Start Date"
                                value={tempStartDate}
                                onChange={(newValue) => {
                                    setTempStartDate(newValue);
                                    setError(null);
                                }}
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
                                onChange={(newValue) => {
                                    setTempEndDate(newValue);
                                    setError(null);
                                }}
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

                        {/* Quick Presets */}
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Quick Presets
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label="This Month"
                                onClick={() => handlePreset('thisMonth')}
                                variant="outlined"
                                size="small"
                            />
                            <Chip
                                label="Last Month"
                                onClick={() => handlePreset('lastMonth')}
                                variant="outlined"
                                size="small"
                            />
                            <Chip
                                label="This Year"
                                onClick={() => handlePreset('thisYear')}
                                variant="outlined"
                                size="small"
                            />
                            {minDate && maxDate && (
                                <Chip
                                    label="Full Data Range"
                                    onClick={() => handlePreset('dataRange')}
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                />
                            )}
                        </Stack>

                        {/* Quick Days */}
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Recent Days
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickSelect(7)}
                            >
                                Last 7 Days
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickSelect(30)}
                            >
                                Last 30 Days
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickSelect(90)}
                            >
                                Last 90 Days
                            </Button>
                        </Stack>

                        {/* Selection Summary */}
                        {isRangeComplete && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Selected Range:</strong><br />
                                    {tempStartDate?.format('DD/MM/YYYY')} - {tempEndDate?.format('DD/MM/YYYY')}<br />
                                    <strong>Duration:</strong> {tempEndDate?.diff(tempStartDate, 'day') + 1} days
                                </Typography>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleApply}
                                disabled={!isRangeComplete}
                                sx={{
                                    backgroundColor: hasValidRange
                                        ? theme.palette.success.main
                                        : theme.palette.action.disabledBackground,
                                    '&:hover': {
                                        backgroundColor: hasValidRange
                                            ? theme.palette.success.dark
                                            : theme.palette.action.disabledBackground,
                                    },
                                }}
                            >
                                Apply Range
                            </Button>
                        </Stack>
                    </Box>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}
