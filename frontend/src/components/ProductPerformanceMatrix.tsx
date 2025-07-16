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
import { useProductAnalyticsQuery } from "../queries/productAnalytics.generated";
import { graphqlClient } from "../graphqlClient";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";

interface ProductPerformanceMatrixProps {
  startDate: string | null;
  endDate: string | null;
}

const ProductPerformanceMatrix: React.FC<ProductPerformanceMatrixProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading, refetch } = useProductAnalyticsQuery(
    graphqlClient,
    {
      startDate,
      endDate,
    }
  );
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
  if (!data || data.productAnalytics.length === 0) {
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
          <XAxis type="number" dataKey="total_qty" name="Units Sold" />
          <YAxis type="number" dataKey="gross_margin" name="Gross Margin (%)" />
          <ZAxis
            type="number"
            dataKey="total_sales"
            name="Total Sales"
            range={[100, 1000]}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter
            name="Products"
            data={data.productAnalytics}
            fill="#8884d8"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ProductPerformanceMatrix;
