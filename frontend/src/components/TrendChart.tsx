import React from "react";
import ReactECharts from "echarts-for-react";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";
import { formatKshAbbreviated } from "../lib/numberFormat";

interface TrendChartProps {
  chartTitle: string;
  yAxisLabel: string;
  data: { date: string; [key: string]: any }[];
  dataKey: string;
  isLoading?: boolean;
  error?: unknown;
}

const TrendChart: React.FC<TrendChartProps> = ({
  chartTitle,
  yAxisLabel,
  data,
  dataKey,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <ChartCard title={chartTitle} isLoading={true}>
        <ChartSkeleton />
      </ChartCard>
    );
  }
  if (error) {
    return (
      <ChartCard title={chartTitle} isLoading={false}>
        <ChartEmptyState
          isError
          message={
            error instanceof Error
              ? error.message
              : "Failed to load trend data."
          }
        />
      </ChartCard>
    );
  }
  if (!data.length) {
    return (
      <ChartCard title={chartTitle} isLoading={false}>
        <ChartEmptyState message="No Data Available" />
      </ChartCard>
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
            ${yAxisLabel}: ${formatKshAbbreviated(p.data[1])}
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
      name: yAxisLabel,
      axisLabel: {
        formatter: (v: number) => formatKshAbbreviated(v),
      },
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    series: [
      {
        name: yAxisLabel,
        type: "line",
        data: data.map((d) => [d.date, d[dataKey]]),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: "#1976d2" },
        itemStyle: { color: "#1976d2" },
        areaStyle: { color: "rgba(25, 118, 210, 0.08)" },
      },
    ],
  };

  return (
    <ChartCard title={chartTitle} isLoading={false}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};

export default TrendChart;
