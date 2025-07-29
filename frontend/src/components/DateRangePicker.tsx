import { useState } from 'react';
import { DateRangePicker as RDRDateRangePicker, defaultStaticRanges, defaultInputRanges } from 'react-date-range';
import { Box, Stack, Typography } from '@mui/material';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onChange: (range: [Date | null, Date | null]) => void;
  onTimeChange?: (times: [Date | null, Date | null]) => void;
}

/**
 * DateRangePicker component using react-date-range and MUI TimePicker.
 *
 * Args:
 *   startDate (Date | null): The selected start date.
 *   endDate (Date | null): The selected end date.
 *   minDate (Date, optional): The minimum selectable date.
 *   maxDate (Date, optional): The maximum selectable date.
 *   onChange (([Date | null, Date | null]) => void): Callback for date range changes.
 *   onTimeChange (([Date | null, Date | null]) => void, optional): Callback for time changes.
 *
 * Returns:
 *   A styled react-date-range date range picker component with time selection.
 *
 * Example:
 *   <DateRangePicker startDate={start} endDate={end} onChange={setRange} onTimeChange={setTimes} />
 */
export default function DateRangePicker({ startDate, endDate, minDate, maxDate, onChange, onTimeChange }: DateRangePickerProps) {
  const [range, setRange] = useState({
    startDate: startDate || new Date(),
    endDate: endDate || new Date(),
    key: 'selection',
  });
  const [startTime, setStartTime] = useState<Dayjs | null>(startDate ? dayjs(startDate) : null);
  const [endTime, setEndTime] = useState<Dayjs | null>(endDate ? dayjs(endDate) : null);

  // Custom static ranges (presets)
  const customStaticRanges = [
    ...defaultStaticRanges,
    {
      label: 'Last 7 Days',
      range: () => ({
        startDate: dayjs().subtract(6, 'day').toDate(),
        endDate: new Date(),
      }),
    },
    {
      label: 'This Month',
      range: () => ({
        startDate: dayjs().startOf('month').toDate(),
        endDate: dayjs().endOf('month').toDate(),
      }),
    },
    {
      label: 'Fiscal Q1',
      range: () => ({
        startDate: new Date(new Date().getFullYear(), 6, 1), // July 1
        endDate: new Date(new Date().getFullYear(), 8, 30), // Sep 30
      }),
    },
  ];

  const handleRangeChange = (ranges: any) => {
    const sel = ranges.selection;
    setRange(sel);
    onChange([sel.startDate, sel.endDate]);
    if (onTimeChange) {
      onTimeChange([
        startTime ? sel.startDate && dayjs(sel.startDate).set('hour', startTime.hour()).set('minute', startTime.minute()).toDate() : sel.startDate,
        endTime ? sel.endDate && dayjs(sel.endDate).set('hour', endTime.hour()).set('minute', endTime.minute()).toDate() : sel.endDate,
      ]);
    }
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    setStartTime(value);
    if (onTimeChange && range.startDate) {
      onTimeChange([
        value ? dayjs(range.startDate).set('hour', value.hour()).set('minute', value.minute()).toDate() : range.startDate,
        endTime ? range.endDate && dayjs(range.endDate).set('hour', endTime.hour()).set('minute', endTime.minute()).toDate() : range.endDate,
      ]);
    }
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    setEndTime(value);
    if (onTimeChange && range.endDate) {
      onTimeChange([
        startTime ? range.startDate && dayjs(range.startDate).set('hour', startTime.hour()).set('minute', startTime.minute()).toDate() : range.startDate,
        value ? dayjs(range.endDate).set('hour', value.hour()).set('minute', value.minute()).toDate() : range.endDate,
      ]);
    }
  };

  return (
    <Box sx={{ background: '#23293a', borderRadius: 2, p: 2, minWidth: 280 }}>
      <RDRDateRangePicker
        ranges={[range]}
        onChange={handleRangeChange}
        minDate={minDate}
        maxDate={maxDate}
        staticRanges={customStaticRanges}
        inputRanges={defaultInputRanges}
        months={window.innerWidth < 600 ? 1 : 2}
        direction={window.innerWidth < 600 ? 'vertical' : 'horizontal'}
        showDateDisplay={false}
        rangeColors={['#1976d2']}
        weekdayDisplayFormat="E"
        monthDisplayFormat="MMM yyyy"
        moveRangeOnFirstSelection={false}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} mt={2} alignItems="center">
          <Typography variant="body2">Start Time:</Typography>
          <TimePicker
            value={startTime}
            onChange={handleStartTimeChange}
            ampm={false}
            sx={{ minWidth: 120 }}
          />
          <Typography variant="body2">End Time:</Typography>
          <TimePicker
            value={endTime}
            onChange={handleEndTimeChange}
            ampm={false}
            sx={{ minWidth: 120 }}
          />
        </Stack>
      </LocalizationProvider>
    </Box>
  );
}
