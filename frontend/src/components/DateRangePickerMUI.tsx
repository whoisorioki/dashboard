import { useState, useRef } from 'react';
import {
    Box,
    TextField,
    Popover,
    Paper,
    Stack,
    Button,
    Chip,
    Typography,
    useTheme,
    alpha,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';

interface DateRangePickerMUIProps {
    startDate: Date | null;
    endDate: Date | null;
    minDate?: Date;
    maxDate?: Date;
    onChange: (range: [Date | null, Date | null]) => void;
}

const presetRanges = [
    {
        label: 'Today',
        getValue: () => {
            const today = new Date();
            return [today, today];
        },
    },
    {
        label: 'Yesterday',
        getValue: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return [yesterday, yesterday];
        },
    },
    {
        label: 'This Week',
        getValue: () => {
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            return [startOfWeek, endOfWeek];
        },
    },
    {
        label: 'This Month',
        getValue: () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return [startOfMonth, endOfMonth];
        },
    },
    {
        label: 'Last 30 Days',
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            return [start, end];
        },
    },
    {
        label: 'Last 90 Days',
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 90);
            return [start, end];
        },
    },
];

export default function DateRangePickerMUI({
    startDate,
    endDate,
    minDate,
    maxDate,
    onChange,
}: DateRangePickerMUIProps) {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Dayjs | null>(
        startDate ? dayjs(startDate) : null
    );
    const [tempEndDate, setTempEndDate] = useState<Dayjs | null>(
        endDate ? dayjs(endDate) : null
    );
    const anchorRef = useRef<HTMLDivElement>(null);

    const displayValue = startDate && endDate
        ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        : startDate
            ? `${format(startDate, 'dd/MM/yyyy')} - Select end date`
            : 'Select date range';

    const handleOpen = () => {
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
        onChange([newStartDate, newEndDate]);
        setIsOpen(false);
    };

    const handlePresetSelect = (preset: typeof presetRanges[0]) => {
        const [start, end] = preset.getValue();
        setTempStartDate(dayjs(start));
        setTempEndDate(dayjs(end));
    };

    const handleReset = () => {
        setTempStartDate(null);
        setTempEndDate(null);
    };

    const isValidRange = tempStartDate && tempEndDate && tempStartDate.isBefore(tempEndDate);
    const hasChanges =
        tempStartDate?.toDate()?.getTime() !== startDate?.getTime() ||
        tempEndDate?.toDate()?.getTime() !== endDate?.getTime();

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
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 2,
                                boxShadow: theme.shadows[8],
                                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                                minWidth: 400,
                                maxWidth: 500,
                            },
                        },
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        {/* Header */}
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                color: 'text.primary'
                            }}
                        >
                            Select Date Range
                        </Typography>

                        {/* Date Inputs */}
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
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            },
                                        },
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
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            },
                                        },
                                    },
                                }}
                            />
                        </Stack>

                        {/* Quick Presets */}
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 2,
                                fontWeight: 600,
                                color: 'text.secondary'
                            }}
                        >
                            Quick Select
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                mb: 3
                            }}
                        >
                            {presetRanges.map((preset, index) => (
                                <Chip
                                    key={index}
                                    label={preset.label}
                                    onClick={() => handlePresetSelect(preset)}
                                    sx={{
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                        color: theme.palette.primary.main,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                            borderColor: theme.palette.primary.main,
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Action Buttons */}
                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="flex-end"
                            sx={{
                                pt: 2,
                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                                disabled={!tempStartDate && !tempEndDate}
                                sx={{
                                    borderColor: alpha(theme.palette.text.secondary, 0.3),
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: theme.palette.text.secondary,
                                        backgroundColor: alpha(theme.palette.text.secondary, 0.04),
                                    },
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                sx={{
                                    borderColor: alpha(theme.palette.text.secondary, 0.3),
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: theme.palette.text.secondary,
                                        backgroundColor: alpha(theme.palette.text.secondary, 0.04),
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleApply}
                                disabled={!isValidRange && !hasChanges}
                                sx={{
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
                        </Stack>
                    </Box>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}
