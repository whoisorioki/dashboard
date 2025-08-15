import { Card, CardContent, Typography } from "@mui/material";
import { useDashboardData } from "../queries/dashboardData.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";

interface ProductPerformanceMatrixProps {
  startDate: string;
  endDate: string;
}

const ProductPerformanceMatrix: React.FC<ProductPerformanceMatrixProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading } = useDashboardData(graphqlClient, { startDate, endDate });

  const chartData = data?.marginTrends ?? [];

  if (isLoading) {
    return (
      <ChartCard title="Product Performance Matrix" isLoading={true}>
        <ChartSkeleton />
      </ChartCard>
    );
  }
  if (error) {
    return (
      <ChartCard title="Product Performance Matrix" isLoading={false}>
        <ChartEmptyState
          isError
          message={
            error instanceof Error
              ? error.message
              : "Failed to load product performance matrix."
          }
        />
      </ChartCard>
    );
  }
  if (!chartData.length) {
    return (
      <ChartCard title="Product Performance Matrix" isLoading={false}>
        <ChartEmptyState message="No product data available." />
      </ChartCard>
    );
  }

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `
          <div>
            <strong>Date: ${params.data[0]}</strong><br/>
            Margin (%): ${(params.data[1] * 100).toFixed(2)}%
          </div>
        `;
      },
    },
    xAxis: {
      type: "category",
      name: "Date",
      data: chartData.map((d) => d.date),
    },
    yAxis: {
      type: "value",
      name: "Margin (%)",
      axisLabel: {
        formatter: (v: number) => `${(v * 100).toFixed(1)}%`,
      },
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    series: [
      {
        name: "Margin Trends",
        type: "scatter",
        data: chartData.map((d) => [d.date, d.marginPct]),
        symbolSize: 16,
        itemStyle: { color: "#8884d8" },
      },
    ],
  };

  return (
    <ChartCard title="Product Performance Matrix" isLoading={false}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};

export default ProductPerformanceMatrix;
