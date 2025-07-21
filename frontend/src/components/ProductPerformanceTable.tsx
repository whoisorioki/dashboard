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
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";

const ProductPerformanceTable: React.FC = () => {
  const { data, isLoading, error } = useProductAnalyticsQuery(graphqlClient, {});
  const products = Array.isArray(data?.productAnalytics)
    ? [...data.productAnalytics]
    : [];
  const sorted = products.sort((a, b) => b.totalSales - a.totalSales);
  const topProducts = sorted.slice(0, 20);

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
          <Typography color="error">
            Error loading product analytics.
          </Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Product Performance
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Product Line</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Total Sales</TableCell>
                <TableCell>Quantity Sold</TableCell>
                <TableCell>Transactions</TableCell>
                <TableCell>Avg Price</TableCell>
                <TableCell>Branches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topProducts.map((row, index) => (
                <TableRow key={`${row.itemName}-${index}`}>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell>{row.productLine}</TableCell>
                  <TableCell>{row.itemGroup}</TableCell>
                  <TableCell>{formatKshAbbreviated(row.totalSales)}</TableCell>
                  <TableCell>{row.totalQty.toLocaleString()}</TableCell>
                  <TableCell>{row.transactionCount}</TableCell>
                  <TableCell>{formatKshAbbreviated(row.averagePrice)}</TableCell>
                  <TableCell>{row.uniqueBranches}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceTable;
