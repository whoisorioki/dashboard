import React from 'react';
import { Box, Skeleton } from '@mui/material';

const CardSkeleton: React.FC = () => {
    return (
        <Box sx={{ p: 2, boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
            <Skeleton variant="rectangular" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="40%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={80} />
        </Box>
    );
};

export default CardSkeleton;
