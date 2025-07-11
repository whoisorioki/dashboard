import { Card, CardContent, Typography, Box, Tooltip, alpha, keyframes, IconButton } from '@mui/material';
import { HelpOutline as HelpOutlineIcon, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';

interface ContextualKpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    tooltipText: string;
    isLoading: boolean;
    error?: string | null;
    trendValue: string;
    sparklineData: number[];
    onRetry?: () => void;
}

const ContextualKpiCard: React.FC<ContextualKpiCardProps> = ({
    title,
    value,
    icon,
    tooltipText,
    isLoading,
    error,
    trendValue,
    sparklineData,
    onRetry,
}) => {
    const theme = useTheme();
    const trend = trendValue.startsWith('-') ? 'down' : 'up';

    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage={error} onRetry={onRetry || (() => { })} />;
    if (!value) return <EmptyState message="No data available." />;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" color="text.secondary">{title}</Typography>
                        <Typography variant="h4" fontWeight="bold">{value}</Typography>
                    </Box>
                    {icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography
                        variant="subtitle2"
                        color={trend === 'up' ? 'success.main' : 'error.main'}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        {trend === 'up' ? <TrendingUp sx={{ mr: 0.5 }} /> : <TrendingDown sx={{ mr: 0.5 }} />}
                        {trendValue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        vs. previous period
                    </Typography>
                </Box>
            </CardContent>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ height: 60, width: '100%' }}>
                <SparkLineChart
                    data={sparklineData}
                    color={trend === 'up' ? theme.palette.success.main : theme.palette.error.main}
                    sx={{
                        '.MuiLineElement-root': {
                            strokeWidth: 2,
                        },
                    }}
                />
            </Box>
        </Card>
    );
};

export default ContextualKpiCard;
