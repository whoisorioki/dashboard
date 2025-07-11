import { Card, CardContent, Typography } from '@mui/material';
import { useApi } from '../hooks/useDynamicApi';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReturnsAnalysisProps {
    startDate: string | null;
    endDate: string | null;
}

const ReturnsAnalysis: React.FC<ReturnsAnalysisProps> = ({ startDate, endDate }) => {
    const { data, error, isLoading } = useApi<any[]>('/kpis/returns-analysis', {
        start_date: startDate,
        end_date: endDate,
    });

    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage="Failed to load returns analysis." />;
    if (!data || data.length === 0) return <EmptyState message="No returns data available." />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Returns Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ItemName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="returns_value_pct" fill="#FF8042" name="Returns as % of Revenue" />
                        <Bar dataKey="units_returned_pct" fill="#FFBB28" name="Returned Units as % of Sold" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ReturnsAnalysis;
