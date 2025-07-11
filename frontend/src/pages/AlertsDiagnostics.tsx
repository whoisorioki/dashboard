import { Box, Typography, Paper } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { NotificationImportant as NotificationImportantIcon } from '@mui/icons-material';
import ConnectionStatus from '../components/ConnectionStatus';

const AlertsDiagnostics = () => {
    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title="Alerts & Diagnostics"
                subtitle="System health, data quality, and important notifications"
                icon={<NotificationImportantIcon />}
            />
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Feature Under Development
                </Typography>
                <Typography>
                    The Alerts & Diagnostics page is currently under development. This section will provide real-time alerts on data anomalies, system performance, and other critical events.
                </Typography>
            </Paper>
            <Box sx={{ mt: 3 }}>
                <ConnectionStatus />
            </Box>
        </Box>
    );
};

export default AlertsDiagnostics;
