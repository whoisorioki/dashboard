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
      branchOptions={branchOptions}
      productLineOptions={productLineOptions}
    />
  );
};

export default ControlBar;
