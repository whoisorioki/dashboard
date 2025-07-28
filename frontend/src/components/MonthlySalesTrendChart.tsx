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
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const totalSalesColor = theme.palette.primary.main;
  const grossProfitColor = theme.palette.success.main;
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
    <ExpandableCard title="Monthly Sales Trend" infoContent={infoContent} minHeight={500}>
      <Box sx={{ height: 500, width: '100%' }}>
        <ResponsiveBar
          data={chartData}
          keys={['totalSales']}
          indexBy="date"
          margin={{ top: 30, right: 60, bottom: 50, left: 70 }}
          padding={0.3}
          theme={nivoTheme}
          colors={[totalSalesColor]}
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
          tooltip={({ indexValue, data }) => (
            <Box p={1}>
              <strong>Period: {indexValue}</strong><br />
              Total Sales: {formatKshAbbreviated(data.totalSales as number)}<br />
              Gross Profit: <span style={{ color: grossProfitColor }}>{formatKshAbbreviated(data.grossProfit as number)}</span>
            </Box>
          )}
          enableGridX={false}
          enableGridY={false}
          layers={['axes', 'bars', 'markers', 'legends',
            // Custom layer for grossProfit line
            (props) => {
              const { bars, xScale, yScale } = props;
              const linePoints = chartData.map((d, i) => [
                (xScale(i) as number) + ((xScale as any).bandwidth ? (xScale as any).bandwidth() / 2 : 0),
                yScale(d.grossProfit)
              ]);
              return (
                <g>
                  <polyline
                    fill="none"
                    stroke={grossProfitColor}
                    strokeWidth={3}
                    points={linePoints.map(([x, y]) => `${x},${y}`).join(' ')}
                  />
                  {linePoints.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={4} fill={grossProfitColor} />
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
