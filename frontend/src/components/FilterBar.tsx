import React from "react";
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DateRangePicker from "./DateRangePicker";

interface FilterBarProps {
  startDate?: Date | null;
  endDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onDateRangeChange?: (range: [Date | null, Date | null]) => void;
  branch?: string;
  onBranchChange?: (branch: string) => void;
  branchOptions?: string[];
  productLine?: string;
  onProductLineChange?: (productLine: string) => void;
  productLineOptions?: string[];
  children?: React.ReactNode; // For contextual controls
}

const FilterBar: React.FC<FilterBarProps> = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  onDateRangeChange,
  branch,
  onBranchChange,
  branchOptions = [
    "All Branches",
    "Nakuru",
    "Thika",
    "Nairobi",
    "Kiambu",
    "Eldoret",
  ],
  productLine,
  onProductLineChange,
  productLineOptions = ["All Products", "TVS", "Piaggio", "Accessories"],
  children,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        width: "100%",
        px: { xs: 1, sm: 3, md: 4 },
        py: 1.5,
        mb: 2,
        bgcolor: "background.default",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        zIndex: 1100,
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {onDateRangeChange && (
        <DateRangePicker
          startDate={startDate || null}
          endDate={endDate || null}
          minDate={minDate}
          maxDate={maxDate}
          onChange={onDateRangeChange}
        />
      )}
      {onBranchChange && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Branch</InputLabel>
          <Select
            value={branch || "all"}
            label="Branch"
            onChange={(e) => onBranchChange(e.target.value)}
          >
            {branchOptions.map((b) => (
              <MenuItem key={b} value={b === "All Branches" ? "all" : b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {onProductLineChange && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Product Line</InputLabel>
          <Select
            value={productLine || "all"}
            label="Product Line"
            onChange={(e) => onProductLineChange(e.target.value)}
          >
            {productLineOptions.map((p) => (
              <MenuItem key={p} value={p === "All Products" ? "all" : p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {children}
    </Paper>
  );
};

export default FilterBar;
