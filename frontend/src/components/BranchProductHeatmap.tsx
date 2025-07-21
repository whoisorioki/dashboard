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
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Branch-Product Sales Heatmap
          </Typography>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Branch-Product Sales Heatmap
          </Typography>
          <ChartEmptyState
            message="No Branch-Product Data Available"
            subtitle="There are no sales records by branch and product for the selected time period. Try adjusting your date range or ensure sales data is properly recorded across branches."
          />
        </CardContent>
      </Card>
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
    <Card sx={{ position: "relative" }}>
      <Tooltip
        title="Scatter plot visualization showing sales performance across different branches and products. Color intensity represents sales volume - darker colors indicate higher sales."
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
        <Typography variant="h5" gutterBottom>
          Branch-Product Sales Heatmap
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ReactECharts option={option} style={{ height: 300, width: "80%" }} />
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" gutterBottom>
              Sales Volume
            </Typography>
            <Box
              sx={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgb(255, 0, 100)",
                  }}
                />
                <Typography variant="caption">High</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgb(128, 128, 100)",
                  }}
                />
                <Typography variant="caption">Medium</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: "rgb(0, 255, 100)",
                  }}
                />
                <Typography variant="caption">Low</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default BranchProductHeatmap;
