import { Card, CardContent, Typography, Box, Tooltip, IconButton } from '@mui/material'
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApi } from '../hooks/useDynamicApi'
import { BranchProductHeatmapData } from '../types/api'
import ChartSkeleton from './skeletons/ChartSkeleton'
import ChartErrorState from './states/ChartErrorState'
import ChartEmptyState from './states/ChartEmptyState'

interface BranchProductHeatmapProps {
  startDate: string | null
  endDate: string | null
  branch?: string
  productLine?: string
}

const BranchProductHeatmap: React.FC<BranchProductHeatmapProps> = ({
  startDate,
  endDate,
  branch,
  productLine
}) => {
  const { data, error, isLoading, mutate } = useApi<BranchProductHeatmapData[]>('/kpis/branch-product-heatmap', {
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
            Branch-Product Sales Heatmap
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
            Branch-Product Sales Heatmap
          </Typography>
          <ChartErrorState
            errorMessage="Failed to load heatmap data"
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
            Branch-Product Sales Heatmap
          </Typography>
          <ChartEmptyState
            message="No Branch-Product Data Available"
            subtitle="There are no sales records by branch and product for the selected time period. Try adjusting your date range or ensure sales data is properly recorded across branches."
          />
        </CardContent>
      </Card>
    )
  }

  // Color scale function
  const getColor = (value: number, max: number) => {
    const intensity = value / max
    const red = Math.floor(255 * intensity)
    const green = Math.floor(255 * (1 - intensity))
    return `rgb(${red}, ${green}, 100)`
  }

  const maxSales = Math.max(...data.map((d: any) => d.sales))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p>{`Branch: ${data.branch}`}</p>
          <p>{`Product: ${data.product}`}</p>
          <p>{`Sales: $${data.sales?.toLocaleString()}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <Tooltip title="Scatter plot visualization showing sales performance across different branches and products. Color intensity represents sales volume - darker colors indicate higher sales." arrow>
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
          Branch-Product Sales Heatmap
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ResponsiveContainer width="80%" height={300}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis dataKey="product" />
              <RechartsTooltip content={CustomTooltip} />
              <Scatter dataKey="sales" fill="#8884d8">
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.sales, maxSales)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" gutterBottom>
              Sales Volume
            </Typography>
            <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(255, 0, 100)' }} />
                <Typography variant="caption">High</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(128, 128, 100)' }} />
                <Typography variant="caption">Medium</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(0, 255, 100)' }} />
                <Typography variant="caption">Low</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default BranchProductHeatmap
