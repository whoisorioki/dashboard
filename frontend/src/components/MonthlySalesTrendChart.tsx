import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import ChartSkeleton from "./skeletons/ChartSkeleton";
import ChartEmptyState from "./states/ChartEmptyState";
import ReactECharts from "echarts-for-react";
import { MonthlySalesGrowth } from "../types/graphql";
import { formatKshAbbreviated } from "../lib/numberFormat";
import ExpandableCard from "./ExpandableCard";
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { useNivoTheme } from '../hooks/useNivoTheme';

interface MonthlySalesTrendChartProps {
  data: MonthlySalesGrowth[] | undefined;
  isLoading: boolean;
}

const MonthlySalesTrendChart: React.FC<MonthlySalesTrendChartProps> = ({
  data = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <ExpandableCard title="Monthly Sales Trend" minHeight={300}>
        <ChartSkeleton />
      </ExpandableCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ExpandableCard title="Monthly Sales Trend" minHeight={300}>
        <ChartEmptyState
          message="No Sales Data Available"
          subtitle="There are no sales records for the selected time period. Try adjusting your date range or check if data has been properly recorded."
        />
      </ExpandableCard>
    );
  }

  // Prepare data for Nivo Combination Chart
  const nivoTheme = useNivoTheme();
  const chartData = data.map((d) => ({
    date: d.date,
    totalSales: d.totalSales ?? 0,
    grossProfit: d.grossProfit ?? 0,
  }));

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This combination chart shows sales (bars) and gross profit (line) over time. Hover over data points to see detailed values for each period.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Monthly Sales Trend" infoContent={infoContent} minHeight={300}>
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveBar
          data={chartData}
          keys={['totalSales']}
          indexBy="date"
          margin={{ top: 30, right: 60, bottom: 50, left: 70 }}
          padding={0.3}
          theme={nivoTheme}
          colors={[nivoTheme.textColor || '#1976d2']}
          axisBottom={{
            tickRotation: 0,
            legend: 'Date',
            legendPosition: 'middle',
            legendOffset: 36,
          }}
          axisLeft={{
            format: formatKshAbbreviated,
            legend: 'Sales (KSh)',
            legendPosition: 'middle',
            legendOffset: -50,
          }}
          tooltip={({ indexValue, value }) => (
            <Box p={1}>
              <strong>Period: {indexValue}</strong><br />
              Sales Revenue: {formatKshAbbreviated(value as number)}
            </Box>
          )}
          layers={['grid', 'axes', 'bars', 'markers', 'legends',
            // Custom layer for grossProfit line
            (props) => {
              const { bars, xScale, yScale } = props;
              const linePoints = chartData.map((d) => [
                xScale(d.date) + xScale.bandwidth() / 2,
                yScale(d.grossProfit)
              ]);
              return (
                <g>
                  <polyline
                    fill="none"
                    stroke="#ff9800"
                    strokeWidth={3}
                    points={linePoints.map(([x, y]) => `${x},${y}`).join(' ')}
                  />
                  {linePoints.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={4} fill="#ff9800" />
                  ))}
                </g>
              );
            }
          ]}
        />
      </Box>
    </ExpandableCard>
  );
};

export default MonthlySalesTrendChart;
