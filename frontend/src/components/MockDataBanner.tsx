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
            case 'MOCK_DATA_FALLBACK':
                return {
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    color: '#1976d2'
                };
            case 'REAL_DATA_UNAVAILABLE':
                return {
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    color: '#c62828'
                };
            case 'DRUID_ERROR':
                return {
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ff9800',
                    color: '#e65100'
                };
            default:
                return {
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    color: '#1976d2'
                };
        }
    };

    const getTitle = () => {
        switch (dataStatus) {
            case 'MOCK_DATA_FALLBACK':
                return '🔄 Mock Data Fallback Mode';
            case 'REAL_DATA_UNAVAILABLE':
                return '❌ Real Data Unavailable';
            case 'DRUID_ERROR':
                return '⚠️ Druid Connection Error';
            default:
                return '🎭 Mock Data Mode';
        }
    };

    const getSeverity = () => {
        switch (dataStatus) {
            case 'MOCK_DATA_FALLBACK':
                return 'info';
            case 'REAL_DATA_UNAVAILABLE':
                return 'error';
            case 'DRUID_ERROR':
                return 'warning';
            default:
                return 'info';
        }
    };

    return (
        <Alert
            severity={getSeverity()}
            icon={<InfoIcon />}
            className={`mock-data-banner ${className}`}
            sx={{
                marginBottom: 2,
                borderRadius: 2,
                fontSize: '0.875rem',
                padding: '12px 16px',
                minHeight: 'auto',
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                color: 'primary.main',
                '& .MuiAlert-message': {
                    padding: 0
                },
                '& .MuiAlertTitle-root': {
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: 0.5,
                    lineHeight: 1.2,
                    color: 'primary.main'
                },
                '& .MuiAlert-icon': {
                    fontSize: '1.25rem',
                    marginRight: 0.75,
                    color: 'primary.main'
                },
                '& .MuiAlert-standardInfo': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderColor: 'rgba(25, 118, 210, 0.2)'
                }
            }}
        >
            <AlertTitle>
                {getTitle()}
            </AlertTitle>
            <div style={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                {message}
                {dataStatus && (
                    <div style={{ marginTop: '2px', opacity: 0.8, fontSize: '0.65rem' }}>
                        Status: {dataStatus}
                    </div>
                )}
            </div>
        </Alert>
    );
};

export default MockDataBanner;
