import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

interface PageLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    spacing?: 'compact' | 'comfortable' | 'spacious';
    className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    maxWidth = 'xl',
    spacing = 'comfortable',
    className = ''
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Spacing configuration
    const spacingConfig = {
        compact: {
            container: { py: 1, px: 1 },
            section: { mb: 1.5 },
            grid: { spacing: { xs: 1, sm: 1.5 } }
        },
        comfortable: {
            container: { py: 2, px: { xs: 1, sm: 2 } },
            section: { mb: 2 },
            grid: { spacing: { xs: 1.5, sm: 2 } }
        },
        spacious: {
            container: { py: 3, px: { xs: 2, sm: 3 } },
            section: { mb: 3 },
            grid: { spacing: { xs: 2, sm: 3 } }
        }
    };

    const currentSpacing = spacingConfig[spacing];

    return (
        <Container
            maxWidth={maxWidth}
            className={className}
            sx={{
                ...currentSpacing.container,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: currentSpacing.section.mb,
                    // Responsive adjustments
                    ...(isSmallScreen && {
                        py: 1,
                        px: 1
                    })
                }}
            >
                {children}
            </Box>
        </Container>
    );
};

export default PageLayout;
