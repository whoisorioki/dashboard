import { Card, CardContent, Typography } from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useDynamicApi';
import CardSkeleton from './system/CardSkeleton';
import ErrorState from './system/ErrorState';
import EmptyState from './system/EmptyState';

interface ProductPerformanceMatrixProps {
    startDate: string | null;
    endDate: string | null;
}

const ProductPerformanceMatrix: React.FC<ProductPerformanceMatrixProps> = ({ startDate, endDate }) => {
    const { data, error, isLoading, mutate } = useApi<any[]>('/kpis/product-analytics', {
        start_date: startDate,
        end_date: endDate,
    });

    if (isLoading) return <CardSkeleton />;
    if (error) return <ErrorState errorMessage="Failed to load product performance matrix." onRetry={mutate} />;
    if (!data || data.length === 0) return <EmptyState message="No product data available." />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Product Performance Matrix
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="total_qty" name="Units Sold" />
                        <YAxis type="number" dataKey="gross_margin" name="Gross Margin (%)" />
                        <ZAxis type="number" dataKey="total_sales" name="Total Sales" range={[100, 1000]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Products" data={data} fill="#8884d8" />
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ProductPerformanceMatrix;
