import { Card, CardContent, Typography } from "@mui/material";
import { useDashboardData } from "../queries/dashboardDataWrapper";
import { graphqlClient } from "../lib/graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";
import { useFilterStore } from "../store/filterStore";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";
import { format } from "date-fns";

const ReturnsAnalysis: React.FC = () => {
  const filterStore = useFilterStore();
  const startDate = filterStore.startDate;
  const endDate = filterStore.endDate;
  const selectedBranches = filterStore.selectedBranches;
  const selectedProductLines = filterStore.selectedProductLines;
  const selectedItemGroups = filterStore.selectedItemGroups;

  // Convert dates to strings for API calls
  const start_date = startDate ? format(startDate, 'yyyy-MM-dd') : null;
  const end_date = endDate ? format(endDate, 'yyyy-MM-dd') : null;
  const selected_branch = selectedBranches.length === 1 ? selectedBranches[0] : "all";
  const selected_product_line = selectedProductLines.length === 1 ? selectedProductLines[0] : "all";
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    branch: selected_branch !== "all" ? selected_branch : undefined,
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
  }), [start_date, end_date, selected_branch, selected_product_line, selectedItemGroups]);
  const { data, error, isLoading } = useDashboardData(
    graphqlClient,
    {
      startDate: start_date ?? undefined,
      endDate: end_date ?? undefined,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
      itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
    },
    {
      queryKey: queryKeys.returnsAnalysis ? queryKeys.returnsAnalysis(filters) : ["returnsAnalysis", filters],
    }
  );
  const returnsData = data?.returnsAnalysis ?? [];
  if (isLoading) {
    return (
      <ChartCard title="Returns Analysis" isLoading={true}>
        <ChartSkeleton />
      </ChartCard>
    );
  }
  if (error) {
    return (
      <ChartCard title="Returns Analysis" isLoading={false}>
        <ChartEmptyState
          isError
          message={
            error instanceof Error
              ? error.message
              : "Failed to load returns analysis."
          }
        />
      </ChartCard>
    );
  }
  if (!returnsData.length) {
    return (
      <ChartCard title="Returns Analysis" isLoading={false}>
        <ChartEmptyState message="No returns data available." />
      </ChartCard>
    );
  }

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = params[0];
        return `
          <div>
            <strong>${p.name}</strong><br/>
            Returns Count: ${p.value[1]}
          </div>
        `;
      },
    },
    legend: {
      data: ["Returns Count"],
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: "category",
      data: returnsData.map((d) => d.reason),
      name: "Reason",
    },
    yAxis: {
      type: "value",
      name: "Count",
      axisLabel: {
        formatter: (v: number) => v.toLocaleString(),
      },
    },
    series: [
      {
        name: "Returns Count",
        type: "bar",
        data: returnsData.map((d) => [d.reason, d.count]),
        itemStyle: { color: "#FF8042" },
        barGap: 0,
      },
    ],
  };

  return (
    <ChartCard title="Returns Analysis" isLoading={false}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};

export default ReturnsAnalysis;
