import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import type { BranchProductHeatmap } from "../types/graphql";
import ReactECharts from "echarts-for-react";
import { formatKshAbbreviated } from "../lib/numberFormat";
import ExpandableCard from "./ExpandableCard";

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
      <ExpandableCard title="Branch-Product Sales Heatmap" minHeight={300}>
        <ChartSkeleton />
      </ExpandableCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ExpandableCard title="Branch-Product Sales Heatmap" minHeight={300}>
        <ChartEmptyState message="No heatmap data available." />
      </ExpandableCard>
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

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This heatmap shows sales volume by branch and product. Darker colors indicate higher sales.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Branch-Product Sales Heatmap" infoContent={infoContent} minHeight={300}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ExpandableCard>
  );
};
export default BranchProductHeatmap;
