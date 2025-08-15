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
import { useDashboardData } from "../queries/dashboardData.generated";
import { SalesPerformance } from "../types/graphql";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";
import { useFilterStore } from "../store/filterStore";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";
import { format } from "date-fns";

const SalespersonLeaderboard: React.FC = () => {
  const filterStore = useFilterStore();
  const startDate = filterStore.startDate;
  const endDate = filterStore.endDate;
  const selectedBranches = filterStore.selectedBranches;
  const selectedProductLines = filterStore.selectedProductLines;
  const selectedItemGroups = filterStore.selectedItemGroups;

  // Convert dates to strings for API calls
  const start_date = startDate ? format(startDate, 'yyyy-MM-dd') : null;
  const end_date = endDate ? format(endDate, 'yyyy-MM-dd') : null;
  const selected_branch = selectedBranches.length === 1 ? selectedBranches[0] : "all";
  const selected_product_line = selectedProductLines.length === 1 ? selectedProductLines[0] : "all";
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    branch: selected_branch !== "all" ? selected_branch : undefined,
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
  }), [start_date, end_date, selected_branch, selected_product_line, selectedItemGroups]);

  const { data, isLoading, error } = useDashboardData(
    graphqlClient,
    {
      startDate: start_date!,
      endDate: end_date!,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
      itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
    },
    {
      queryKey: queryKeys.salesPerformance ? queryKeys.salesPerformance(filters) : ["salesPerformance", filters],
    }
  );
  const [sortMetric, setSortMetric] = useState<'totalSales' | 'grossProfit'>(
    'grossProfit'
  );
  const salespeople = Array.isArray((data as any)?.salesPerformance)
    ? [...(data as any).salesPerformance]
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
