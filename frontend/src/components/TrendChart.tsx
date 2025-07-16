import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useApi } from "../hooks/useDynamicApi";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ChartCard from "./ChartCard";

interface TrendChartProps {
  endpoint: string;
  chartTitle: string;
  yAxisLabel: string;
  dataKey: string;
  startDate: string | null;
  endDate: string | null;
  branch?: string;
  productLine?: string;
}

// Utility to check for invalid/missing dates
function formatSafeDate(date: string | number | Date | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime()) || d.getFullYear() === 1970) return "N/A";
  return d.toLocaleDateString();
}

// TODO: Replace useApi with the correct generated GraphQL hook and use graphqlClient as the first argument.

const TrendChart: React.FC<TrendChartProps> = ({
  endpoint,
  chartTitle,
  yAxisLabel,
  dataKey,
  startDate,
  endDate,
  branch,
  productLine,
}) => {
  const { data, error, isLoading, refetch } = useApi<any[]>(endpoint, {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    branch: branch || undefined,
    product_line: productLine || undefined,
  });
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
  if (!data || data.length === 0) {
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
          <p
            style={{ margin: "0 0 4px 0", fontWeight: "bold" }}
          >{`Period: ${formatSafeDate(label)}`}</p>
          <p
            style={{ margin: "0", color: "#1976d2" }}
          >{`${yAxisLabel}: ${payload[0].value?.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };
  return (
    <ChartCard title={chartTitle} isLoading={false}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatSafeDate} />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
          />
          <RechartsTooltip content={CustomTooltip} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#1976d2"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TrendChart;
