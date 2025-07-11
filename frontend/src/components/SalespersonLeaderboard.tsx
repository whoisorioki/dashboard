import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useApi } from '../hooks/useDynamicApi';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';

interface SalespersonLeaderboardProps {
    startDate: string | null;
    endDate: string | null;
}

const SalespersonLeaderboard: React.FC<SalespersonLeaderboardProps> = ({ startDate, endDate }) => {
    const { data, error, isLoading } = useApi<any[]>('/kpis/sales-performance', {
        start_date: startDate,
        end_date: endDate,
    });

    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage="Failed to load salesperson leaderboard." />;
    if (!data || data.length === 0) return <EmptyState message="No salesperson data available." />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Salesperson Leaderboard
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Salesperson</TableCell>
                                <TableCell align="right">Total Sales</TableCell>
                                <TableCell align="right">Avg. Deal Size</TableCell>
                                <TableCell align="right">Transactions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.SalesPerson}>
                                    <TableCell>{row.SalesPerson}</TableCell>
                                    <TableCell align="right">${row.total_sales.toLocaleString()}</TableCell>
                                    <TableCell align="right">${row.average_sale.toLocaleString()}</TableCell>
                                    <TableCell align="right">{row.transaction_count}</TableCell>
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
