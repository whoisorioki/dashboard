import React from 'react';
import { Box, Switch, FormControlLabel, Typography, Tooltip } from '@mui/material';
import { DataUsage as DataUsageIcon, Memory as MemoryIcon } from '@mui/icons-material';
import { useDataMode } from '../context/DataModeContext';

interface DataModeToggleProps {
    className?: string;
}

const DataModeToggle: React.FC<DataModeToggleProps> = ({ className }) => {
    const { dataMode, setDataMode } = useDataMode();

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newMode = event.target.checked ? 'mock' : 'real';
        setDataMode(newMode);
    };

    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <DataUsageIcon
                sx={{
                    color: dataMode === 'real' ? 'success.main' : 'text.secondary',
                    fontSize: '1.2rem'
                }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={dataMode === 'mock'}
                        onChange={handleToggle}
                        size="small"
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {dataMode === 'real' ? 'Real Data' : 'Mock Data'}
                    </Typography>
                }
                sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': { fontSize: '0.8rem' }
                }}
            />

            <MemoryIcon
                sx={{
                    color: dataMode === 'mock' ? 'warning.main' : 'text.secondary',
                    fontSize: '1.2rem'
                }}
            />

            <Tooltip title={`Currently using ${dataMode === 'real' ? 'real' : 'mock'} data`}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        opacity: 0.8
                    }}
                >
                    {dataMode === 'real' ? 'Live' : 'Demo'}
                </Typography>
            </Tooltip>
        </Box>
    );
};

export default DataModeToggle;
