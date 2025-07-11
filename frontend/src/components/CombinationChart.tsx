import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';

interface CombinationChartProps {
    data: any[];
    barDataKey: string;
    lineDataKey: string;
    xAxisDataKey: string;
    barName: string;
    lineName: string;
    isLoading: boolean;
    error?: string | null;
}

const CombinationChart: React.FC<CombinationChartProps> = ({
    data,
    barDataKey,
    lineDataKey,
    xAxisDataKey,
    barName,
    lineName,
    isLoading,
    error,
}) => {
    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage={error} />;
    if (!data || data.length === 0) return <EmptyState message="No data available." />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {barName} and {lineName}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisDataKey} />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey={barDataKey} fill="#8884d8" name={barName} />
                        <Line yAxisId="right" type="monotone" dataKey={lineDataKey} stroke="#82ca9d" name={lineName} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default CombinationChart;
