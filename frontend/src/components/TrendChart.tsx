import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useMonthlySalesGrowthQuery } from "../queries/monthlySalesGrowth.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";

interface TrendChartProps {
  chartTitle: string;
  yAxisLabel: string;
  startDate: string;
  endDate: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  chartTitle,
  yAxisLabel,
  startDate,
  endDate,
}) => {
  const { data, error, isLoading } = useMonthlySalesGrowthQuery(graphqlClient, {
    startDate,
    endDate,
  });

  const chartData = data?.monthlySalesGrowth ?? [];

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
  if (!chartData.length) {
    return (
      <ChartCard title={chartTitle} isLoading={false}>
        <ChartEmptyState message="No Data Available" />
      </ChartCard>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "14px",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
            {`Period: ${label}`}
          </p>
          <p style={{ margin: "0", color: "#1976d2" }}>
            {`${yAxisLabel}: ${payload[0].value?.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard title={chartTitle} isLoading={false}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
          />
          <RechartsTooltip content={CustomTooltip} />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#1976d2"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TrendChart;
