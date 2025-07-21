import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useProfitabilityByDimensionQuery } from "../queries/profitabilityByDimension.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { useFilters } from "../context/FilterContext";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import { useState } from "react";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";

interface ProfitabilityByDimensionChartProps {
  startDate: string | null;
  endDate: string | null;
}

const ProfitabilityByDimensionChart: React.FC<
  ProfitabilityByDimensionChartProps
> = ({ startDate, endDate }) => {
  const [dimension, setDimension] = useState("Branch");
  const { data, error, isLoading } = useProfitabilityByDimensionQuery(graphqlClient, {
    dimension,
    startDate,
    endDate,
  });
  const chartData = data?.profitabilityByDimension ?? [];

  if (isLoading) {
    return (
      <ChartCard title={`Profitability by ${dimension}`} isLoading={true}>
        <ChartSkeleton />
      </ChartCard>
    );
  }
  if (error) {
    return (
      <ChartCard title={`Profitability by ${dimension}`} isLoading={false}>
        <ChartEmptyState
          isError
          message={
            error instanceof Error
              ? error.message
              : "Failed to load profitability data."
          }
        />
      </ChartCard>
    );
  }
  if (!chartData.length) {
    return (
      <ChartCard title={`Profitability by ${dimension}`} isLoading={false}>
        <ChartEmptyState message="No profitability data available." />
      </ChartCard>
    );
  }

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const margin = params.find((p: any) => p.seriesName === "Gross Margin (%)");
        const profit = params.find((p: any) => p.seriesName === "Gross Profit (KSh)");
        return `
          <div>
            <strong>${params[0].name}</strong><br/>
            Gross Margin: ${(margin?.value[1] * 100).toFixed(1)}%<br/>
            Gross Profit: KSh ${Math.round(profit?.value[1] ?? 0).toLocaleString("en-KE")}
          </div>
        `;
      },
    },
    legend: {
      data: ["Gross Margin (%)", "Gross Profit (KSh)"]
    },
    grid: { left: 80, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: "category",
      data: chartData.map((d) => d[dimension.toLowerCase()]),
      name: dimension,
      axisLabel: { width: 120, overflow: "truncate" },
    },
    yAxis: [
      {
        type: "value",
        name: "Gross Margin (%)",
        min: 0,
        max: 1,
        axisLabel: {
          formatter: (v: number) => `${(v * 100).toFixed(0)}%`,
        },
      },
      {
        type: "value",
        name: "Gross Profit (KSh)",
        position: "right",
        axisLabel: {
          formatter: (v: number) => `KSh ${Math.round(v).toLocaleString("en-KE")}`,
        },
      },
    ],
    series: [
      {
        name: "Gross Margin (%)",
        type: "bar",
        data: chartData.map((d) => [d[dimension.toLowerCase()], d.grossMargin ?? 0]),
        yAxisIndex: 0,
        itemStyle: { color: "#8884d8" },
        barGap: 0,
      },
      {
        name: "Gross Profit (KSh)",
        type: "bar",
        data: chartData.map((d) => [d[dimension.toLowerCase()], d.grossProfit ?? 0]),
        yAxisIndex: 1,
        itemStyle: { color: "#82ca9d" },
      },
    ],
  };

  return (
    <ChartCard title={`Profitability by ${dimension}`} isLoading={false}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Profitability by {dimension}</Typography>
        <FormControl size="small">
          <InputLabel>Dimension</InputLabel>
          <Select
            value={dimension}
            label="Dimension"
            onChange={(e) => setDimension(e.target.value)}
          >
            <MenuItem value="Branch">Branch</MenuItem>
            <MenuItem value="ProductLine">Product Line</MenuItem>
            <MenuItem value="ItemGroup">Item Group</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};

export default ProfitabilityByDimensionChart;
