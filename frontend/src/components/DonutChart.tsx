import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CardSkeleton from './system/CardSkeleton';
import EmptyState from './system/EmptyState';

interface DonutChartProps {
    data: any[];
    dataKey: string;
    nameKey: string;
    title: string;
    isLoading: boolean;
    error?: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DonutChart: React.FC<DonutChartProps> = ({
    data,
    dataKey,
    nameKey,
    title,
    isLoading,
    error,
}) => {
    if (isLoading) return <CardSkeleton />;
    if (error) return <Typography>Error: {error}</Typography>;
    if (!data || data.length === 0) return <EmptyState message="No data available." />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey={dataKey}
                            nameKey={nameKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default DonutChart;
