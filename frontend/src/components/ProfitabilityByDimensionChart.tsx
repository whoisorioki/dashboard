import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useDynamicApi';
import { useFilters } from '../context/FilterContext';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';
import { useState } from 'react';

interface ProfitabilityByDimensionChartProps {
    startDate: string | null;
    endDate: string | null;
}

const ProfitabilityByDimensionChart: React.FC<ProfitabilityByDimensionChartProps> = ({ startDate, endDate }) => {
    const [dimension, setDimension] = useState('Branch');
    const { data, error, isLoading, mutate } = useApi<any[]>(`/kpis/profitability-by-dimension`, {
        dimension: dimension,
        start_date: startDate,
        end_date: endDate,
    });

    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage="Failed to load profitability data." onRetry={mutate} />;
    if (!data || data.length === 0) return <EmptyState message="No profitability data available." />;

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Profitability by {dimension}</Typography>
                    <FormControl size="small">
                        <InputLabel>Dimension</InputLabel>
                        <Select value={dimension} label="Dimension" onChange={(e) => setDimension(e.target.value)}>
                            <MenuItem value="Branch">Branch</MenuItem>
                            <MenuItem value="ProductLine">Product Line</MenuItem>
                            <MenuItem value="ItemGroup">Item Group</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={dimension} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="gross_margin" fill="#8884d8" name="Gross Margin (%)" />
                        <Bar dataKey="gross_profit" fill="#82ca9d" name="Gross Profit ($)" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ProfitabilityByDimensionChart;
