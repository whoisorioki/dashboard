import { useState } from 'react'
import {
    Fab,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Zoom,
    useTheme,
    alpha
} from '@mui/material'
import {
    Add as AddIcon,
    Assessment as ReportIcon,
    FileDownload as ExportIcon,
    Refresh as RefreshIcon,
    Share as ShareIcon,
    Settings as SettingsIcon
} from '@mui/icons-material'
import { useNotification } from '../context/NotificationContext'

interface FloatingActionMenuProps {
    onRefresh?: () => void
    onExport?: () => void
    onShare?: () => void
    onSettings?: () => void
    onGenerateReport?: () => void
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
    onRefresh,
    onExport,
    onShare,
    onSettings,
    onGenerateReport
}) => {
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const { showNotification } = useNotification()

    const handleAction = (actionName: string, action?: () => void) => {
        action?.()
        showNotification(`${actionName} completed successfully!`, 'success')
        setOpen(false)
    }

    const actions = [
        {
            icon: <RefreshIcon />,
            name: 'Refresh Data',
            onClick: () => handleAction('Data refresh', onRefresh),
            color: theme.palette.info.main
        },
        {
            icon: <ExportIcon />,
            name: 'Export Data',
            onClick: () => handleAction('Data export', onExport),
            color: theme.palette.success.main
        },
        {
            icon: <ReportIcon />,
            name: 'Generate Report',
            onClick: () => handleAction('Report generation', onGenerateReport),
            color: theme.palette.warning.main
        },
        {
            icon: <ShareIcon />,
            name: 'Share Dashboard',
            onClick: () => handleAction('Dashboard sharing', onShare),
            color: theme.palette.secondary.main
        },
        {
            icon: <SettingsIcon />,
            name: 'Settings',
            onClick: () => handleAction('Settings update', onSettings),
            color: theme.palette.text.secondary
        },
    ]

    return (
        <SpeedDial
            ariaLabel="Quick Actions"
            sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                zIndex: theme.zIndex.speedDial,
                '& .MuiFab-primary': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        transform: 'scale(1.1)',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.6)}`,
                    },
                },
            }}
            icon={<SpeedDialIcon openIcon={<AddIcon />} />}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            direction="up"
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.onClick}
                    sx={{
                        '& .MuiFab-primary': {
                            backgroundColor: action.color,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: action.color,
                                transform: 'scale(1.1)',
                                filter: 'brightness(1.1)',
                            },
                        },
                    }}
                />
            ))}
        </SpeedDial>
    )
}

export default FloatingActionMenu
