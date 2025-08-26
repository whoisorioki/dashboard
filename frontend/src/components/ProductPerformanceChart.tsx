import { useState } from "react";
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
} from "@mui/material";
import { useDashboardData } from "../queries/dashboardDataWrapper";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";
import { formatKshAbbreviated } from "../lib/numberFormat";

interface ProductPerformanceChartProps {
  data: any[] | undefined;
  isLoading: boolean;
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({
  data = [],
  isLoading,
}) => {
  const [viewType, setViewType] = useState<"top" | "bottom">("top");
  const n = 5;

  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: "top" | "bottom"
  ) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };

  if (isLoading) {
    return (
      <ChartCard title="Product Performance" isLoading={true}>
        <Box sx={{ height: 300, width: '100%' }} />
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Product Performance" isLoading={false} empty={true}>
        <Box sx={{ height: 300, width: '100%' }} />
      </ChartCard>
    );
  }

  // Slice data for top/bottom 5
  const sortedData = [...data].sort((a, b) => b.sales - a.sales);
  const displayData =
    viewType === "top"
      ? sortedData.slice(0, n)
      : sortedData.slice(-n).reverse();

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = params[0];
        return `
          <div>
            <strong>Product: ${p.name}</strong><br/>
            Sales: ${formatKshAbbreviated(p.value[1])}
          </div>
        `;
      },
    },
    grid: { left: 100, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: "value",
      name: "Sales (KSh)",
      axisLabel: {
        formatter: (v: number) => formatKshAbbreviated(v),
      },
    },
    yAxis: {
      type: "category",
      data: displayData.map((d) => d.product),
      name: "Product",
      axisLabel: { width: 120, overflow: "truncate" },
    },
    series: [
      {
        name: "Sales",
        type: "bar",
        data: displayData.map((d) => [d.product, d.sales]),
        itemStyle: { color: viewType === "top" ? "#2e7d32" : "#d32f2f" },
        barWidth: 24,
      },
    ],
  };

  return (
    <ChartCard title="Product Performance" isLoading={false}>
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewTypeChange}
          aria-label="view type"
        >
          <ToggleButton value="top" aria-label="top performers">
            Top {n} Performers
          </ToggleButton>
          <ToggleButton value="bottom" aria-label="bottom performers">
            Bottom {n} Performers
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};

export default ProductPerformanceChart;
