import React from "react";
import FilterBar from "../FilterBar";
import { useFilters } from "../../context/FilterContext";
import dayjs from "dayjs";

interface ControlBarProps {
  branchOptions: string[];
  productLineOptions: string[];
}

const ControlBar: React.FC<ControlBarProps> = ({ branchOptions, productLineOptions }) => {
  const {
    date_range,
    setDateRange,
    selected_branch,
    setSelectedBranch,
    selected_product_line,
    setSelectedProductLine,
  } = useFilters();

  return (
    <FilterBar
      startDate={date_range[0] ? dayjs(date_range[0]) : null}
      endDate={date_range[1] ? dayjs(date_range[1]) : null}
      onDateRangeChange={setDateRange}
      branch={selected_branch || "all"}
      onBranchChange={setSelectedBranch}
      branchOptions={branchOptions}
      productLine={selected_product_line || "all"}
      onProductLineChange={setSelectedProductLine}
      productLineOptions={productLineOptions}
    />
  );
};

export default ControlBar;
