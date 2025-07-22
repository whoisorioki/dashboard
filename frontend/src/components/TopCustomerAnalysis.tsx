import React, { useMemo } from "react";
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
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";

const TopCustomerAnalysis: React.FC = () => {
  const { start_date, end_date, selected_branch, selected_product_line } = useFilters();
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    branch: selected_branch !== "all" ? selected_branch : undefined,
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
  }), [start_date, end_date, selected_branch, selected_product_line]);
  const { data, error, isLoading, refetch } = useTopCustomersQuery(
    graphqlClient,
    {
      startDate: start_date ?? undefined,
      endDate: end_date ?? undefined,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    },
    {
      queryKey: queryKeys.topCustomers(filters),
    }
  );

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
