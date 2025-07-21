import { Card, CardContent, Typography } from "@mui/material";
import { useReturnsAnalysisQuery } from "../queries/returnsAnalysis.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";
import ReactECharts from "echarts-for-react";

interface ReturnsAnalysisProps {
  startDate: string | null;
  endDate: string | null;
}

const ReturnsAnalysis: React.FC<ReturnsAnalysisProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading } = useReturnsAnalysisQuery(graphqlClient, {
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
  });
  const returnsData = data?.returnsAnalysis ?? [];
  if (isLoading) {
    return (
      <ChartCard title="Returns Analysis" isLoading={true}>
        <ChartSkeleton />
      </ChartCard>
    );
  }
  if (error) {
    return (
      <ChartCard title="Returns Analysis" isLoading={false}>
        <ChartEmptyState
          isError
          message={
            error instanceof Error
              ? error.message
              : "Failed to load returns analysis."
          }
        />
      </ChartCard>
    );
  }
  if (!returnsData.length) {
    return (
      <ChartCard title="Returns Analysis" isLoading={false}>
        <ChartEmptyState message="No returns data available." />
      </ChartCard>
    );
  }

  // Prepare ECharts option
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = params[0];
        return `
          <div>
            <strong>${p.name}</strong><br/>
            Returns Count: ${p.value[1]}
          </div>
        `;
      },
    },
    legend: {
      data: ["Returns Count"],
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: "category",
      data: returnsData.map((d) => d.reason),
      name: "Reason",
    },
    yAxis: {
      type: "value",
      name: "Count",
      axisLabel: {
        formatter: (v: number) => v.toLocaleString(),
      },
    },
    series: [
      {
        name: "Returns Count",
        type: "bar",
        data: returnsData.map((d) => [d.reason, d.count]),
        itemStyle: { color: "#FF8042" },
        barGap: 0,
      },
    ],
  };

  return (
    <ChartCard title="Returns Analysis" isLoading={false}>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
};

export default ReturnsAnalysis;
