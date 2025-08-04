import { Grid, GridProps, Box, BoxProps } from '@mui/material';
import { LAYOUT_CONSTANTS, getResponsiveSpacing, getResponsivePadding } from '../../theme/layoutConstants';

/**
 * Standardized Layout Components for Dashboard
 * Provides consistent spacing and height across all dashboard pages
 */

// Main page container with consistent padding
interface DashboardPageContainerProps extends BoxProps {
    children: React.ReactNode;
    disablePadding?: boolean;
}

export const DashboardPageContainer: React.FC<DashboardPageContainerProps> = ({
    children,
    disablePadding = false,
    sx = {},
    ...props
}) => (
    <Box
        sx={{
            p: disablePadding ? 0 : getResponsivePadding(),
            pt: disablePadding ? 0 : 1, // Minimal top padding to reduce space below header
            ...sx,
        }}
        {...props}
    >
        {children}
    </Box>
);

// Section container for logical groups (KPIs, Charts, Tables)
interface DashboardSectionProps extends BoxProps {
    children: React.ReactNode;
    spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
    children,
    spacing = 'md',
    sx = {},
    ...props
}) => {
    const getSpacingValue = () => {
        switch (spacing) {
            case 'none': return 0;
            case 'sm': return LAYOUT_CONSTANTS.spacing.sm;
            case 'md': return LAYOUT_CONSTANTS.spacing.md;
            case 'lg': return LAYOUT_CONSTANTS.spacing.lg;
            default: return LAYOUT_CONSTANTS.spacing.md;
        }
    };

    return (
        <Box
            sx={{
                mt: spacing !== 'none' ? getSpacingValue() : 0,
                ...sx,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

// Standardized grid container with consistent spacing
interface DashboardGridProps extends Omit<GridProps, 'container'> {
    children: React.ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
    children,
    spacing,
    sx = {},
    ...props
}) => (
    <Grid
        container
        spacing={spacing || getResponsiveSpacing()}
        sx={sx}
        {...props}
    >
        {children}
    </Grid>
);

// KPI Grid Item with standard height
interface KpiGridItemProps extends Omit<GridProps, 'item'> {
    children: React.ReactNode;
}

export const KpiGridItem: React.FC<KpiGridItemProps> = ({
    children,
    xs = 12,
    sm = 6,
    lg = 3,
    sx = {},
    ...props
}) => (
    <Grid
        item
        xs={xs}
        sm={sm}
        lg={lg}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            ...sx,
        }}
        {...props}
    >
        {children}
    </Grid>
);

// Chart Grid Item with minimum height
interface ChartGridItemProps extends Omit<GridProps, 'item'> {
    children: React.ReactNode;
    minHeight?: number;
}

export const ChartGridItem: React.FC<ChartGridItemProps> = ({
    children,
    minHeight,
    xs = 12,
    md = 6,
    lg = 6,
    sx = {},
    ...props
}) => (
    <Grid
        item
        xs={xs}
        md={md}
        lg={lg}
        sx={{
            minHeight: minHeight || LAYOUT_CONSTANTS.heights.chartCardMin,
            display: 'flex',
            flexDirection: 'column',
            ...sx,
        }}
        {...props}
    >
        {children}
    </Grid>
);

// Table Grid Item with minimum height
interface TableGridItemProps extends Omit<GridProps, 'item'> {
    children: React.ReactNode;
    minHeight?: number;
}

export const TableGridItem: React.FC<TableGridItemProps> = ({
    children,
    minHeight,
    xs = 12,
    sx = {},
    ...props
}) => (
    <Grid
        item
        xs={xs}
        sx={{
            minHeight: minHeight || LAYOUT_CONSTANTS.heights.tableCardMin,
            display: 'flex',
            flexDirection: 'column',
            ...sx,
        }}
        {...props}
    >
        {children}
    </Grid>
);

// Full-width Grid Item for large components
interface FullWidthGridItemProps extends Omit<GridProps, 'item'> {
    children: React.ReactNode;
    minHeight?: number;
}

export const FullWidthGridItem: React.FC<FullWidthGridItemProps> = ({
    children,
    minHeight,
    sx = {},
    ...props
}) => (
    <Grid
        item
        xs={12}
        sx={{
            minHeight,
            display: 'flex',
            flexDirection: 'column',
            ...sx,
        }}
        {...props}
    >
        {children}
    </Grid>
);
