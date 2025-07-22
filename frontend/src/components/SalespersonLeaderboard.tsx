import React, { useState } from "react";
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
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";

const SalespersonLeaderboard: React.FC = () => {
  const { start_date, end_date } = useFilters();
  const filters = useMemo(() => ({ dateRange: { start: start_date, end: end_date } }), [start_date, end_date]);
  const { data, isLoading, error } = useSalesPerformanceQuery(
    graphqlClient,
    {
      startDate: start_date!,
      endDate: end_date!,
    },
    {
      queryKey: queryKeys.salesPerformance(filters),
    }
  );
  const [sortMetric, setSortMetric] = useState<'totalSales' | 'grossProfit'>(
    'grossProfit'
  );
  const salespeople = Array.isArray(data?.salesPerformance)
    ? [...data.salesPerformance]
    : [];
  const sorted = salespeople.sort((a, b) => {
    const aValue = a[sortMetric] ?? 0;
    const bValue = b[sortMetric] ?? 0;
    return bValue - aValue;
  });

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
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="sort-metric-select" style={{ marginRight: 8 }}>
            Sort by:
          </label>
          <select
            id="sort-metric-select"
            value={sortMetric}
            onChange={e => setSortMetric(e.target.value as 'totalSales' | 'grossProfit')}
            style={{ padding: '4px 8px', borderRadius: 4 }}
          >
            <option value="grossProfit">Gross Profit (KES)</option>
            <option value="totalSales">Total Sales (KES)</option>
          </select>
        </div>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Salesperson</TableCell>
                <TableCell>Total Sales (KES)</TableCell>
                <TableCell>Gross Profit (KES)</TableCell>
                <TableCell>Transactions</TableCell>
                <TableCell>Avg Sale (KES)</TableCell>
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
                  <TableCell>{formatKshAbbreviated(row.grossProfit ?? 0)}</TableCell>
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
