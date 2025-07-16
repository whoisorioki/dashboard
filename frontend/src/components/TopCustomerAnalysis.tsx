import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  HelpOutline as HelpOutlineIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import { useTopCustomersQuery } from "../queries/topCustomers.generated";
import { graphqlClient } from "../graphqlClient";
import ChartEmptyState from "./states/ChartEmptyState";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { ProductAnalyticsQuery } from "../queries/productAnalytics.generated";
import ChartCard from "./ChartCard";

interface TopCustomerAnalysisProps {
  startDate: string | null;
  endDate: string | null;
}

const TopCustomerAnalysis: React.FC<TopCustomerAnalysisProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading, refetch } = useTopCustomersQuery(
    graphqlClient,
    {
      startDate,
      endDate,
    }
  );

  if (isLoading) return <ChartSkeleton />;
  if (error)
    return (
      <ChartEmptyState
        isError
        message={
          error instanceof Error
            ? error.message
            : "Failed to load top customer analysis."
        }
        subtitle="An error occurred while loading top customer analysis. Please try again."
        onRetry={refetch}
      />
    );
  if (!data || data.length === 0)
    return <ChartEmptyState message="No customer data available." />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Customer Analysis
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total Revenue</TableCell>
                <TableCell align="right">Transactions</TableCell>
                <TableCell align="right">Avg. Purchase Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={`${row.cardName}-${index}`}>
                  <TableCell>{row.cardName}</TableCell>
                  <TableCell align="right">
                    ${row.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{row.transactionCount}</TableCell>
                  <TableCell align="right">
                    ${row.averagePurchaseValue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TopCustomerAnalysis;
