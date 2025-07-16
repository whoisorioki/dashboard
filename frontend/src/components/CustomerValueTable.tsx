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
  CircularProgress,
} from "@mui/material";
import { useProductAnalyticsQuery } from "../queries/productAnalytics.generated";
import { ProductAnalytics } from "../types/graphql";
import { graphqlClient } from "../graphqlClient";

const CustomerValueTable: React.FC = () => {
  const { data, isLoading, error } = useProductAnalyticsQuery(
    graphqlClient,
    {}
  );
  const customers = Array.isArray(data?.productAnalytics)
    ? [...data.productAnalytics]
    : [];
  // Sort by grossProfit descending (if available), fallback to totalSales
  const sorted = customers.sort(
    (a, b) =>
      (b as any).grossProfit - (a as any).grossProfit ||
      b.totalSales - a.totalSales
  );
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
                <TableRow key={`${row.itemName}-${index}`}>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell>{row.totalSales.toLocaleString()}</TableCell>
                  <TableCell>
                    {(row as any).grossProfit?.toLocaleString() ?? "-"}
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

export default CustomerValueTable;
