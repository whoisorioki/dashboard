/**
 * Layout Constants for Dashboard
 * Defines standardized spacing, heights, and responsive breakpoints
 */

export const LAYOUT_CONSTANTS = {
  // Spacing system (multiples of 8px)
  spacing: {
    xs: 1,    // 8px
    sm: 2,    // 16px  
    md: 3,    // 24px
    lg: 4,    // 32px
    xl: 6,    // 48px
  },
  
  // Component heights (in pixels)
  heights: {
    kpiCard: 200,           // Standard KPI card height
    chartCardMin: 400,      // Minimum chart height
    tableCardMin: 500,      // Minimum table height
    heatmapCard: 400,       // Heatmap components
    mapCard: 400,           // Geographic map components
    headerHeight: {         // Header heights by breakpoint
      xs: 120,
      sm: 140,
    },
  },

  // Grid spacing by breakpoint
  gridSpacing: {
    xs: 2,    // 16px on mobile
    sm: 2,    // 16px on small screens (reduced from 24px)
    md: 2,    // 16px on medium+ screens (reduced from 24px)
  },

  // Container padding by breakpoint
  containerPadding: {
    xs: 1,    // 8px on mobile
    sm: 2,    // 16px on small screens  
    md: 2,    // 16px on medium+ screens (reduced from 24px)
  },

  // Margins for sections
  sectionMargin: {
    top: 2,   // 16px top margin for each section (reduced from 24px)
  },

  // Border radius
  borderRadius: {
    card: 2,        // 16px for cards
    kpi: 3,         // 24px for KPI cards
  },
} as const;

// Utility function to get responsive spacing
export const getResponsiveSpacing = () => ({
  xs: LAYOUT_CONSTANTS.gridSpacing.xs,
  sm: LAYOUT_CONSTANTS.gridSpacing.sm,
  md: LAYOUT_CONSTANTS.gridSpacing.md,
});

// Utility function to get responsive padding
export const getResponsivePadding = () => ({
  xs: LAYOUT_CONSTANTS.containerPadding.xs,
  sm: LAYOUT_CONSTANTS.containerPadding.sm,
  md: LAYOUT_CONSTANTS.containerPadding.md,
});

// Utility function to get standard component heights
export const getComponentHeight = (component: keyof typeof LAYOUT_CONSTANTS.heights) => {
  return LAYOUT_CONSTANTS.heights[component];
};
