import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useApi } from '../hooks/useDynamicApi';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';

interface TopCustomerAnalysisProps {
    startDate: string | null;
    endDate: string | null;
}

const TopCustomerAnalysis: React.FC<TopCustomerAnalysisProps> = ({ startDate, endDate }) => {
    const { data, error, isLoading, mutate } = useApi<any[]>('/kpis/top-customers', {
        start_date: startDate,
        end_date: endDate,
    });

    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage="Failed to load top customer analysis." onRetry={mutate} />;
    if (!data || data.length === 0) return <EmptyState message="No customer data available." />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Top Customer Analysis
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Customer</TableCell>
                                <TableCell align="right">Total Revenue</TableCell>
                                <TableCell align="right">Transactions</TableCell>
                                <TableCell align="right">Avg. Purchase Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.CardName}>
                                    <TableCell>{row.CardName}</TableCell>
                                    <TableCell align="right">${row.total_revenue.toLocaleString()}</TableCell>
                                    <TableCell align="right">{row.transaction_count}</TableCell>
                                    <TableCell align="right">${row.average_purchase_value.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default TopCustomerAnalysis;
