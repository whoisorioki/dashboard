import { useState, useRef } from 'react';
import {
    Box,
    TextField,
    Popover,
    useTheme,
    alpha,
    Stack,
    Button,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerPlusProps {
    startDate: Date | null;
    endDate: Date | null;
    minDate?: Date;
    maxDate?: Date;
    onChange: (range: [Date | null, Date | null]) => void;
}

export default function DateRangePickerPlus({
    startDate,
    endDate,
    minDate,
    maxDate,
    onChange,
}: DateRangePickerPlusProps) {
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
            : 'Select date range [PLUS VERSION]';

    const handleOpen = () => {
        setTempStartDate(startDate ? dayjs(startDate) : null);
        setTempEndDate(endDate ? dayjs(endDate) : null);
        setIsOpen(true);
    };
    const handleClose = () => setIsOpen(false);

    const handleApply = () => {
        const newStartDate = tempStartDate?.toDate() || null;
        const newEndDate = tempEndDate?.toDate() || null;
        onChange([newStartDate, newEndDate]);
        setIsOpen(false);
    };

    const handleQuickSelect = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
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
                                    color: 'primary.main', // Blue color to distinguish
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
                            border: `2px solid ${theme.palette.primary.main}`, // Blue border
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                borderColor: theme.palette.primary.dark,
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
                                border: `2px solid ${theme.palette.primary.main}`, // Blue border
                                minWidth: 400,
                                maxWidth: 500,
                            },
                        },
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                color: 'primary.main' // Blue text
                            }}
                        >
                            🔵 PLUS Date Range Picker
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

                        {/* Quick Presets */}
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 2, fontWeight: 600 }}
                        >
                            Quick Select
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickSelect(7)}
                                sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                            >
                                Last 7 Days
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickSelect(30)}
                                sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                            >
                                Last 30 Days
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickSelect(90)}
                                sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                            >
                                Last 90 Days
                            </Button>
                        </Stack>

                        {/* Action Buttons */}
                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="flex-end"
                        >
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
                    </Box>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}
