import { useState, createContext, useContext, ReactNode } from 'react'
import {
    Snackbar,
    Alert,
    AlertColor,
    Slide,
    SlideProps,
    IconButton,
    Box
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

interface NotificationContextType {
    showNotification: (message: string, severity?: AlertColor, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
    children: ReactNode
}

interface NotificationState {
    open: boolean
    message: string
    severity: AlertColor
    duration: number
}

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info',
        duration: 4000
    })

    const showNotification = (
        message: string,
        severity: AlertColor = 'info',
        duration: number = 4000
    ) => {
        setNotification({
            open: true,
            message,
            severity,
            duration
        })
    }

    const handleClose = () => {
        setNotification(prev => ({ ...prev, open: false }))
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={notification.duration}
                onClose={handleClose}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                sx={{
                    mb: { xs: 8, sm: 2 },
                    ml: { md: '240px' },
                    zIndex: (theme) => theme.zIndex.snackbar + 1
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: (theme) => theme.shadows[6],
                        '& .MuiAlert-message': {
                            fontWeight: 500,
                        },
                        '& .MuiAlert-action': {
                            alignItems: 'center',
                        },
                    }}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    )
}

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}
