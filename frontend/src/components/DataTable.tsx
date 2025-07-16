import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import ChartSkeleton from './skeletons/ChartSkeleton';
import ChartEmptyState from './states/ChartEmptyState';

interface DataTableColumn {
  label: string;
  key: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  isLoading: boolean;
  error?: any;
  onRetry?: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, isLoading, error, onRetry }) => {
  if (isLoading) return <ChartSkeleton />;
  if (error) return (
    <ChartEmptyState
      isError
      message={error instanceof Error ? error.message : 'Failed to load data.'}
      subtitle="An error occurred while loading data. Please try again."
      onRetry={onRetry || (() => {})}
    />
  );
  if (!data || data.length === 0) return <ChartEmptyState message="No data available." />;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align || 'left'}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || 'left'}>
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable; 