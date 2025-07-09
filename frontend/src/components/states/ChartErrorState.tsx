import { Box, Typography, Button } from '@mui/material'
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material'

interface ChartErrorStateProps {
  errorMessage: string
  onRetry: () => void
}

const ChartErrorState: React.FC<ChartErrorStateProps> = ({ errorMessage, onRetry }) => {
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
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      <Typography variant="h6" color="error">
        {errorMessage}
      </Typography>
      <Button variant="contained" onClick={onRetry}>
        Retry
      </Button>
    </Box>
  )
}

export default ChartErrorState
