import { Card, CardContent, Typography } from "@mui/material";
import { useReturnsAnalysisQuery } from "../queries/returnsAnalysis.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReturnsAnalysisProps {
  startDate: string | null;
  endDate: string | null;
}

// TODO: Replace useApi with useReturnsAnalysisQuery when available

const ReturnsAnalysis: React.FC<ReturnsAnalysisProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading } = useReturnsAnalysisQuery(graphqlClient, {
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
  });
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
  if (!data || data.length === 0) {
    return (
      <ChartCard title="Returns Analysis" isLoading={false}>
        <ChartEmptyState message="No returns data available." />
      </ChartCard>
    );
  }
  return (
    <ChartCard title="Returns Analysis" isLoading={false}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ItemName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="returns_value_pct"
            fill="#FF8042"
            name="Returns as % of Revenue"
          />
          <Bar
            dataKey="units_returned_pct"
            fill="#FFBB28"
            name="Returned Units as % of Sold"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ReturnsAnalysis;
