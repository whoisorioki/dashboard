import React, { useMemo } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useDashboardData } from "../queries/dashboardDataWrapper";
import { graphqlClient } from "../lib/graphqlClient";
import { formatKshAbbreviated } from "../lib/numberFormat";
import { useFilterStore } from "../store/filterStore";
import { queryKeys } from "../lib/queryKeys";
import { format } from "date-fns";
import ChartCard from "./ChartCard";

const TopCustomerAnalysis: React.FC = () => {
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
  const { data, error, isLoading, refetch } = useDashboardData(
    graphqlClient,
    {
      startDate: start_date ?? undefined,
      endDate: end_date ?? undefined,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
      itemGroups: selectedItemGroups.length > 0 ? selectedItemGroups : undefined,
    },
    {
      queryKey: queryKeys.topCustomers ? queryKeys.topCustomers(filters) : ["topCustomers", filters],
    }
  );

  const customers = data?.topCustomers ?? [];

  if (isLoading) {
    return (
      <ChartCard title="Top Customer Analysis" isLoading={true}>
        <div />
      </ChartCard>
    );
  }

  if (error) {
    return (
      <ChartCard title="Top Customer Analysis" isLoading={false} error={error}>
        <div />
      </ChartCard>
    );
  }

  if (!customers.length) {
    return (
      <ChartCard title="Top Customer Analysis" isLoading={false} empty={true}>
        <div />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Top Customer Analysis" isLoading={false}>
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
    </ChartCard>
  );
};

export default TopCustomerAnalysis;
