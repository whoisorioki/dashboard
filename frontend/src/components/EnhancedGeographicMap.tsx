import React, { useMemo } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import { Box, useTheme, CircularProgress, Chip, Stack } from '@mui/material';
import ChartCard from './ChartCard';
import type { DashboardData } from '../types/dashboard';
import { useKenyaGeoJson } from '../hooks/useKenyaGeoJson';
import { enhancedBranchMapping, getBranchCounty, getBranchCoordinates } from '../utils/locationMapping';

interface EnhancedGeographicMapProps {
    data?: any[];
    isLoading?: boolean;
    error?: Error | null;
}

const EnhancedGeographicMap: React.FC<EnhancedGeographicMapProps> = ({
    data = [],
    isLoading = false,
    error = null
}) => {
    const theme = useTheme();
    const { geoJsonData, loading: geoLoading, error: geoError } = useKenyaGeoJson();

    // Transform data with enhanced branch information
    const { countyData, branchMarkers } = useMemo(() => {
        console.log('Processing enhanced geographic data:', data);

        if (!data || data.length === 0) {
            return { countyData: [], branchMarkers: [] };
        }

        const countyMap = new Map();
        const markers: Array<{
            id: string;
            coordinates: [number, number];
            branch: string;
            county: string;
            grossProfit: number;
            address?: string;
        }> = [];

        data.forEach(item => {
            if (!item.branch || item.grossProfit === null) return;

            const county = getBranchCounty(item.branch);
            const coordinates = getBranchCoordinates(item.branch);

            if (county) {
                // County aggregation
                const existing = countyMap.get(county) || { grossProfit: 0, count: 0, branches: [] };
                countyMap.set(county, {
                    grossProfit: existing.grossProfit + item.grossProfit,
                    count: existing.count + 1,
                    branches: [...existing.branches, item.branch]
                });

                // Branch markers with coordinates
                if (coordinates) {
                    markers.push({
                        id: `${item.branch}-${county}`,
                        coordinates,
                        branch: item.branch,
                        county,
                        grossProfit: item.grossProfit,
                        address: enhancedBranchMapping[item.branch]?.address
                    });
                }
            }
        });

        const counties = Array.from(countyMap.entries()).map(([county, stats]) => ({
            id: county,
            value: stats.grossProfit,
            averageProfit: stats.grossProfit / stats.count,
            branchCount: stats.count,
            branches: stats.branches
        }));

        return { countyData: counties, branchMarkers: markers };
    }, [data]);

    const combinedLoading = isLoading || geoLoading;
    const combinedError = error || geoError;
    const isEmpty = !geoJsonData || countyData.length === 0;

    // Color domain calculation
    const getColorDomain = (data: typeof countyData) => {
        if (data.length === 0) return [0, 1];
        const values = data.map(d => d.value).sort((a, b) => a - b);
        const q75 = values[Math.floor(values.length * 0.75)] || Math.max(...values);
        return [Math.min(...values), q75 * 1.2];
    };

    // Format currency values
    const formatValue = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toFixed(0);
    };

    return (
        <ChartCard
            title="Enhanced Geographic Distribution"
            isLoading={combinedLoading}
            error={combinedError}
            empty={isEmpty}
        >
            {geoJsonData ? (
                <Box>
                    {/* Branch Summary */}
                    <Box mb={2}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                                label={`${branchMarkers.length} Branches Mapped`}
                                color="primary"
                                size="small"
                            />
                            <Chip
                                label={`${countyData.length} Counties Active`}
                                color="secondary"
                                size="small"
                            />
                            <Chip
                                label={`KSh ${formatValue(countyData.reduce((sum, c) => sum + c.value, 0))} Total`}
                                color="success"
                                size="small"
                            />
                        </Stack>
                    </Box>

                    {/* Enhanced Map */}
                    <Box height={500} position="relative">
                        <ResponsiveChoropleth
                            data={countyData}
                            features={geoJsonData.features || []}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            colors={['#f8f9fa', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0']}
                            domain={getColorDomain(countyData)}
                            unknownColor={theme.palette.grey[100]}
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
                                const featureData = countyData.find(d => d.id === countyName);
                                const countyBranches = branchMarkers.filter(b => b.county === countyName);

                                return (
                                    <div
                                        style={{
                                            background: theme.palette.background.paper,
                                            padding: '12px 16px',
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 8,
                                            boxShadow: theme.shadows[4],
                                            fontSize: '0.875rem',
                                            maxWidth: '280px',
                                        }}
                                    >
                                        <div style={{
                                            fontWeight: 600,
                                            marginBottom: '8px',
                                            color: featureData ? theme.palette.primary.main : theme.palette.text.secondary,
                                            fontSize: '1rem'
                                        }}>
                                            {countyName || 'Unknown County'}
                                        </div>

                                        {featureData ? (
                                            <>
                                                <div style={{ marginBottom: '6px' }}>
                                                    <strong>Gross Profit:</strong> KSh {formatValue(featureData.value)}
                                                </div>
                                                <div style={{ marginBottom: '6px' }}>
                                                    <strong>Branches:</strong> {featureData.branchCount}
                                                </div>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <strong>Avg per Branch:</strong> KSh {formatValue(featureData.averageProfit)}
                                                </div>

                                                {countyBranches.length > 0 && (
                                                    <div style={{
                                                        borderTop: `1px solid ${theme.palette.divider}`,
                                                        paddingTop: '8px',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                                            Branch Locations:
                                                        </div>
                                                        {countyBranches.slice(0, 3).map(branch => (
                                                            <div key={branch.id} style={{
                                                                marginBottom: '2px',
                                                                color: theme.palette.text.secondary
                                                            }}>
                                                                • {branch.branch}: KSh {formatValue(branch.grossProfit)}
                                                            </div>
                                                        ))}
                                                        {countyBranches.length > 3 && (
                                                            <div style={{
                                                                fontStyle: 'italic',
                                                                color: theme.palette.text.disabled
                                                            }}>
                                                                +{countyBranches.length - 3} more branches
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{
                                                fontStyle: 'italic',
                                                color: theme.palette.text.disabled
                                            }}>
                                                No branch operations
                                            </div>
                                        )}
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

                        {/* Branch Markers Overlay (Optional) */}
                        {/* This would require custom SVG overlay for precise positioning */}
                    </Box>

                    {/* Branch Details Table */}
                    <Box mt={2} maxHeight={200} overflow="auto">
                        <div style={{
                            fontSize: '0.875rem',
                            color: theme.palette.text.secondary
                        }}>
                            <strong>Mapped Branches with Google Coordinates:</strong>
                        </div>
                        {branchMarkers.slice(0, 5).map(marker => (
                            <div key={marker.id} style={{
                                padding: '4px 8px',
                                borderLeft: `3px solid ${theme.palette.primary.main}`,
                                marginTop: '4px',
                                backgroundColor: theme.palette.action.hover,
                                fontSize: '0.8rem'
                            }}>
                                <div style={{ fontWeight: 500 }}>
                                    {marker.branch} ({marker.county})
                                </div>
                                <div style={{ color: theme.palette.text.secondary }}>
                                    📍 {marker.coordinates[1].toFixed(4)}, {marker.coordinates[0].toFixed(4)} |
                                    💰 KSh {formatValue(marker.grossProfit)}
                                </div>
                                {marker.address && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: theme.palette.text.disabled
                                    }}>
                                        {marker.address}
                                    </div>
                                )}
                            </div>
                        ))}
                        {branchMarkers.length > 5 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '8px',
                                fontStyle: 'italic',
                                color: theme.palette.text.disabled
                            }}>
                                +{branchMarkers.length - 5} more branches with coordinates
                            </div>
                        )}
                    </Box>
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

export default EnhancedGeographicMap;
