import React, { useMemo } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import { Box, useTheme, CircularProgress } from '@mui/material';
import ChartCard from './ChartCard';
import type { DashboardDataQuery } from '../types/graphql';
import { useKenyaGeoJson } from '../hooks/useKenyaGeoJson';
import { enhancedBranchMapping, getBranchCounty, isBranchMapped } from '../utils/locationMapping';

interface GeographicProfitabilityMapProps {
    data?: DashboardDataQuery['dashboardData']['profitabilityByDimension'];
    isLoading?: boolean;
    error?: Error | null;
}const GeographicProfitabilityMap: React.FC<GeographicProfitabilityMapProps> = ({
    data = [],
    isLoading = false,
    error = null
}) => {
    const theme = useTheme();
    const { geoJsonData, loading: geoLoading, error: geoError } = useKenyaGeoJson();

    // Transform profitability data by aggregating branches into counties
    const countyData = useMemo(() => {
        console.log('Raw data received:', data);

        if (!data || data.length === 0) {
            console.log('No data available');
            return [];
        }

        const countyMap = new Map<string, { grossProfit: number, count: number, branches: string[] }>();

        data.forEach(item => {
            console.log('Processing item:', item);

            if (!item.branch || item.grossProfit === null || item.grossProfit === undefined) {
                console.log('Skipping item due to missing branch or grossProfit:', item);
                return;
            }

            // Use enhanced mapping
            const county = getBranchCounty(item.branch);
            console.log(`Branch "${item.branch}" maps to county "${county}" (mapped: ${isBranchMapped(item.branch)})`);

            if (!county) {
                console.log(`No county mapping found for branch: ${item.branch}`);
                // Log all available branches for debugging
                console.log('Available branches:', Object.keys(enhancedBranchMapping));
                return;
            }

            const existing = countyMap.get(county) || { grossProfit: 0, count: 0, branches: [] };
            countyMap.set(county, {
                grossProfit: existing.grossProfit + item.grossProfit,
                count: existing.count + 1,
                branches: [...existing.branches, item.branch]
            });
        }); const result = Array.from(countyMap.entries()).map(([county, stats]) => ({
            id: county,
            value: stats.grossProfit,
            averageProfit: stats.grossProfit / stats.count,
            branchCount: stats.count,
            branches: stats.branches
        }));

        console.log('Final processed County Data:', result);
        console.log('GeoJSON counties available:', geoJsonData?.features?.map(f => f.properties?.COUNTY_NAM));

        return result;
    }, [data, geoJsonData]);

    const combinedLoading = isLoading || geoLoading;
    const combinedError = error || geoError;
    const isEmpty = !geoJsonData || countyData.length === 0;

    // Temporary test data to verify map rendering
    const testData = [
        { id: 'NAIROBI', value: 1000000, averageProfit: 1000000, branchCount: 1, branches: ['Nairobi trading'] },
        { id: 'MOMBASA', value: 750000, averageProfit: 750000, branchCount: 1, branches: ['Mombasa trading'] },
        { id: 'KISUMU', value: 500000, averageProfit: 500000, branchCount: 1, branches: ['Kisumu trading'] }
    ];

    // Use test data if no real data available for debugging
    const dataToUse = countyData.length > 0 ? countyData : testData;

    // Improve color visibility by using percentile-based domain
    const getColorDomain = (data: typeof dataToUse) => {
        if (data.length === 0) return [0, 1];

        const values = data.map(d => d.value).sort((a, b) => a - b);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Use a smaller range to make lower values more visible
        // This prevents one large value from making all others invisible
        const q75 = values[Math.floor(values.length * 0.75)] || max;

        return [min, q75 * 1.2]; // Use 75th percentile * 1.2 as max for better visibility
    };

    return (
        <ChartCard
            title="Geographic Profitability Distribution"
            isLoading={combinedLoading}
            error={combinedError}
            empty={isEmpty}
        >
            {geoJsonData ? (
                <Box height={500}>
                    <ResponsiveChoropleth
                        data={dataToUse}
                        features={geoJsonData.features || []}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        colors={['#f8f9fa', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0']}
                        domain={getColorDomain(dataToUse)}
                        unknownColor={theme.palette.grey[200]}
                        label="properties.COUNTY_NAM"
                        match="properties.COUNTY_NAM"
                        valueFormat=".2s"
                        projectionScale={2800}
                        projectionTranslation={[0.5, 0.5]}
                        projectionRotation={[-37, 0, 0]}
                        enableGraticule={false}
                        borderWidth={1}
                        borderColor={theme.palette.divider}
                        tooltip={({ feature }) => {
                            const countyName = (feature as any).properties?.COUNTY_NAM;
                            const featureData = dataToUse.find(d => d.id === countyName);

                            // Format value in monthly sales format (millions/thousands)
                            const formatValue = (val: number) => {
                                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                                if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                                return val.toFixed(0);
                            };

                            return (
                                <div
                                    style={{
                                        background: theme.palette.background.paper,
                                        padding: '8px 12px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 6,
                                        boxShadow: theme.shadows[3],
                                        fontSize: '0.85rem',
                                        maxWidth: '200px',
                                    }}
                                >
                                    <div style={{
                                        fontWeight: 600,
                                        marginBottom: '4px',
                                        color: featureData ? theme.palette.primary.main : theme.palette.text.secondary
                                    }}>
                                        {countyName || 'Unknown County'}
                                    </div>
                                    <div style={{
                                        color: theme.palette.text.secondary,
                                        fontSize: '0.8rem'
                                    }}>
                                        {featureData ? (
                                            <>
                                                Gross Profit: <span style={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                                    KSh {formatValue(featureData.value)}
                                                </span>
                                                {featureData.branchCount && (
                                                    <>
                                                        <br />
                                                        Branches: <span style={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                                            {featureData.branchCount}
                                                        </span>
                                                        {featureData.averageProfit && (
                                                            <>
                                                                <br />
                                                                Avg per Branch: <span style={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                                                    KSh {formatValue(featureData.averageProfit)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', color: theme.palette.text.disabled }}>
                                                No branch operations
                                            </span>
                                        )}
                                    </div>
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
                <Box height={500} display="flex" alignItems="center" justifyContent="center">
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
