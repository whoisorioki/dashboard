import React from "react";
import FilterBar from "../FilterBar";
import { useFilters } from "../../context/FilterContext";
import { useBranchListQuery } from "../../queries/branchList.generated";
import { useProductAnalyticsQuery } from "../../queries/productAnalytics.generated";
import { graphqlClient } from "../../lib/graphqlClient";
import dayjs from "dayjs";

const ControlBar: React.FC = () => {
  const {
    date_range,
    setDateRange,
    selected_branch,
    setSelectedBranch,
    selected_product_line,
    setSelectedProductLine,
    start_date,
    end_date,
  } = useFilters();

  // Fetch dynamic branch options
  const { data: branchListData, isLoading: loadingBranches } = useBranchListQuery(graphqlClient, {
    startDate: start_date || undefined,
    endDate: end_date || undefined,
  });
  const branchOptions = [
    "All Branches",
    ...(branchListData?.branchList?.map((b) => b.branch) || []),
  ];

  // Fetch dynamic product line options
  const { data: productAnalyticsData, isLoading: loadingProducts } = useProductAnalyticsQuery(graphqlClient, {
    startDate: start_date || undefined,
    endDate: end_date || undefined,
  });
  const productLineSet = new Set<string>();
  productAnalyticsData?.productAnalytics?.forEach((p) => {
    if (p.productLine) productLineSet.add(p.productLine);
  });
  const productLineOptions = ["All Products", ...Array.from(productLineSet)];

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
