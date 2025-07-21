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
import ReactECharts from "echarts-for-react";
import { MonthlySalesGrowth } from "../types/graphql";
import { formatKshAbbreviated } from "../lib/numberFormat";

interface MonthlySalesTrendChartProps {
  data: MonthlySalesGrowth[] | undefined;
  isLoading: boolean;
}

const MonthlySalesTrendChart: React.FC<MonthlySalesTrendChartProps> = ({
  data = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Monthly Sales Trend
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
            Monthly Sales Trend
          </Typography>
          <ChartEmptyState
            message="No Sales Data Available"
            subtitle="There are no sales records for the selected time period. Try adjusting your date range or check if data has been properly recorded."
          />
        </CardContent>
      </Card>
    );
  }

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const p = params[0];
        return `
          <div>
            <strong>Period: ${p.axisValue}</strong><br/>
            Sales Revenue: ${formatKshAbbreviated(p.data[1])}
          </div>
        `;
      },
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      name: "Date",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      name: "Sales (KSh)",
      axisLabel: {
        formatter: (v: number) => formatKshAbbreviated(v),
      },
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    series: [
      {
        name: "Sales",
        type: "line",
        data: data.map((d) => [d.date, d.sales]),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: "#1976d2" },
        itemStyle: { color: "#1976d2" },
        areaStyle: { color: "rgba(25, 118, 210, 0.08)" },
      },
    ],
  };

  return (
    <Card sx={{ position: "relative" }}>
      <Tooltip
        title="Line chart showing sales performance over time. Hover over data points to see detailed values for each period."
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
          Monthly Sales Trend
        </Typography>
        <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
      </CardContent>
    </Card>
  );
};

export default MonthlySalesTrendChart;
