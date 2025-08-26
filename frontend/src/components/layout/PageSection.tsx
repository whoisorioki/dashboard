import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';

interface PageSectionProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    spacing?: 'compact' | 'comfortable' | 'spacious';
    className?: string;
    sx?: any;
}

const PageSection: React.FC<PageSectionProps> = ({
    children,
    title,
    subtitle,
    spacing = 'comfortable',
    className = '',
    sx = {}
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Spacing configuration
    const spacingConfig = {
        compact: {
            section: { mb: 1.5, pt: 0.5 },
            title: { mb: 0.5 },
            subtitle: { mb: 1 }
        },
        comfortable: {
            section: { mb: 2, pt: 1 },
            title: { mb: 1 },
            subtitle: { mb: 1.5 }
        },
        spacious: {
            section: { mb: 3, pt: 1.5 },
            title: { mb: 1.5 },
            subtitle: { mb: 2 }
        }
    };

    const currentSpacing = spacingConfig[spacing];

    return (
        <Box
            className={`page-section ${className}`}
            sx={{
                ...currentSpacing.section,
                // Responsive adjustments
                ...(isSmallScreen && {
                    mb: Math.max(currentSpacing.section.mb - 0.5, 1),
                    pt: Math.max(currentSpacing.section.pt - 0.5, 0.5)
                }),
                ...sx
            }}
        >
            {title && (
                <Typography
                    variant="h5"
                    component="h2"
                    color="text.primary"
                    sx={{
                        ...currentSpacing.title,
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    {title}
                </Typography>
            )}

            {subtitle && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        ...currentSpacing.subtitle,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    {subtitle}
                </Typography>
            )}

            {children}
        </Box>
    );
};

export default PageSection;
