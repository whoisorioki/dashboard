import { Card, CardContent, Typography, Box, Tooltip, IconButton } from '@mui/material'
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { useApi } from '../hooks/useDynamicApi'
import { MonthlySalesGrowthData } from '../types/api'
import ChartSkeleton from './skeletons/ChartSkeleton'
import ChartErrorState from './states/ChartErrorState'
import ChartEmptyState from './states/ChartEmptyState'

interface MonthlySalesTrendChartProps {
  startDate: string | null
  endDate: string | null
  branch?: string
  productLine?: string
}

interface SalesData {
  date: string
  sales: number
}

const MonthlySalesTrendChart: React.FC<MonthlySalesTrendChartProps> = ({
  startDate,
  endDate,
  branch,
  productLine
}) => {
  const { data, error, isLoading, mutate } = useApi<MonthlySalesGrowthData[]>('/kpis/monthly-sales-growth', {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    branch: branch || undefined,
    product_line: productLine || undefined,
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Monthly Sales Trend
          </Typography>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Monthly Sales Trend
          </Typography>
          <ChartErrorState
            errorMessage="Failed to load sales trend data"
            onRetry={mutate}
          />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Monthly Sales Trend
          </Typography>
          <ChartEmptyState
            message="No Sales Data Available"
            subtitle="There are no sales records for the selected time period. Try adjusting your date range or check if data has been properly recorded."
          />
        </CardContent>
      </Card>
    )
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
          <p style={{ margin: '0', color: '#1976d2' }}>{`Sales Revenue: $${payload[0].value?.toLocaleString()}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <Tooltip title="Line chart showing sales performance over time. Hover over data points to see detailed values for each period." arrow>
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
          Monthly Sales Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip content={CustomTooltip} />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#1976d2"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default MonthlySalesTrendChart
