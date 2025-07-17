import { Card, CardContent, Typography } from "@mui/material";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMarginTrendsQuery } from "../queries/marginTrends.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";

interface ProductPerformanceMatrixProps {
  startDate: string;
  endDate: string;
}

const ProductPerformanceMatrix: React.FC<ProductPerformanceMatrixProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading } = useMarginTrendsQuery(graphqlClient, {
    startDate,
    endDate,
  });

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
  return (
    <ChartCard title="Product Performance Matrix" isLoading={false}>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="category" dataKey="date" name="Date" />
          <YAxis type="number" dataKey="marginPct" name="Margin (%)" />
          <ZAxis
            type="number"
            dataKey="marginPct"
            name="Margin (%)"
            range={[100, 1000]}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter name="Margin Trends" data={chartData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ProductPerformanceMatrix;
