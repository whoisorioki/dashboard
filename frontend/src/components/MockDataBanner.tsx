import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface MockDataBannerProps {
    isVisible?: boolean;
    className?: string;
    message?: string;
    dataStatus?: string;
}

const MockDataBanner: React.FC<MockDataBannerProps> = ({
    isVisible = true,
    className = "",
    message = "🎭 Mock Data Mode - This dashboard is displaying mock data for development purposes.",
    dataStatus
}) => {
    if (!isVisible) {
        return null;
    }

    // Determine banner style based on data status
    const getBannerStyle = () => {
        switch (dataStatus) {
            case 'FORCED_MOCK_DATA':
                return {
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    '& .MuiAlert-icon': { color: '#856404' },
                    '& .MuiAlert-message': { color: '#856404' }
                };
            case 'MOCK_DATA_FALLBACK':
                return {
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    '& .MuiAlert-icon': { color: '#1976d2' },
                    '& .MuiAlert-message': { color: '#1565c0' }
                };
            default:
                return {
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    '& .MuiAlert-icon': { color: '#1976d2' },
                    '& .MuiAlert-message': { color: '#1565c0' }
                };
        }
    };

    const getTitle = () => {
        switch (dataStatus) {
            case 'FORCED_MOCK_DATA':
                return '🎭 Forced Mock Data Mode';
            case 'MOCK_DATA_FALLBACK':
                return '🔄 Mock Data Fallback Mode';
            default:
                return '🎭 Mock Data Mode';
        }
    };

    return (
        <Alert
            severity="info"
            icon={<InfoIcon />}
            className={`mock-data-banner ${className}`}
            sx={{
                marginBottom: 2,
                borderRadius: 2,
                ...getBannerStyle()
            }}
        >
            <AlertTitle sx={{ fontWeight: 'bold' }}>
                {getTitle()}
            </AlertTitle>
            <div>
                {message}
                {dataStatus && (
                    <div style={{ marginTop: '8px', fontSize: '0.875rem', opacity: 0.8 }}>
                        Status: {dataStatus}
                    </div>
                )}
            </div>
        </Alert>
    );
};

export default MockDataBanner;
