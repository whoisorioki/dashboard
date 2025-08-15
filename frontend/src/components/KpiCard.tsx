import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  alpha,
  keyframes,
  IconButton,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import KpiCardSkeleton from "./skeletons/KpiCardSkeleton";
import { useState, useEffect, useRef } from "react";
import { formatKshAbbreviated } from "../lib/numberFormat";
import { ResponsiveLine } from '@nivo/line';
import { useNivoTheme } from '../hooks/useNivoTheme';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { isMonetaryMetric, isPercentageMetric, isCountMetric } from '../constants/metricNames';

// Animation for the card hover effect
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  100% { transform: translateY(-6px); }
`;

// Animation for the icon
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  tooltipText: string;
  isLoading: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "success" | "warning" | "error" | "info";
  metricKey?: string;
  onClick?: () => void;
  editableTarget?: boolean;
  targetValue?: number | string;
  onTargetEdit?: (val: number | string) => void;
  vsValue?: number;
  vsPercent?: number;
  vsDirection?: "up" | "down" | "neutral";
  vsColor?: "success" | "error" | "default";
  sparklineData?: Array<{ x: string | number; y: number }>;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  tooltipText,
  isLoading,
  trend = "neutral",
  trendValue,
  color = "primary",
  metricKey,
  onClick,
  editableTarget = false,
  targetValue,
  onTargetEdit,
  vsValue,
  vsPercent,
  vsDirection = "neutral",
  vsColor = "default",
  sparklineData,
}) => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(targetValue);
  const nivoTheme = useNivoTheme();
  const [hovered, setHovered] = useState(false);
  const [hoverKey, setHoverKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(targetValue);
  }, [targetValue]);

  // Calculate trend direction from sparkline data
  const calculateTrendDirection = (): "up" | "down" | "neutral" => {
    if (!sparklineData || sparklineData.length < 2) return "neutral";

    const lastValue = sparklineData[sparklineData.length - 1]?.y || 0;
    const previousValue = sparklineData[sparklineData.length - 2]?.y || 0;

    if (lastValue > previousValue) return "up";
    if (lastValue < previousValue) return "down";
    return "neutral";
  };

  const calculatedTrend = calculateTrendDirection();
  const effectiveTrend = sparklineData && sparklineData.length > 1 ? calculatedTrend : trend;

  // Debug sparkline data
  useEffect(() => {
    if (sparklineData) {
      console.log(`✨ KpiCard [${title}] Sparkline:`, {
        hasData: !!sparklineData,
        length: sparklineData.length,
        firstPoint: sparklineData[0],
        lastPoint: sparklineData[sparklineData.length - 1],
        trend: effectiveTrend
      });
    }
  }, [sparklineData, title, effectiveTrend]);

  if (isLoading) {
    return <KpiCardSkeleton />;
  }

  const getColorPalette = () => {
    switch (color) {
      case "success":
        return theme.palette.success;
      case "warning":
        return theme.palette.warning;
      case "error":
        return theme.palette.error;
      case "info":
        return theme.palette.info;
      default:
        return theme.palette.primary;
    }
  };

  const colorPalette = getColorPalette();

  // Get sparkline color based on trend
  const getSparklineColor = () => {
    if (!sparklineData || sparklineData.length < 2) return colorPalette.main;

    switch (effectiveTrend) {
      case "up":
        return theme.palette.success.main;
      case "down":
        return theme.palette.error.main;
      default:
        return colorPalette.main;
    }
  };

  // Accessibility: ARIA label for card
  const ariaLabel = `${title}: ${value}`;

  // Arrow icon for vs previous period
  const getVsArrow = () => {
    if (vsDirection === "up") return "▲";
    if (vsDirection === "down") return "▼";
    return "▬";
  };
  const getVsColor = () => {
    if (vsColor === "success") return theme.palette.success.main;
    if (vsColor === "error") return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  // Format value based on metric type
  const formatValue = (val: string | number, metricKey?: string): string => {
    if (metricKey) {
      if (isMonetaryMetric(metricKey)) {
        return formatKshAbbreviated(Number(val));
      } else if (isPercentageMetric(metricKey)) {
        return typeof val === 'number' ? `${val.toFixed(1)}%` : val.toString();
      } else if (isCountMetric(metricKey)) {
        return typeof val === 'number' ? val.toLocaleString() : val.toString();
      }
    }
    return val.toString();
  };

  return (
    <Card
      ref={cardRef}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(
          colorPalette.main,
          0.08
        )} 0%, ${alpha(colorPalette.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(colorPalette.main, 0.12)}`,
        borderRadius: 3,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        outline: "none",
        "&:focus": {
          boxShadow: onClick
            ? `0 0 0 3px ${alpha(colorPalette.main, 0.3)}`
            : undefined,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${colorPalette.main}, ${colorPalette.light})`,
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.3s ease",
        },
        "&:hover": {
          animation: `${floatAnimation} 0.3s ease-out forwards`,
          boxShadow: `0 12px 32px ${alpha(
            colorPalette.main,
            0.25
          )}, 0 2px 8px ${alpha(colorPalette.main, 0.1)}`,
          border: `1px solid ${alpha(colorPalette.main, 0.3)}`,
          "&::before": {
            transform: "scaleX(1)",
          },
        },
      }}
      tabIndex={onClick ? 0 : -1}
      aria-label={ariaLabel}
      role="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => { setHovered(true); setHoverKey(k => k + 1); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Help tooltip in top right corner */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Tooltip
          title={tooltipText}
          placement="top"
          arrow
          PopperProps={{
            sx: {
              "& .MuiTooltip-tooltip": {
                backgroundColor: theme.palette.grey[900],
                color: theme.palette.common.white,
                fontSize: "0.75rem",
                padding: "8px 12px",
                maxWidth: 300,
                boxShadow: theme.shadows[4],
              },
              "& .MuiTooltip-arrow": {
                color: theme.palette.grey[900],
              },
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: alpha(colorPalette.main, 0.6),
              "&:hover": {
                color: colorPalette.main,
                backgroundColor: alpha(colorPalette.main, 0.08),
              },
            }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                backgroundColor: alpha(colorPalette.main, 0.12),
                color: colorPalette.main,
                mr: 1.5,
                position: "relative",
                "&:hover": {
                  animation: `${pulseAnimation} 0.6s ease-in-out infinite`,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  background: `radial-gradient(circle, ${alpha(
                    colorPalette.main,
                    0.2
                  )} 0%, transparent 70%)`,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
                "&:hover::after": {
                  opacity: 1,
                },
              }}
              aria-label={`${title} icon`}
            >
              {icon}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
        {/* Inline editing for Target Attainment */}
        {editableTarget ? (
          <Box>
            {editing ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    backgroundColor: "transparent",
                    width: "100%",
                  }}
                  autoFocus
                />
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <button
                    onClick={() => {
                      if (onTargetEdit && editValue !== undefined) {
                        onTargetEdit(editValue);
                      }
                      setEditing(false);
                    }}
                    style={{
                      background: colorPalette.main,
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    aria-label="Save edit"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditValue(targetValue);
                      setEditing(false);
                    }}
                    style={{
                      background: "transparent",
                      color: theme.palette.text.secondary,
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    lineHeight: 1.2,
                    cursor: "pointer",
                  }}
                  onClick={() => setEditing(true)}
                  aria-label={`Value: ${value} (click to edit)`}
                >
                  {formatValue(value, metricKey)}
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                lineHeight: 1.2,
              }}
              aria-label={`Value: ${value}`}
            >
              {formatValue(value, metricKey)}
            </Typography>
            {/* Sparkline below main value */}
            {sparklineData && sparklineData.length > 1 ? (
              <Box sx={{
                height: 40,
                mt: 1.5,
                mb: 0.5,
                background: "transparent",
                borderRadius: 2,
                transition: "background 0.3s",
              }}>
                <ResponsiveLine
                  key={hoverKey}
                  data={[{ id: 'trend', data: sparklineData }]}
                  theme={{ ...nivoTheme, background: 'transparent' }}
                  margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridX={false}
                  enableGridY={false}
                  colors={[getSparklineColor()]}
                  lineWidth={2.5}
                  pointSize={0}
                  enablePoints={false}
                  enableArea={true}
                  areaOpacity={0.2}
                  isInteractive={false}
                  animate={true}
                  motionConfig="wobbly"
                />
              </Box>
            ) : sparklineData && sparklineData.length === 1 ? (
              // Single data point - show as a small indicator
              <Box sx={{
                height: 40,
                mt: 1.5,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{
                  width: 4,
                  height: 4,
                  backgroundColor: getSparklineColor(),
                  borderRadius: '50%'
                }} />
              </Box>
            ) : (
              // Maintain consistent height even without sparkline
              <Box sx={{
                height: 40,
                mt: 1.5,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.3
              }}>
                <Typography variant="caption" color="text.disabled">
                  No trend data
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
