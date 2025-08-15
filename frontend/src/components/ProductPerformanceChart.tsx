import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import { useDashboardData } from "../queries/dashboardData.generated";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";
import { formatKshAbbreviated } from "../lib/numberFormat";
import ExpandableCard from "./ExpandableCard";

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
      <ExpandableCard title="Product Performance" minHeight={300}>
        <ChartSkeleton />
      </ExpandableCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ExpandableCard title="Product Performance" minHeight={300}>
        <ChartEmptyState
          message="No Product Performance Data"
          subtitle="There are no product performance records for the selected time period. Try adjusting your date range or check if data has been properly recorded."
        />
      </ExpandableCard>
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

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This bar chart shows the top and bottom performing products by sales. Hover over bars to see detailed values.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Product Performance" infoContent={infoContent} minHeight={300}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ExpandableCard>
  );
};

export default ProductPerformanceChart;
