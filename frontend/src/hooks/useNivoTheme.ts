import { useTheme } from '@mui/material/styles';

/**
 * Custom hook to map Material-UI theme tokens to a Nivo theme object.
 * Ensures Nivo charts are visually consistent with the app's MUI theme.
 */
export function useNivoTheme(): any {
  const muiTheme = useTheme();

  return {
    background: muiTheme.palette.background.paper,
    textColor: muiTheme.palette.text.primary,
    fontSize: 12,
    axis: {
      domain: {
        line: {
          stroke: muiTheme.palette.divider,
          strokeWidth: 1,
        },
      },
      legend: {
        text: {
          fill: muiTheme.palette.text.secondary,
          fontSize: 12,
        },
      },
      ticks: {
        line: {
          stroke: muiTheme.palette.divider,
          strokeWidth: 1,
        },
        text: {
          fill: muiTheme.palette.text.primary,
          fontSize: 11,
        },
      },
    },
    grid: {
      line: {
        stroke: muiTheme.palette.divider,
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fill: muiTheme.palette.text.secondary,
        fontSize: 12,
      },
    },
    tooltip: {
      container: {
        background: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        fontSize: 13,
        borderRadius: 4,
        boxShadow: muiTheme.shadows[2],
        padding: '8px 12px',
      },
    },
    labels: {
      text: {
        fill: muiTheme.palette.text.primary,
        fontSize: 11,
      },
    },
    annotations: {
      text: {
        fill: muiTheme.palette.text.primary,
        fontSize: 12,
        outlineWidth: 2,
        outlineColor: muiTheme.palette.background.paper,
      },
      link: {
        stroke: muiTheme.palette.divider,
        strokeWidth: 1,
      },
      outline: {
        stroke: muiTheme.palette.background.paper,
        strokeWidth: 2,
      },
      symbol: {
        fill: muiTheme.palette.background.paper,
        outlineWidth: 2,
        outlineColor: muiTheme.palette.divider,
      },
    },
  };
} 