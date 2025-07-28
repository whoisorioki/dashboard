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
} from "@mui/material";
import ExpandableCard from "./ExpandableCard";

const getMarginColor = (margin: number | null | undefined) => {
  if (margin == null) return undefined;
  if (margin >= 0.3) return "#388e3c"; // green for high margin
  if (margin >= 0.15) return "#fbc02d"; // yellow for medium
  return "#d32f2f"; // red for low
};

interface SalespersonProductMixTableProps {
  rows: Array<{
    salesperson: string;
    productLine: string;
    avgProfitMargin?: number | null;
  }>;
}

const SalespersonProductMixTable: React.FC<SalespersonProductMixTableProps> = ({ rows = [] }) => {
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