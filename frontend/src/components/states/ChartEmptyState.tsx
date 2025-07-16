import { Box, Typography, Button } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon, ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material'

interface ChartEmptyStateProps {
  message?: string
  subtitle?: string
  isError?: boolean
  onRetry?: () => void
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = "No Data to Display",
  subtitle = "There is no data available for the selected time period. Please try a different date range.",
  isError = false,
  onRetry
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
      {isError ? (
        <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      ) : (
        <InfoOutlinedIcon color="info" sx={{ fontSize: 48 }} />
      )}
      <Typography variant="h6" color={isError ? 'error' : 'text.secondary'} sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {subtitle}
      </Typography>
      {onRetry && (
        <Button variant="contained" color={isError ? 'error' : 'primary'} onClick={onRetry} sx={{ mt: 1 }}>
          Retry
        </Button>
      )}
    </Box>
  )
}

export default ChartEmptyState
