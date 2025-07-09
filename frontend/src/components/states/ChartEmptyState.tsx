import { Box, Typography } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material'

interface ChartEmptyStateProps {
  message?: string
  subtitle?: string
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = "No Data to Display",
  subtitle = "There is no data available for the selected time period. Please try a different date range."
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        textAlign: 'center',
        gap: 2,
        px: 2,
      }}
    >
      <InfoOutlinedIcon color="info" sx={{ fontSize: 48 }} />
      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {subtitle}
      </Typography>
    </Box>
  )
}

export default ChartEmptyState
