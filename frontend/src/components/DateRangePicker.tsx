import { Box, FormControl, FormHelperText } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

interface DateRangePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  onChange: (range: [Dayjs | null, Dayjs | null]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleStartChange = (date: Dayjs | null) => {
    if (date && endDate && date.isAfter(endDate)) {
      setError("Start date cannot be after end date.");
      onChange([date, date]);
    } else {
      setError(null);
      onChange([date, endDate]);
    }
  };

  const handleEndChange = (date: Dayjs | null) => {
    if (startDate && date && startDate.isAfter(date)) {
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
          value={startDate ? dayjs(startDate) : null}
          onChange={handleStartChange}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{ textField: { size: "small" } }}
        />
      </FormControl>
      <FormControl error={!!error} size="small">
        <DatePicker
          label="End Date"
          value={endDate ? dayjs(endDate) : null}
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
