import { useState, useRef, useCallback, useEffect } from 'react';
import { Box, TextField, Popover, IconButton, Typography, Button } from '@mui/material';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import { addDays, format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

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
    label: 'Last Week',
    range: () => {
      const now = new Date();
      const startOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 7));
      const endOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 1));
      return {
        startDate: startOfLastWeek,
        endDate: endOfLastWeek,
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
    label: 'Last Month',
    range: () => {
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: startOfLastMonth,
        endDate: endOfLastMonth,
      };
    },
  },
  {
    label: 'Fiscal Q1',
    range: () => ({
      startDate: new Date(new Date().getFullYear(), 6, 1), // July 1
      endDate: new Date(new Date().getFullYear(), 8, 30), // Sep 30
    }),
  },
];

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onChange: (range: [Date | null, Date | null]) => void;
}

/**
 * Enhanced DateRangePicker component with truly independent month navigation.
 * 
 * This component provides complete control over calendar navigation, ensuring
 * that the custom navigation headers properly control the calendar display
 * without conflicts from the internal react-date-range navigation.
 *
 * Args:
 *   startDate (Date | null): The selected start date.
 *   endDate (Date | null): The selected end date.
 *   minDate (Date, optional): The minimum selectable date.
 *   maxDate (Date, optional): The maximum selectable date.
 *   onChange (([Date | null, Date | null]) => void): Callback for date range changes.
 *
 * Returns:
 *   A date range picker component with synchronized custom navigation.
 *
 * Example:
 *   <DateRangePicker startDate={start} endDate={end} onChange={setRange} />
 */
export default function DateRangePicker({ startDate, endDate, minDate, maxDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Initialize with current month and next month
  const currentDate = new Date();
  const [leftMonth, setLeftMonth] = useState(() => {
    if (startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  });
  const [rightMonth, setRightMonth] = useState(() => {
    if (endDate) return new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  });

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

  // Debug logging for state changes
  useEffect(() => {
    console.log('Selected range changed:', {
      selectedRange: selectedRange[0],
      hasChanges,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });
  }, [selectedRange, hasChanges, startDate, endDate]);

  // Sync state with props when they change
  useEffect(() => {
    if (startDate || endDate) {
      const newState = [{
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
        key: 'selection',
      }];
      setSelectedRange(newState);

      // Update month displays to match the new dates
      if (startDate) {
        const newLeftMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        setLeftMonth(newLeftMonth);
      }
      if (endDate) {
        const newRightMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        setRightMonth(newRightMonth);
      }

      // Reset changes flag since we're syncing with external changes
      // But only if the popover is not open to avoid interfering with user interaction
      if (!isOpen) {
        setHasChanges(false);
      }
    }
  }, [startDate, endDate, isOpen]);

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
    console.log('handleOnChange called with ranges:', ranges);
    const { selection } = ranges;

    // Always update the selected range
    setSelectedRange([selection]);

    // Simple change detection - compare with current props
    const newStartDate = selection.startDate;
    const newEndDate = selection.endDate;

    const startDateChanged = newStartDate?.getTime() !== startDate?.getTime();
    const endDateChanged = newEndDate?.getTime() !== endDate?.getTime();

    const hasUnsavedChanges = startDateChanged || endDateChanged;

    console.log('Change detection:', {
      newStart: newStartDate?.toISOString(),
      newEnd: newEndDate?.toISOString(),
      currentStart: startDate?.toISOString(),
      currentEnd: endDate?.toISOString(),
      startDateChanged,
      endDateChanged,
      hasChanges: hasUnsavedChanges
    });

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

    // Update month displays to match reset dates
    if (startDate) {
      setLeftMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }
    if (endDate) {
      setRightMonth(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    }

    setHasChanges(false);
  };

  // Independent month navigation handlers with proper constraints
  const handleLeftMonthChange = useCallback((direction: 'prev' | 'next') => {
    setLeftMonth(prev => {
      const newMonth = direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);

      // Ensure left month doesn't go beyond right month
      if (newMonth >= rightMonth) return prev;

      // Ensure left month doesn't go below minDate
      if (minDate && newMonth < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
        return prev;
      }

      return newMonth;
    });
  }, [rightMonth, minDate]);

  const handleRightMonthChange = useCallback((direction: 'prev' | 'next') => {
    setRightMonth(prev => {
      const newMonth = direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);

      // Ensure right month doesn't go below left month
      if (newMonth <= leftMonth) return prev;

      // Ensure right month doesn't go above maxDate
      if (maxDate && newMonth > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
        return prev;
      }

      return newMonth;
    });
  }, [leftMonth, maxDate]);

  // Format the display value for the TextField
  const displayValue =
    selectedRange[0].startDate && selectedRange[0].endDate
      ? `${format(selectedRange[0].startDate, 'dd/MM/yyyy')} ~ ${format(selectedRange[0].endDate, 'dd/MM/yyyy')}`
      : 'Select Date Range';

  return (
    <Box>
      <TextField
        ref={anchorRef}
        value={displayValue}
        onClick={handleOpen}
        InputProps={{ readOnly: true }}
        sx={{
          minWidth: 280,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover',
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
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Left Calendar */}
          <Box sx={{ minWidth: 280 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'action.hover'
            }}>
              <IconButton
                size="small"
                onClick={() => handleLeftMonthChange('prev')}
                disabled={minDate && leftMonth <= new Date(minDate.getFullYear(), minDate.getMonth(), 1)}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {format(leftMonth, 'MMM yyyy')}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleLeftMonthChange('next')}
                disabled={leftMonth >= rightMonth}
              >
                <ChevronRight />
              </IconButton>
            </Box>
            <DateRange
              onChange={handleOnChange}
              moveRangeOnFirstSelection={false}
              ranges={selectedRange}
              onRangeFocusChange={(focusedRange) => {
                console.log('Range focus changed:', focusedRange);
              }}
              months={1}
              direction="horizontal"
              staticRanges={[]}
              inputRanges={[]}
              rangeColors={['#1976d2']}
              minDate={minDate}
              maxDate={maxDate}
              showDateDisplay={false}
              weekdayDisplayFormat="E"
              monthDisplayFormat="MMM yyyy"
              month={leftMonth}
              onMonthChange={(newMonth) => {
                setLeftMonth(newMonth);
              }}
              showMonthAndYearPickers={false}
              showMonthArrow={false}
            />
          </Box>

          {/* Right Calendar */}
          <Box sx={{ minWidth: 280 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'action.hover'
            }}>
              <IconButton
                size="small"
                onClick={() => handleRightMonthChange('prev')}
                disabled={rightMonth <= leftMonth}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {format(rightMonth, 'MMM yyyy')}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleRightMonthChange('next')}
                disabled={maxDate && rightMonth >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)}
              >
                <ChevronRight />
              </IconButton>
            </Box>
            <DateRange
              onChange={handleOnChange}
              moveRangeOnFirstSelection={false}
              ranges={selectedRange}
              onRangeFocusChange={(focusedRange) => {
                console.log('Range focus changed:', focusedRange);
              }}
              months={1}
              direction="horizontal"
              staticRanges={[]}
              inputRanges={[]}
              rangeColors={['#1976d2']}
              minDate={minDate}
              maxDate={maxDate}
              showDateDisplay={false}
              weekdayDisplayFormat="E"
              monthDisplayFormat="MMM yyyy"
              month={rightMonth}
              onMonthChange={(newMonth) => {
                setRightMonth(newMonth);
              }}
              showMonthAndYearPickers={false}
              showMonthArrow={false}
            />
          </Box>
        </Box>

        {/* Static Ranges */}
        <Box sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1
        }}>
          {staticRanges.map((range, index) => (
            <Box
              key={index}
              onClick={() => {
                console.log('Preset button clicked:', range.label);
                const newRange = range.range();
                setSelectedRange([{
                  startDate: newRange.startDate,
                  endDate: newRange.endDate,
                  key: 'selection',
                }]);
                setHasChanges(true);
              }}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
                fontSize: '0.875rem',
              }}
            >
              {range.label}
            </Box>
          ))}
        </Box>

        {/* Apply and Reset Buttons */}
        <Box sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleReset}
            disabled={!hasChanges}
            sx={{ minWidth: 80 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleApply}
            disabled={!hasChanges}
            sx={{ minWidth: 80 }}
          >
            Apply
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
