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
  CircularProgress,
} from "@mui/material";
import { useDashboardData } from "../queries/dashboardData.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";

const CustomerValueTable: React.FC = () => {
  const { start_date, end_date, selected_branch, selected_product_line } = useFilters();
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    branch: selected_branch !== "all" ? selected_branch : undefined,
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
  }), [start_date, end_date, selected_branch, selected_product_line]);
  const { data, isLoading, error } = useDashboardData(
    graphqlClient,
    {
      startDate: start_date,
      endDate: end_date,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    },
    {
      queryKey: queryKeys.customerValue(filters),
    }
  );
  const customers = Array.isArray((data as any)?.dashboardData?.topCustomers)
    ? [...(data as any).dashboardData.topCustomers]
    : [];
  // Sort by grossProfit descending
  const sorted = customers.sort((a, b) => b.grossProfit - a.grossProfit);
  const topCustomers = sorted.slice(0, 5);

  if (isLoading)
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  if (error)
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography color="error">Error loading customer value.</Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Top Customers by Profitability
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Total Sales</TableCell>
                <TableCell>Gross Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topCustomers.map((row, index) => (
                <TableRow key={`${row.cardName}-${index}`}>
                  <TableCell>{row.cardName}</TableCell>
                  <TableCell>{formatKshAbbreviated(row.salesAmount)}</TableCell>
                  <TableCell>{formatKshAbbreviated(row.grossProfit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default CustomerValueTable;
