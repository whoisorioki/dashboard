import { Box, CircularProgress, Typography, Fade } from '@mui/material'
import { useTheme } from '@mui/material/styles'

interface LoadingSpinnerProps {
    message?: string
    size?: number
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Loading...',
    size = 40,
    color = 'primary'
}) => {
    const theme = useTheme()

    return (
        <Fade in timeout={300}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    minHeight: 200,
                }}
            >
                <CircularProgress
                    size={size}
                    color={color}
                    thickness={4}
                    sx={{
                        mb: 2,
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                            '0%': {
                                transform: 'rotate(0deg)',
                            },
                            '100%': {
                                transform: 'rotate(360deg)',
                            },
                        },
                    }}
                />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontWeight: 500,
                        letterSpacing: 0.5,
                    }}
                >
                    {message}
                </Typography>
            </Box>
        </Fade>
    )
}

export default LoadingSpinner
