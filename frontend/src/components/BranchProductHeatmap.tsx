import {
  Box,
} from "@mui/material";
import type { BranchProductHeatmap } from "../types/dashboard";
import ReactECharts from "echarts-for-react";
import { formatKshAbbreviated } from "../lib/numberFormat";
import ChartCard from "./ChartCard";

interface BranchProductHeatmapProps {
  data: BranchProductHeatmap[] | undefined;
  isLoading: boolean;
}

const BranchProductHeatmap: React.FC<BranchProductHeatmapProps> = ({
  data = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <ChartCard title="Branch-Product Sales Heatmap" isLoading={true}>
        <Box sx={{ height: 300, width: '100%' }} />
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Branch-Product Sales Heatmap" isLoading={false} empty={true}>
        <Box sx={{ height: 300, width: '100%' }} />
      </ChartCard>
    );
  }

  // Color scale function
  const getColor = (value: number, max: number) => {
    const intensity = value / max;
    const red = Math.floor(255 * intensity);
    const green = Math.floor(255 * (1 - intensity));
    return `rgb(${red}, ${green}, 100)`;
  };

  const maxSales = Math.max(...data.map((d: any) => d.sales));

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const d = params.data;
        return `
          <div>
            <strong>Branch: ${d[0]}</strong><br/>
            Product: ${d[1]}<br/>
            Sales: ${formatKshAbbreviated(d[2])}
          </div>
        `;
      },
    },
    xAxis: {
      type: "category",
      name: "Branch",
      data: Array.from(new Set(data.map((d) => d.branch))),
      axisLabel: { rotate: 30 },
    },
    yAxis: {
      type: "category",
      name: "Product",
      data: Array.from(new Set(data.map((d) => d.product))),
      axisLabel: { width: 100, overflow: "truncate" },
    },
    grid: { left: 80, right: 30, top: 40, bottom: 40 },
    visualMap: {
      min: 0,
      max: maxSales,
      orient: "vertical",
      left: "right",
      top: "center",
      text: ["High", "Low"],
      inRange: {
        color: ["#e0ffe0", "#82ca9d", "#2e7d32", "#ff0000"],
      },
      calculable: true,
      itemHeight: 120,
    },
    series: [
      {
        name: "Sales",
        type: "scatter",
        symbolSize: 24,
        data: data.map((d) => [d.branch, d.product, d.sales]),
        itemStyle: {
          color: (params: any) => getColor(params.data[2], maxSales),
        },
      },
    ],
  };

  return (
    <ChartCard title="Branch-Product Sales Heatmap" isLoading={false}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};
export default BranchProductHeatmap;
