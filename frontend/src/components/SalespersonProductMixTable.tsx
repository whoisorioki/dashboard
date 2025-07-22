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
import { useSalespersonProductMixQuery } from "../queries/salespersonProductMix.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useMemo } from "react";
import ExpandableCard from "./ExpandableCard";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";

const getMarginColor = (margin: number | null | undefined) => {
  if (margin == null) return undefined;
  if (margin >= 0.3) return "#388e3c"; // green for high margin
  if (margin >= 0.15) return "#fbc02d"; // yellow for medium
  return "#d32f2f"; // red for low
};

const SalespersonProductMixTable: React.FC = () => {
  const { start_date, end_date, selected_branch, selected_product_line } = useFilters();
  const filters = useMemo(() => ({
    dateRange: { start: start_date, end: end_date },
    productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    branch: selected_branch !== "all" ? selected_branch : undefined,
  }), [start_date, end_date, selected_product_line, selected_branch]);
  const { data, isLoading, error } = useSalespersonProductMixQuery(
    graphqlClient,
    {
      startDate: start_date!,
      endDate: end_date!,
      branch: selected_branch !== "all" ? selected_branch : undefined,
      productLine: selected_product_line !== "all" ? selected_product_line : undefined,
    },
    {
      queryKey: queryKeys.salespersonProductMix ? queryKeys.salespersonProductMix(filters) : ["salespersonProductMix", filters],
    }
  );
  const rows = Array.isArray(data?.salespersonProductMix) ? data.salespersonProductMix : [];

  if (isLoading)
    return (
      <ExpandableCard title="Salesperson Product Mix & Avg Profit Margin" minHeight={300}>
        <ChartSkeleton />
      </ExpandableCard>
    );
  if (error)
    return (
      <ExpandableCard title="Salesperson Product Mix & Avg Profit Margin" minHeight={300}>
        <ChartEmptyState message="Error loading salesperson product mix." />
      </ExpandableCard>
    );

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This table shows each salesperson's product mix and their average profit margin for each product line.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Salesperson Product Mix & Avg Profit Margin" infoContent={infoContent} minHeight={300}>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Salesperson</TableCell>
              <TableCell>Product Line</TableCell>
              <TableCell>Avg Profit Margin (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${row.salesperson}-${row.productLine}-${idx}`}>
                <TableCell>{row.salesperson}</TableCell>
                <TableCell>{row.productLine}</TableCell>
                <TableCell style={{ color: getMarginColor(row.avgProfitMargin ?? 0) }}>
                  {row.avgProfitMargin != null
                    ? `${(row.avgProfitMargin * 100).toFixed(1)}%`
                    : "--"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ExpandableCard>
  );
};

export default SalespersonProductMixTable; 