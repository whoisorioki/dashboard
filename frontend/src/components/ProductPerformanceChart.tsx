import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import { ProductPerformanceQuery } from "../queries/productPerformance.generated";
import ChartCard from "./ChartCard";

interface ProductPerformanceChartProps {
  data: ProductPerformanceQuery["productPerformance"] | undefined;
  isLoading: boolean;
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({
  data = [],
  isLoading,
}) => {
  const [viewType, setViewType] = useState<"top" | "bottom">("top");
  const n = 5;

  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: "top" | "bottom"
  ) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };

  // Custom tooltip for better data presentation
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
          >{`Product: ${label}`}</p>
          <p
            style={{
              margin: "0",
              color: viewType === "top" ? "#2e7d32" : "#d32f2f",
            }}
          >
            {`Sales: KSh ${Math.round(payload[0].value).toLocaleString(
              "en-KE"
            )}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <ChartCard title="Product Performance" isLoading={true}>
        <ChartSkeleton />
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Product Performance" isLoading={false}>
        <ChartEmptyState
          isError={false}
          message="No Product Performance Data"
        />
      </ChartCard>
    );
  }

  // Slice data for top/bottom 5
  const sortedData = [...data].sort((a, b) => b.sales - a.sales);
  const displayData =
    viewType === "top"
      ? sortedData.slice(0, n)
      : sortedData.slice(-n).reverse();

  return (
    <Card sx={{ position: "relative" }}>
      <Tooltip
        title="Horizontal bar chart showing top or bottom performing products by sales. Use the toggle to switch between top 5 and bottom 5 performers."
        arrow
      >
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1,
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Product Performance</Typography>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={handleViewTypeChange}
            size="small"
          >
            <ToggleButton value="top">Top 5</ToggleButton>
            <ToggleButton value="bottom">Bottom 5</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={displayData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="product" type="category" width={100} />
            <RechartsTooltip content={CustomTooltip} />
            <Bar
              dataKey="sales"
              fill={viewType === "top" ? "#2e7d32" : "#d32f2f"}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceChart;
