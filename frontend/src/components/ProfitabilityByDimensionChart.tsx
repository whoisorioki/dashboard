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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useProfitabilityByDimensionQuery } from "../queries/profitabilityByDimension.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { useFilters } from "../context/FilterContext";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import { useState } from "react";
import ChartCard from "./ChartCard";

interface ProfitabilityByDimensionChartProps {
  startDate: string | null;
  endDate: string | null;
}

const ProfitabilityByDimensionChart: React.FC<
  ProfitabilityByDimensionChartProps
> = ({ startDate, endDate }) => {
  const [dimension, setDimension] = useState("Branch");
  const { data, error, isLoading, refetch } = useProfitabilityByDimensionQuery(graphqlClient, {
    dimension,
    startDate,
    endDate,
  });

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
  if (!data || data.profitabilityByDimension.length === 0) {
    return (
      <ChartCard title={`Profitability by ${dimension}`} isLoading={false}>
        <ChartEmptyState message="No profitability data available." />
      </ChartCard>
    );
  }
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
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.profitabilityByDimension}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dimension} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="gross_margin" fill="#8884d8" name="Gross Margin (%)" />
          <Bar
            dataKey="gross_profit"
            fill="#82ca9d"
            name="Gross Profit (KSh)"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ProfitabilityByDimensionChart;
