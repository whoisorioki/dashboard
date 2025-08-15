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
import ExpandableCard from "./ExpandableCard";
import { useDashboardData } from "../queries/dashboardData.generated";
import { ProductAnalytics } from "../types/graphql";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";

const ProductPerformanceTable: React.FC = () => {
  const { start_date, end_date, selected_branch, selected_product_line } = useFilters();
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    branch: selected_branch !== "all" ? selected_branch : undefined,
  }), [start_date, end_date, selected_product_line, selected_branch]);
  const { data, isLoading, error } = useDashboardData(
    graphqlClient,
    {
      startDate: start_date!,
      endDate: end_date!,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    },
    {
      queryKey: queryKeys.productAnalytics(filters),
    }
  );
  const [sortMetric, setSortMetric] = useState<'totalSales' | 'grossProfit'>(
    'grossProfit'
  );
  const products = Array.isArray(data?.productAnalytics)
    ? [...data.productAnalytics]
    : [];
  const sorted = products.sort((a, b) => {
    const aValue = a[sortMetric] ?? 0;
    const bValue = b[sortMetric] ?? 0;
    return bValue - aValue;
  });
  const topProducts = sorted.slice(0, 20);

  if (isLoading)
    return (
      <ExpandableCard title="Product Performance Table" minHeight={300}>
        <ChartSkeleton />
      </ExpandableCard>
    );
  if (error)
    return (
      <ExpandableCard title="Product Performance Table" minHeight={300}>
        <ChartEmptyState message="Error loading product analytics." />
      </ExpandableCard>
    );

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This table shows the top 20 products by sales or gross profit. Use the sort dropdown to change the metric.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Product Performance Table" infoContent={infoContent} minHeight={300}>
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
              <TableCell>Product</TableCell>
              <TableCell>Product Line</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Total Sales (KES)</TableCell>
              <TableCell>Gross Profit (KES)</TableCell>
              <TableCell>Quantity Sold</TableCell>
              <TableCell>Transactions</TableCell>
              <TableCell>Avg Price (KES)</TableCell>
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
                <TableCell>{formatKshAbbreviated(row.grossProfit ?? 0)}</TableCell>
                <TableCell>{row.totalQty.toLocaleString()}</TableCell>
                <TableCell>{row.transactionCount}</TableCell>
                <TableCell>{formatKshAbbreviated(row.averagePrice)}</TableCell>
                <TableCell>{row.uniqueBranches}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ExpandableCard>
  );
};

export default ProductPerformanceTable;
