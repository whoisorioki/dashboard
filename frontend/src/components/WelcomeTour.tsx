import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Chip,
    alpha
} from '@mui/material'
import {
    Close as CloseIcon,
    Dashboard as DashboardIcon,
    TrendingUp as TrendingUpIcon,
    AutoGraph as AutoGraphIcon,
    Lightbulb as LightbulbIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface WelcomeTourProps {
    open: boolean
    onClose: () => void
}

const tourSteps = [
    {
        title: 'Welcome to Sales Analytics Dashboard! 🎉',
        description: 'Get real-time insights into your sales performance with our comprehensive analytics platform.',
        icon: <DashboardIcon fontSize="large" />,
        color: 'primary'
    },
    {
        title: 'Interactive Navigation 🧭',
        description: 'Use the sidebar to navigate between Overview, Sales, Products, and Regions. Each section provides detailed analytics and performance metrics.',
        icon: <TrendingUpIcon fontSize="large" />,
        color: 'success'
    },
    {
        title: 'Real-time Data & Charts 📊',
        description: 'All charts and KPIs update in real-time. Use the date controls to filter data and explore different time periods.',
        icon: <AutoGraphIcon fontSize="large" />,
        color: 'info'
    },
    {
        title: 'Quick Actions & Features ⚡',
        description: 'Use the floating action button (bottom-right) for quick actions like refreshing data, exporting reports, and sharing dashboards.',
        icon: <LightbulbIcon fontSize="large" />,
        color: 'warning'
    }
]

const WelcomeTour: React.FC<WelcomeTourProps> = ({ open, onClose }) => {
    const [activeStep, setActiveStep] = useState(0)
    const theme = useTheme()

    const handleNext = () => {
        if (activeStep < tourSteps.length - 1) {
            setActiveStep(activeStep + 1)
        } else {
            handleFinish()
        }
    }

    const handleBack = () => {
        setActiveStep(activeStep - 1)
    }

    const handleFinish = () => {
        localStorage.setItem('dashboardTourCompleted', 'true')
        onClose()
    }

    const currentStep = tourSteps[activeStep]
    const stepColor = currentStep.color as 'primary' | 'success' | 'info' | 'warning'

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette[stepColor].main, 0.05)} 0%, ${alpha(theme.palette[stepColor].main, 0.02)} 100%)`,
                    border: `1px solid ${alpha(theme.palette[stepColor].main, 0.1)}`,
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette[stepColor].main, 0.1),
                            color: theme.palette[stepColor].main,
                        }}
                    >
                        {currentStep.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {currentStep.title}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 0 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {tourSteps.map((step, index) => (
                        <Step key={index}>
                            <StepLabel />
                        </Step>
                    ))}
                </Stepper>

                <Typography variant="body1" sx={{
                    lineHeight: 1.6,
                    color: theme.palette.text.secondary,
                    fontSize: '1rem'
                }}>
                    {currentStep.description}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Chip
                        label={`Step ${activeStep + 1} of ${tourSteps.length}`}
                        color={stepColor}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    variant="outlined"
                    color={stepColor}
                >
                    Back
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={onClose} color="inherit">
                    Skip Tour
                </Button>
                <Button
                    onClick={handleNext}
                    variant="contained"
                    color={stepColor}
                    sx={{ ml: 1 }}
                >
                    {activeStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default WelcomeTour
