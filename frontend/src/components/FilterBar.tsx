import React from "react";
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import DateRangePicker from "./DateRangePicker";
import { useFilterStore } from "../store/filterStore";

/**
 * Global Filter Bar for the dashboard.
 *
 * Provides a consistent, global filter UI for date range, branches, product lines, and item groups.
 * Uses Zustand for state management and persists state to localStorage. Supports multi-select and chip display for all filters.
 *
 * Args:
 *   branchOptions (string[]): List of available branches.
 *   productLineOptions (string[]): List of available product lines.
 *   itemGroupOptions (string[]): List of available item groups.
 *
 * Returns:
 *   React component rendering the global filter bar.
 *
 * Example:
 *   <FilterBar branchOptions={...} productLineOptions={...} itemGroupOptions={...} />
 */
interface FilterBarProps {
  branchOptions?: string[];
  productLineOptions?: string[];
  itemGroupOptions?: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  branchOptions = [],
  productLineOptions = [],
  itemGroupOptions = [],
}) => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedBranches,
    setBranches,
    selectedProductLines,
    setProductLines,
    selectedItemGroups,
    setItemGroups,
    clearFilters,
  } = useFilterStore();

  // Helper for multi-select
  const handleMultiSelect = (
    value: string[] | string,
    setter: (v: string[]) => void
  ) => {
    setter(typeof value === "string" ? value.split(",") : value);
  };

  // Render chips for all active filters
  const renderChips = () => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
      {selectedBranches.map((b) => (
        <Chip
          key={"branch-" + b}
          label={b}
          onDelete={() => setBranches(selectedBranches.filter((x) => x !== b))}
          color="primary"
        />
      ))}
      {selectedProductLines.map((p) => (
        <Chip
          key={"pline-" + p}
          label={p}
          onDelete={() => setProductLines(selectedProductLines.filter((x) => x !== p))}
          color="secondary"
        />
      ))}
      {selectedItemGroups.map((g) => (
        <Chip
          key={"igroup-" + g}
          label={g}
          onDelete={() => setItemGroups(selectedItemGroups.filter((x) => x !== g))}
          color="success"
        />
      ))}
    </Stack>
  );

  // Handle date and time changes from the new DateRangePicker
  const handleDateRangeChange = ([start, end]: [Date | null, Date | null]) => {
    setStartDate(start);
    setEndDate(end);
  };
  const handleTimeChange = ([start, end]: [Date | null, Date | null]) => {
    setStartDate(start);
    setEndDate(end);
  };

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
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "100%", display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateRangeChange}
          onTimeChange={handleTimeChange}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Branches</InputLabel>
          <Select
            multiple
            value={selectedBranches}
            onChange={(e) => handleMultiSelect(e.target.value, setBranches)}
            input={<OutlinedInput label="Branches" />}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {branchOptions.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Product Lines</InputLabel>
          <Select
            multiple
            value={selectedProductLines}
            onChange={(e) => handleMultiSelect(e.target.value, setProductLines)}
            input={<OutlinedInput label="Product Lines" />}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {productLineOptions.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Item Groups</InputLabel>
          <Select
            multiple
            value={selectedItemGroups}
            onChange={(e) => handleMultiSelect(e.target.value, setItemGroups)}
            input={<OutlinedInput label="Item Groups" />}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {itemGroupOptions.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" color="error" onClick={clearFilters} sx={{ ml: 2 }}>
          Reset Filters
        </Button>
      </Box>
      {renderChips()}
    </Paper>
  );
};

export default FilterBar;
