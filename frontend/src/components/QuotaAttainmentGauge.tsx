import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
} from "@mui/material";
import {
  HelpOutline as HelpOutlineIcon,
  TrendingUp as TrendingUpIcon,
  OpenInFull as OpenInFullIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import { TargetAttainment } from "../types/dashboard";
import { formatKshAbbreviated } from "../lib/numberFormat";
import ExpandableCard from "./ExpandableCard";

interface QuotaAttainmentGaugeProps {
  data: TargetAttainment | undefined;
  isLoading: boolean;
  target: number;
}

const QuotaAttainmentGauge: React.FC<QuotaAttainmentGaugeProps> = ({
  data,
  isLoading,
  target,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <ExpandableCard title="Quota Attainment" minHeight={320}>
        <ChartSkeleton />
      </ExpandableCard>
    );
  }

  if (!data) {
    return (
      <ExpandableCard title="Quota Attainment" minHeight={320}>
        <ChartEmptyState
          message="No Quota Data Available"
          subtitle="Unable to calculate quota attainment. Check if target and sales data are available."
        />
      </ExpandableCard>
    );
  }

  const attainmentPercentage = Math.round(data.attainmentPercentage);
  const salesValue = data.totalSales;

  // Performance bands (red/orange/green)
  const bands = [
    { max: 0.8 * target, color: "#d32f2f" }, // Red: <80%
    { max: target, color: "#fbc02d" },       // Orange: 80-100%
    { max: 1.5 * target, color: "#2e7d32" }, // Green: >100%
  ];

  // Colorblind-friendly, high-contrast colors
  const bandColors = {
    below: '#e15759',   // Red
    near: '#fcbf49',    // Gold
    above: '#59a14f',   // Green
    actual: '#4e79a7',  // Blue
    target: '#bab0ab',  // Gray
  };

  // ECharts option for bullet chart
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number) => formatKshAbbreviated(value),
      formatter: () =>
        `<div style="font-size: 14px;">
          <strong>Quota Attainment</strong><br/>
          <span style='color:${bandColors.actual};font-weight:bold;'>Actual:</span> ${formatKshAbbreviated(salesValue)}<br/>
          <span style='color:${bandColors.target};font-weight:bold;'>Target:</span> ${formatKshAbbreviated(target)}<br/>
          Progress: ${attainmentPercentage}%
        </div>`
    },
    grid: { left: 80, right: 30, top: 40, bottom: 100 },
    legend: {
      data: [
        { name: "Below Target", icon: "rect" },
        { name: "Near Target", icon: "rect" },
        { name: "Above Target", icon: "rect" },
        { name: "Actual", icon: "rect" },
        { name: "Target", icon: "rect" },
      ],
      bottom: 50,
      left: 'center',
      orient: 'horizontal',
      textStyle: { color: theme.palette.mode === 'dark' ? '#fff' : '#333', fontSize: 13 },
      itemWidth: 18,
      itemHeight: 10,
      padding: [8, 0, 0, 0],
      selectedMode: false,
    },
    xAxis: {
      type: "value",
      min: 0,
      max: Math.max(target * 1.5, salesValue * 1.1),
      axisLabel: {
        formatter: (v: number) => formatKshAbbreviated(v),
        color: theme.palette.text.secondary,
      },
      splitLine: { lineStyle: { color: theme.palette.divider } },
    },
    yAxis: {
      type: "category",
      data: [""],
      show: false,
    },
    series: [
      // Performance bands as background bars
      {
        name: "Below Target",
        type: "bar" as const,
        barGap: "-100%",
        barWidth: 30,
        data: [0.8 * target],
        itemStyle: { color: bandColors.below, opacity: 0.5 },
        z: 0,
        silent: true,
      },
      {
        name: "Near Target",
        type: "bar" as const,
        barGap: "-100%",
        barWidth: 30,
        data: [target - 0.8 * target],
        itemStyle: { color: bandColors.near, opacity: 0.5 },
        z: 1,
        stack: "bands",
        silent: true,
      },
      {
        name: "Above Target",
        type: "bar" as const,
        barGap: "-100%",
        barWidth: 30,
        data: [0.5 * target],
        itemStyle: { color: bandColors.above, opacity: 0.5 },
        z: 2,
        stack: "bands",
        silent: true,
      },
      // Target bar (background)
      {
        name: "Target",
        type: "bar" as const,
        barGap: "-100%",
        barWidth: 18,
        data: [target],
        itemStyle: { color: bandColors.target, opacity: 0.8 },
        z: 10,
        silent: true,
        label: {
          show: true,
          position: [0, -40],
          formatter: () => `Target: ${formatKshAbbreviated(target)}`,
          color: bandColors.target,
          fontWeight: "bold",
          fontSize: 12,
          padding: [0, 0, 0, 0],
        },
      },
      // Actual sales bar (foreground)
      {
        name: "Actual",
        type: "bar" as const,
        data: [salesValue],
        barWidth: 18,
        itemStyle: { color: bandColors.actual },
        z: 20,
        label: {
          show: true,
          position: 'right',
          formatter: () => `Actual: ${formatKshAbbreviated(salesValue)}`,
          fontWeight: "bold",
          fontSize: 13,
          color: bandColors.actual,
          padding: [0, 0, 0, 8],
        },
      },
    ],
    markLine: {
      symbol: 'none',
      data: [
        { xAxis: target, label: { show: false } }
      ],
      lineStyle: {
        color: bandColors.target,
        width: 2,
        type: 'solid',
      },
      z: 30,
    },
  };

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This bullet chart shows your sales progress toward the quota target. The colored bands represent performance zones:
      </Typography>
      <ul>
        <li><span style={{ color: '#e15759', fontWeight: 600 }}>Red</span>: Below 80% of target</li>
        <li><span style={{ color: '#fcbf49', fontWeight: 600 }}>Gold</span>: 80-100% of target</li>
        <li><span style={{ color: '#59a14f', fontWeight: 600 }}>Green</span>: Above target</li>
      </ul>
      <Typography gutterBottom>
        The vertical line marks your quota target. The blue bar shows actual sales. Hover for details.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Quota Attainment" infoContent={infoContent} minHeight={320}>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 200 }}>
        <ReactECharts
          option={option}
          style={{ height: "120px", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
        <Box sx={{ mt: 1, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Sales: {formatKshAbbreviated(salesValue)} of {formatKshAbbreviated(target)} target
          </Typography>
        </Box>
      </Box>
    </ExpandableCard>
  );
};

export default QuotaAttainmentGauge;
