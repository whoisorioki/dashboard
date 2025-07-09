import { Skeleton, Box } from '@mui/material'

const ChartSkeleton = () => {
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{ borderRadius: 1 }}
      />
    </Box>
  )
}

export default ChartSkeleton
