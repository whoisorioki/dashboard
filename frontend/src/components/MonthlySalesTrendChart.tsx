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

  // Transform data for combination chart
  const chartData = data.map((d) => ({
    date: d.date,
    totalSales: d.totalSales ?? 0,
    grossProfit: d.grossProfit ?? 0,
  }));

  // Create line data for gross profit
  const lineData = [
    {
      id: 'grossProfit',
      data: chartData.map(d => ({ x: d.date, y: d.grossProfit }))
    }
  ];

  // Info content for modal
  const infoContent = (
    <>
      <Typography gutterBottom>
        This combination chart shows sales (bars) and gross profit (line) over time. The relationship between sales growth and profit growth is immediately visible.
        Hover over data points to see detailed values for each period.
      </Typography>
    </>
  );

  return (
    <ExpandableCard title="Sales vs. Profit Trend" infoContent={infoContent} minHeight={500}>
      <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
        {/* Bar chart for total sales */}
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
          label={() => ''} // <--- This line suppresses all bar labels
          tooltip={({ indexValue, data }) => (
            <Box
              sx={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                boxShadow: theme.shadows[8],
                minWidth: 220,
                maxWidth: 280,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: theme.palette.primary.main
                }}
              >
                {indexValue}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Sales Bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: totalSalesColor,
                        borderRadius: 2,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Total Sales
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {formatKshAbbreviated(data.totalSales as number)}
                  </Typography>
                </Box>

                {/* Profit Line */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: grossProfitColor,
                        borderRadius: '50%',
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Gross Profit
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: grossProfitColor
                    }}
                  >
                    {formatKshAbbreviated(data.grossProfit as number)}
                  </Typography>
                </Box>

                {/* Profit Margin */}
                {(data.totalSales as number) > 0 && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 1,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Profit Margin
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: grossProfitColor
                      }}
                    >
                      {(((data.grossProfit as number) / (data.totalSales as number)) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          enableGridX={false}
          enableGridY={false}
          layers={['axes', 'bars', 'markers', 'legends']}
        />

        {/* Overlay line chart for gross profit */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}>
          <ResponsiveLine
            data={lineData}
            margin={{ top: 30, right: 60, bottom: 50, left: 70 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            axisTop={null}
            axisRight={null}
            axisBottom={null}
            axisLeft={null}
            enableGridX={false}
            enableGridY={false}
            colors={[grossProfitColor]}
            lineWidth={3}
            pointSize={6}
            pointColor={grossProfitColor}
            pointBorderWidth={2}
            pointBorderColor="#fff"
            enablePoints={true}
            enableArea={false}
            isInteractive={false}
            animate={true}
            motionConfig="gentle"
          />
        </Box>
      </Box>
    </ExpandableCard>
  );
};

export default MonthlySalesTrendChart;
