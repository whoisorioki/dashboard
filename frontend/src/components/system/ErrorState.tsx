import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ErrorStateProps {
    errorMessage: string;
    onRetry: () => void;
    correlationId?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage, onRetry, correlationId }) => {
    const handleContactSupport = () => {
        // In a real app, this would open a support chat or a pre-filled email
        alert(`Support contacted. Please provide this ID: ${correlationId || 'N/A'}`);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                textAlign: 'center',
                backgroundColor: 'error.dark',
                color: 'error.contrastText',
                borderRadius: 2,
                height: '100%',
            }}
        >
            <ErrorOutline sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" component="p" sx={{ mb: 2 }}>
                {errorMessage}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={onRetry}>
                    Retry
                </Button>
                <Button variant="outlined" color="inherit" onClick={handleContactSupport}>
                    Contact Support
                </Button>
            </Box>
            {correlationId && (
                <Typography variant="caption" sx={{ mt: 2, opacity: 0.7 }}>
                    Error ID: {correlationId}
                </Typography>
            )}
        </Box>
    );
};

export default ErrorState;
