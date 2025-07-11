import { useState } from 'react'
import { Card, CardContent, Typography, ToggleButtonGroup, ToggleButton, Box, Tooltip, IconButton } from '@mui/material'
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useApi } from '../hooks/useDynamicApi'
import { ProductPerformanceData } from '../types/api'
import ChartSkeleton from './skeletons/ChartSkeleton'
import ChartErrorState from './states/ChartErrorState'
import ChartEmptyState from './states/ChartEmptyState'

interface ProductPerformanceChartProps {
  startDate: string | null
  endDate: string | null
  branch?: string
  productLine?: string
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({
  startDate,
  endDate,
  branch,
  productLine
}) => {
  const [viewType, setViewType] = useState<'top' | 'bottom'>('top')
  const n = viewType === 'top' ? 5 : -5

  const { data, error, isLoading, mutate } = useApi<ProductPerformanceData[]>('/kpis/product-performance', {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    n: n,
    branch: branch || undefined,
    product_line: productLine || undefined,
  })

  const handleViewTypeChange = (event: React.MouseEvent<HTMLElement>, newViewType: 'top' | 'bottom') => {
    if (newViewType !== null) {
      setViewType(newViewType)
    }
  }

  // Custom tooltip for better data presentation
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
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{`Product: ${label}`}</p>
          <p style={{ margin: '0', color: viewType === 'top' ? '#2e7d32' : '#d32f2f' }}>
            {`Sales: $${payload[0].value?.toLocaleString()}`}
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Product Performance
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
            Product Performance
          </Typography>
          <ChartErrorState
            errorMessage="Failed to load product performance data"
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
            Product Performance
          </Typography>
          <ChartEmptyState
            message="No Product Performance Data"
            subtitle="There are no product sales records for the selected time period. Try adjusting your date range or ensure products have been sold during this period."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <Tooltip title="Horizontal bar chart showing top or bottom performing products by sales. Use the toggle to switch between top 5 and bottom 5 performers." arrow>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Product Performance
          </Typography>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={handleViewTypeChange}
            size="small"
          >
            <ToggleButton value="top">
              Top 5
            </ToggleButton>
            <ToggleButton value="bottom">
              Bottom 5
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="product" type="category" width={100} />
            <RechartsTooltip content={CustomTooltip} />
            <Bar
              dataKey="sales"
              fill={viewType === 'top' ? '#2e7d32' : '#d32f2f'}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ProductPerformanceChart
