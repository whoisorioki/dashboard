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
      <Tooltip title={tooltipText} arrow>
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: editableTarget ? 40 : 8,
            zIndex: 1,
            color: alpha(colorPalette.main, 0.6),
            "&:hover": {
              color: colorPalette.main,
              backgroundColor: alpha(colorPalette.main, 0.1),
            },
          }}
          aria-label={`Help: ${title}`}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {/* Inline edit icon for Target Attainment */}
      {editableTarget && !editing && (
        <Tooltip title="Edit sales target" arrow>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              color: alpha(colorPalette.main, 0.6),
            }}
            aria-label="Edit sales target"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        </Tooltip>
      )}
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
        {editableTarget && editing ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <input
              type="number"
              value={editValue ?? ""}
              onChange={(e) => setEditValue(e.target.value)}
              aria-label="Edit sales target"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                width: 100,
                marginRight: 8,
                borderRadius: 4,
                border: `1px solid ${colorPalette.main}`,
                padding: "4px 8px",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(false);
                if (onTargetEdit) onTargetEdit(editValue ?? 0);
              }}
              style={{
                background: colorPalette.main,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "4px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              aria-label="Save sales target"
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(false);
                setEditValue(targetValue);
              }}
              style={{
                background: "transparent",
                color: colorPalette.main,
                border: `1px solid ${colorPalette.main}`,
                borderRadius: 4,
                padding: "4px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              aria-label="Cancel edit"
            >
              Cancel
            </button>
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
              {metricKey && ["sales", "totalSales", "grossProfit", "avgDealSize", "averageDealSize", "target", "targetValue"].includes(metricKey)
                ? formatKshAbbreviated(Number(value))
                : value}
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
            ) : (
              // Maintain consistent height even without sparkline
              <Box sx={{ height: 40, mt: 1.5, mb: 0.5 }} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
