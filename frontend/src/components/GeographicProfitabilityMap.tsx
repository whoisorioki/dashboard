import React, { useMemo } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import { Box, useTheme, CircularProgress } from '@mui/material';
import ChartCard from './ChartCard';
import { formatKshAbbreviated, formatPercentage } from '../lib/numberFormat';
import type { DashboardDataQuery } from '../types/graphql';

// Use placeholder hook for now
const useKenyaGeoJson = () => ({
    geoJsonData: null,
    loading: false,
    error: null
});

interface GeographicProfitabilityMapProps {
    data?: DashboardDataQuery['dashboardData']['profitabilityByDimension'];
    isLoading?: boolean;
    error?: Error | null;
}

// Mapping of branches to their respective counties
const branchToCountyMap: Record<string, string> = {
    'Nairobi CBD': 'NAIROBI',
    'Westlands': 'NAIROBI',
    'Karen': 'NAIROBI',
    'Eastleigh': 'NAIROBI',
    'Thika': 'KIAMBU',
    'Kiambu': 'KIAMBU',
    'Limuru': 'KIAMBU',
    'Mombasa': 'MOMBASA',
    'Kisumu': 'KISUMU',
    'Nakuru': 'NAKURU',
    'Eldoret': 'UASIN GISHU',
    'Meru': 'MERU',
    'Nyeri': 'NYERI',
    'Machakos': 'MACHAKOS',
    'Kitui': 'KITUI',
    'Garissa': 'GARISSA',
    'Malindi': 'KILIFI',
    'Lamu': 'LAMU',
    'Isiolo': 'ISIOLO',
    'Marsabit': 'MARSABIT',
    'Turkana': 'TURKANA',
    'Mandera': 'MANDERA'
};

const GeographicProfitabilityMap: React.FC<GeographicProfitabilityMapProps> = ({
    data = [],
    isLoading = false,
    error = null
}) => {
    const theme = useTheme();
    const { geoJsonData, loading: geoLoading, error: geoError } = useKenyaGeoJson();

    // Transform profitability data by aggregating branches into counties
    const countyData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const countyMap = new Map<string, { grossProfit: number, grossMargin: number, count: number }>();

        data.forEach(item => {
            if (!item.branch || item.grossProfit === null || item.grossProfit === undefined) return;

            const county = branchToCountyMap[item.branch];
            if (!county) return;

            const existing = countyMap.get(county) || { grossProfit: 0, grossMargin: 0, count: 0 };
            const margin = item.grossMargin || 0;

            countyMap.set(county, {
                grossProfit: existing.grossProfit + item.grossProfit,
                grossMargin: existing.grossMargin + margin,
                count: existing.count + 1
            });
        });

        return Array.from(countyMap.entries()).map(([county, stats]) => ({
            id: county,
            value: stats.grossMargin / stats.count, // Use average gross margin as the primary metric
            grossProfit: stats.grossProfit,
            averageMargin: (stats.grossMargin / stats.count) * 100 // Convert to percentage
        }));
    }, [data]);

    const combinedLoading = isLoading || geoLoading;
    const combinedError = error || geoError;
    const isEmpty = !geoJsonData || countyData.length === 0;

    return (
        <ChartCard
            title="Geographic Profitability (Gross Margin %)"
            isLoading={combinedLoading}
            error={combinedError}
            empty={isEmpty}
        >
            {!isEmpty && geoJsonData ? (
                <Box height={400}>
                    <ResponsiveChoropleth
                        data={countyData}
                        features={geoJsonData.features || []}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        colors="nivo"
                        domain={[0, Math.max(...countyData.map(d => d.value))]}
                        unknownColor={theme.palette.grey[200]}
                        label="properties.COUNTY_NAM"
                        match="properties.COUNTY_NAM"
                        valueFormat=".2s"
                        projectionScale={1200}
                        projectionTranslation={[0.5, 0.5]}
                        projectionRotation={[0, 0, 0]}
                        enableGraticule={false}
                        borderWidth={0.5}
                        borderColor={theme.palette.divider}
                        tooltip={({ feature }) => {
                            const countyName = (feature as any).properties?.COUNTY_NAM;
                            const featureData = countyData.find(d => d.id === countyName);
                            return (
                                <div
                                    style={{
                                        background: theme.palette.background.paper,
                                        padding: '12px 16px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 4,
                                        boxShadow: theme.shadows[4],
                                    }}
                                >
                                    <strong>{countyName || 'Unknown'}</strong>
                                    <br />
                                    Gross Margin: {formatPercentage(featureData?.averageMargin, { decimals: 1, showBadge: true })}
                                    <br />
                                    Gross Profit: {formatKshAbbreviated(featureData?.grossProfit || 0)}
                                </div>
                            );
                        }}
                        theme={{
                            background: theme.palette.background.default,
                            text: {
                                fill: theme.palette.text.primary,
                            },
                        }}
                    />
                </Box>
            ) : (
                <Box height={400} display="flex" alignItems="center" justifyContent="center">
                    {combinedLoading ? (
                        <CircularProgress />
                    ) : (
                        <div>Geographic data coming soon</div>
                    )}
                </Box>
            )}
        </ChartCard>
    );
};

export default GeographicProfitabilityMap;
