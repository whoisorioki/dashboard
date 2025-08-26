import React from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme, useMediaQuery } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: Array<{ label: string; path?: string }>;
    icon?: React.ReactNode;
    spacing?: 'compact' | 'comfortable' | 'spacious';
    className?: string;
    sx?: any;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    breadcrumbs = [],
    icon,
    spacing = 'comfortable',
    className = '',
    sx = {}
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Spacing configuration
    const spacingConfig = {
        compact: {
            container: { mb: 1.5, pt: 0.5 },
            title: { mb: 0.5 },
            subtitle: { mb: 1 },
            breadcrumbs: { mb: 0.5 }
        },
        comfortable: {
            container: { mb: 2, pt: 1 },
            title: { mb: 1 },
            subtitle: { mb: 1.5 },
            breadcrumbs: { mb: 1 }
        },
        spacious: {
            container: { mb: 3, pt: 1.5 },
            title: { mb: 1.5 },
            subtitle: { mb: 2 },
            breadcrumbs: { mb: 1.5 }
        }
    };

    const currentSpacing = spacingConfig[spacing];

    return (
        <Box
            className={`page-header ${className}`}
            sx={{
                ...currentSpacing.container,
                // Responsive adjustments
                ...(isSmallScreen && {
                    mb: Math.max(currentSpacing.container.mb - 0.5, 1),
                    pt: Math.max(currentSpacing.container.pt - 0.5, 0.5)
                }),
                ...sx
            }}
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{
                        ...currentSpacing.breadcrumbs,
                        mb: currentSpacing.breadcrumbs.mb,
                        '& .MuiBreadcrumbs-ol': {
                            flexWrap: 'wrap'
                        }
                    }}
                >
                    {breadcrumbs.map((crumb, index) => (
                        <Link
                            key={index}
                            color={crumb.path ? 'primary' : 'text.primary'}
                            href={crumb.path}
                            underline="hover"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: crumb.path ? 500 : 400
                            }}
                        >
                            {crumb.label}
                        </Link>
                    ))}
                </Breadcrumbs>
            )}

            {/* Title with Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'primary.main',
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
                        {icon}
                    </Box>
                )}
                <Typography
                    variant="h4"
                    component="h1"
                    color="text.primary"
                    sx={{
                        ...currentSpacing.title,
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                        lineHeight: 1.2
                    }}
                >
                    {title}
                </Typography>
            </Box>

            {/* Subtitle */}
            {subtitle && (
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        ...currentSpacing.subtitle,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        fontWeight: 400,
                        lineHeight: 1.4
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default PageHeader;
