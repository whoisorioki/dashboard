import React from 'react';
import { Grid, Box, useTheme, useMediaQuery } from '@mui/material';

interface ContentGridProps {
    children: React.ReactNode;
    spacing?: 'compact' | 'comfortable' | 'spacious';
    columns?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    className?: string;
    sx?: any;
}

const ContentGrid: React.FC<ContentGridProps> = ({
    children,
    spacing = 'comfortable',
    columns = { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
    className = '',
    sx = {}
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Spacing configuration
    const spacingConfig = {
        compact: {
            grid: { spacing: { xs: 1, sm: 1.5 } },
            container: { mb: 1.5 }
        },
        comfortable: {
            grid: { spacing: { xs: 1.5, sm: 2 } },
            container: { mb: 2 }
        },
        spacious: {
            grid: { spacing: { xs: 2, sm: 3 } },
            container: { mb: 3 }
        }
    };

    const currentSpacing = spacingConfig[spacing];

    return (
        <Box
            className={`content-grid ${className}`}
            sx={{
                ...currentSpacing.container,
                // Responsive adjustments
                ...(isSmallScreen && {
                    mb: Math.max(currentSpacing.container.mb - 0.5, 1)
                }),
                ...sx
            }}
        >
            <Grid
                container
                spacing={currentSpacing.grid.spacing}
                sx={{
                    // Ensure consistent grid behavior
                    width: '100%',
                    margin: 0
                }}
            >
                {React.Children.map(children, (child, index) => (
                    <Grid
                        item
                        xs={columns.xs || 12}
                        sm={columns.sm || 6}
                        md={columns.md || 4}
                        lg={columns.lg || 3}
                        xl={columns.xl || 3}
                        sx={{
                            // Ensure grid items are properly sized
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {child}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ContentGrid;
