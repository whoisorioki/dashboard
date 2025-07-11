import { Skeleton, Card, CardContent, Box } from '@mui/material'

const KpiCardSkeleton = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
        <Skeleton variant="text" width="40%" height={40} />
      </CardContent>
    </Card>
  )
}

export default KpiCardSkeleton
