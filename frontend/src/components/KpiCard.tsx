import { Card, CardContent, Typography, Box, Tooltip, alpha, keyframes, IconButton } from '@mui/material'
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import KpiCardSkeleton from './skeletons/KpiCardSkeleton'

// Animation for the card hover effect
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  100% { transform: translateY(-6px); }
`

// Animation for the icon
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ReactElement
  tooltipText: string
  isLoading: boolean
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  tooltipText,
  isLoading,
  trend = 'neutral',
  trendValue,
  color = 'primary'
}) => {
  const theme = useTheme()

  if (isLoading) {
    return <KpiCardSkeleton />
  }

  const getColorPalette = () => {
    switch (color) {
      case 'success': return theme.palette.success
      case 'warning': return theme.palette.warning
      case 'error': return theme.palette.error
      case 'info': return theme.palette.info
      default: return theme.palette.primary
    }
  }

  const colorPalette = getColorPalette()

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(colorPalette.main, 0.08)} 0%, ${alpha(colorPalette.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(colorPalette.main, 0.12)}`,
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${colorPalette.main}, ${colorPalette.light})`,
          transform: 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.3s ease',
        },
        '&:hover': {
          animation: `${floatAnimation} 0.3s ease-out forwards`,
          boxShadow: `0 12px 32px ${alpha(colorPalette.main, 0.25)}, 0 2px 8px ${alpha(colorPalette.main, 0.1)}`,
          border: `1px solid ${alpha(colorPalette.main, 0.3)}`,
          '&::before': {
            transform: 'scaleX(1)',
          },
        }
      }}
    >
      {/* Help tooltip in top right corner */}
      <Tooltip title={tooltipText} arrow>
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            color: alpha(colorPalette.main, 0.6),
            '&:hover': {
              color: colorPalette.main,
              backgroundColor: alpha(colorPalette.main, 0.1),
            },
          }}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                backgroundColor: alpha(colorPalette.main, 0.12),
                color: colorPalette.main,
                mr: 1.5,
                position: 'relative',
                '&:hover': {
                  animation: `${pulseAnimation} 0.6s ease-in-out infinite`,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  background: `radial-gradient(circle, ${alpha(colorPalette.main, 0.2)} 0%, transparent 70%)`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover::after': {
                  opacity: 1,
                },
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              {title}
            </Typography>
          </Box>
          {trendValue && (
            <Typography
              variant="caption"
              sx={{
                color: trend === 'up' ? theme.palette.success.main :
                  trend === 'down' ? theme.palette.error.main :
                    theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {trendValue}
            </Typography>
          )}
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default KpiCard
