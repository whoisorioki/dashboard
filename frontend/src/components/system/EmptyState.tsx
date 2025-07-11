import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface EmptyStateProps {
    message: string;
    actionText?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, actionText, onAction }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                textAlign: 'center',
                backgroundColor: 'background.default',
                borderRadius: 2,
                height: '100%',
            }}
        >
            <InfoOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" component="p" sx={{ mb: 2, color: 'text.primary' }}>
                {message}
            </Typography>
            {actionText && onAction && (
                <Button variant="contained" onClick={onAction}>
                    {actionText}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;
