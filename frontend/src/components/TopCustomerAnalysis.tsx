import React from "react";
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import { useTopCustomersQuery } from "../queries/topCustomers.generated";
import { graphqlClient } from "../lib/graphqlClient";
import ChartEmptyState from "./states/ChartEmptyState";
import { formatKshAbbreviated } from "../lib/numberFormat";

interface TopCustomerAnalysisProps {
  startDate: string | null;
  endDate: string | null;
}

const TopCustomerAnalysis: React.FC<TopCustomerAnalysisProps> = ({
  startDate,
  endDate,
}) => {
  const { data, error, isLoading, refetch } = useTopCustomersQuery(graphqlClient, {
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
  });

  const customers = data?.topCustomers ?? [];

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
  if (!customers.length)
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
                <TableCell align="right">Total Sales</TableCell>
                <TableCell align="right">Gross Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((row, index) => (
                <TableRow key={`${row.cardName}-${index}`}>
                  <TableCell>{row.cardName}</TableCell>
                  <TableCell align="right">{formatKshAbbreviated(row.salesAmount)}</TableCell>
                  <TableCell align="right">{formatKshAbbreviated(row.grossProfit)}</TableCell>
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
