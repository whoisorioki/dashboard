import { Box, FormControl, FormHelperText } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React, { useState } from "react";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onChange: (range: [Date | null, Date | null]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleStartChange = (date: Date | null) => {
    if (date && endDate && date > endDate) {
      setError("Start date cannot be after end date.");
      onChange([date, date]);
    } else {
      setError(null);
      onChange([date, endDate]);
    }
  };

  const handleEndChange = (date: Date | null) => {
    if (startDate && date && startDate > date) {
      setError("End date cannot be before start date.");
      onChange([date, date]);
    } else {
      setError(null);
      onChange([startDate, date]);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <FormControl error={!!error} size="small">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={handleStartChange}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{ textField: { size: "small" } }}
        />
      </FormControl>
      <FormControl error={!!error} size="small">
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={handleEndChange}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{ textField: { size: "small" } }}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default DateRangePicker;
