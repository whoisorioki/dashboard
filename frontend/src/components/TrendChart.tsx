import { Card, CardContent, Typography, Box, Tooltip, IconButton } from '@mui/material'
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useApi } from '../hooks/useDynamicApi'
import CardSkeleton from './system/CardSkeleton'
import ErrorState from './system/ErrorState'
import EmptyState from './system/EmptyState'

interface TrendChartProps {
    endpoint: string;
    chartTitle: string;
    yAxisLabel: string;
    dataKey: string;
    startDate: string | null;
    endDate: string | null;
    branch?: string;
    productLine?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
    endpoint,
    chartTitle,
    yAxisLabel,
    dataKey,
    startDate,
    endDate,
    branch,
    productLine,
}) => {
    const { data, error, isLoading, mutate } = useApi<any[]>(endpoint, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        branch: branch || undefined,
        product_line: productLine || undefined,
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {chartTitle}
                    </Typography>
                    <CardSkeleton />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {chartTitle}
                    </Typography>
                    <ErrorState
                        errorMessage={`Failed to load data for ${chartTitle}`}
                        onRetry={mutate}
                    />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {chartTitle}
                    </Typography>
                    <EmptyState message="No Data Available" />
                </CardContent>
            </Card>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '14px'
                }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{`Period: ${label}`}</p>
                    <p style={{ margin: '0', color: '#1976d2' }}>{`${yAxisLabel}: ${payload[0].value?.toLocaleString()}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card sx={{ position: 'relative' }}>
            <Tooltip title={`Line chart showing ${chartTitle} over time.`} arrow>
                <IconButton
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1,
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {chartTitle}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip content={CustomTooltip} />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke="#1976d2"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default TrendChart;
