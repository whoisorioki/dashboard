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
import { ProductPerformanceQuery } from "../queries/productPerformance.generated";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";
import { formatKshAbbreviated } from "../lib/numberFormat";

interface ProductPerformanceChartProps {
  data: ProductPerformanceQuery["productPerformance"] | undefined;
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
        <ChartSkeleton />
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Product Performance" isLoading={false}>
        <ChartEmptyState
          isError={false}
          message="No Product Performance Data"
        />
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
    <Card sx={{ position: "relative" }}>
      <Tooltip
        title="Horizontal bar chart showing top or bottom performing products by sales. Use the toggle to switch between top 5 and bottom 5 performers."
        arrow
      >
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1,
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Product Performance</Typography>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={handleViewTypeChange}
            size="small"
          >
            <ToggleButton value="top">Top 5</ToggleButton>
            <ToggleButton value="bottom">Bottom 5</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceChart;
