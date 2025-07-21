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
import { useSalesPerformanceQuery } from "../queries/salesPerformance.generated";
import { SalesPerformance } from "../types/graphql";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";

const SalespersonLeaderboard: React.FC = () => {
  const { data, isLoading, error } = useSalesPerformanceQuery(graphqlClient, {});
  const salespeople = Array.isArray(data?.salesPerformance)
    ? [...data.salesPerformance]
    : [];
  const sorted = salespeople.sort((a, b) => b.totalSales - a.totalSales);

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
            Error loading salesperson leaderboard.
          </Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Salesperson Leaderboard
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Salesperson</TableCell>
                <TableCell>Total Sales</TableCell>
                <TableCell>Transactions</TableCell>
                <TableCell>Avg Sale</TableCell>
                <TableCell>Unique Branches</TableCell>
                <TableCell>Unique Products</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row, idx) => (
                <TableRow
                  key={`${row.salesPerson}-${idx}`}
                  sx={{ fontWeight: idx === 0 ? 700 : 400 }}
                >
                  <TableCell>{row.salesPerson}</TableCell>
                  <TableCell>{formatKshAbbreviated(row.totalSales)}</TableCell>
                  <TableCell>{row.transactionCount}</TableCell>
                  <TableCell>{formatKshAbbreviated(row.averageSale)}</TableCell>
                  <TableCell>{row.uniqueBranches}</TableCell>
                  <TableCell>{row.uniqueProducts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SalespersonLeaderboard;
