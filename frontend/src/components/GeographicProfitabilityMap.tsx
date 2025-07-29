import React, { useMemo, useEffect, useState } from "react";
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
import ExpandableCard from "./ExpandableCard";
import { ResponsiveChoropleth } from '@nivo/geo';
import { useNivoTheme } from '../hooks/useNivoTheme';
import { useTheme } from '@mui/material/styles';
import { formatKshAbbreviated } from "../lib/numberFormat";
// Fetch GeoJSON from public directory to avoid Vite/TS import issues
const useKenyaGeoJson = () => {
    const [geoJson, setGeoJson] = useState<any>(null);
    useEffect(() => {
        fetch('/kenya.geojson')
            .then((res) => res.json())
            .then(setGeoJson)
            .catch(() => setGeoJson(null));
    }, []);
    return geoJson;
};

// Kenya counties GeoJSON data with proper coordinates for visualization
const kenyaCounties = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "Nairobi" },
            id: "Nairobi",
            geometry: {
                type: "Polygon",
                coordinates: [[[36.7, -1.4], [37.0, -1.4], [37.0, -1.1], [36.7, -1.1], [36.7, -1.4]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Mombasa" },
            id: "Mombasa",
            geometry: {
                type: "Polygon",
                coordinates: [[[39.5, -4.2], [39.8, -4.2], [39.8, -3.9], [39.5, -3.9], [39.5, -4.2]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Kisumu" },
            id: "Kisumu",
            geometry: {
                type: "Polygon",
                coordinates: [[[34.6, -0.2], [34.9, -0.2], [34.9, 0.1], [34.6, 0.1], [34.6, -0.2]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Nakuru" },
            id: "Nakuru",
            geometry: {
                type: "Polygon",
                coordinates: [[[35.9, -0.4], [36.2, -0.4], [36.2, -0.1], [35.9, -0.1], [35.9, -0.4]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Eldoret" },
            id: "Eldoret",
            geometry: {
                type: "Polygon",
                coordinates: [[[35.1, 0.4], [35.4, 0.4], [35.4, 0.7], [35.1, 0.7], [35.1, 0.4]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Thika" },
            id: "Thika",
            geometry: {
                type: "Polygon",
                coordinates: [[[36.9, -1.1], [37.2, -1.1], [37.2, -0.8], [36.9, -0.8], [36.9, -1.1]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Bungoma" },
            id: "Bungoma",
            geometry: {
                type: "Polygon",
                coordinates: [[[34.4, 0.4], [34.7, 0.4], [34.7, 0.7], [34.4, 0.7], [34.4, 0.4]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Kisii" },
            id: "Kisii",
            geometry: {
                type: "Polygon",
                coordinates: [[[34.6, -0.8], [34.9, -0.8], [34.9, -0.5], [34.6, -0.5], [34.6, -0.8]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Kitale" },
            id: "Kitale",
            geometry: {
                type: "Polygon",
                coordinates: [[[34.9, 0.9], [35.2, 0.9], [35.2, 1.2], [34.9, 1.2], [34.9, 0.9]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Kitengela" },
            id: "Kitengela",
            geometry: {
                type: "Polygon",
                coordinates: [[[36.7, -1.6], [37.0, -1.6], [37.0, -1.3], [36.7, -1.3], [36.7, -1.6]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Malindi" },
            id: "Malindi",
            geometry: {
                type: "Polygon",
                coordinates: [[[40.0, -3.3], [40.3, -3.3], [40.3, -3.0], [40.0, -3.0], [40.0, -3.3]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Voi" },
            id: "Voi",
            geometry: {
                type: "Polygon",
                coordinates: [[[38.4, -3.5], [38.7, -3.5], [38.7, -3.2], [38.4, -3.2], [38.4, -3.5]]]
            }
        }
    ]
};

// Branch to county mapping based on the map.md file
const branchToCountyMap: Record<string, string> = {
    'Bungoma': 'Bungoma',
    'Doosan': 'Nairobi',
    'Eldoret': 'Eldoret',
    'Engineering': 'Nairobi',
    'Garmins': 'Nairobi',
    'IR': 'Nairobi',
    'Kisii': 'Kisii',
    'Kisumu trading': 'Kisumu',
    'Kitale': 'Kitale',
    'Kitengela': 'Kitengela',
    'Kubota': 'Nairobi',
    'Lease': 'Nairobi',
    'MRF': 'Nairobi',
    'Malindi': 'Malindi',
    'Mombasa trading': 'Mombasa',
    'Nairobi trading': 'Nairobi',
    'Nakuru Distribution': 'Nakuru',
    'Nakuru trading': 'Nakuru',
    'Thika': 'Thika',
    'Toyota': 'Nairobi',
    'Voi': 'Voi',
    'Unknown': 'Nairobi'
};

interface ProfitabilityByDimensionEntry {
    branch?: string;
    grossProfit?: number;
    grossMargin?: number;
}

interface GeographicProfitabilityMapProps {
    data: ProfitabilityByDimensionEntry[];
    isLoading: boolean;
}

const GeographicProfitabilityMap: React.FC<GeographicProfitabilityMapProps> = ({
    data = [],
    isLoading,
}) => {
    const theme = useTheme();
    const nivoTheme = useNivoTheme();

    // Use imported Kenya GeoJSON directly
    const geoJson = useKenyaGeoJson();

    // Transform data to county-level aggregation (uppercase IDs)
    const countyData = useMemo(() => {
        const countyMap = new Map<string, { grossProfit: number; branchCount: number }>();
        data.forEach(entry => {
            const county = branchToCountyMap[entry.branch || ''];
            if (county) {
                const countyUpper = county.toUpperCase();
                const existing = countyMap.get(countyUpper) || { grossProfit: 0, branchCount: 0 };
                countyMap.set(countyUpper, {
                    grossProfit: existing.grossProfit + (entry.grossProfit || 0),
                    branchCount: existing.branchCount + 1
                });
            }
        });
        return Array.from(countyMap.entries())
            .filter(([county, data]) => county && data.grossProfit !== undefined)
            .map(([county, data]) => ({
                id: county,
                value: data.grossProfit,
                branchCount: data.branchCount
            }));
    }, [data]);

    if (isLoading || !geoJson) {
        return (
            <ExpandableCard title="Geographic Profitability" minHeight={400}>
                <ChartSkeleton />
            </ExpandableCard>
        );
    }

    if (!data || data.length === 0) {
        return (
            <ExpandableCard title="Geographic Profitability" minHeight={400}>
                <ChartEmptyState
                    message="No Geographic Data Available"
                    subtitle="There are no profitability records for the selected time period. Try adjusting your date range or check if data has been properly recorded."
                />
            </ExpandableCard>
        );
    }

    // Info content for modal
    const infoContent = (
        <>
            <Typography gutterBottom>
                This choropleth map shows gross profit by county across Kenya. Darker shades indicate higher profitability.
                Hover over counties to see detailed profit figures and branch count.
            </Typography>
        </>
    );

    console.log('countyData', countyData); // Debug: print the data passed to the map
    return (
        <ExpandableCard title="Geographic Profitability" infoContent={infoContent} minHeight={500}>
            <Box sx={{ height: 500, width: '100%' }}>
                <ResponsiveChoropleth
                    key={`choropleth-${countyData.length}`}
                    data={countyData}
                    features={geoJson.features}
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    colors="blues"
                    domain={[0, Math.max(...countyData.map(d => d.value))]}
                    unknownColor="#eee"
                    label="properties.COUNTY_NAME"
                    valueFormat={formatKshAbbreviated}
                    projectionScale={600}
                    projectionTranslation={[0.5, 0.5]}
                    projectionRotation={[0, 0, 0]}
                    borderWidth={1}
                    borderColor="#fff"
                    theme={nivoTheme}
                    tooltip={({ feature }) => {
                        const countyName = (feature as any)?.properties?.COUNTY_NAME || 'Unknown';
                        const countyInfo = countyData.find(d => d?.id === countyName.toUpperCase());
                        return (
                            <Box p={1} sx={{
                                background: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                boxShadow: theme.shadows[4]
                            }}>
                                <strong>{countyName}</strong><br />
                                Gross Profit: {countyInfo ? formatKshAbbreviated(countyInfo.value) : 'N/A'}<br />
                                Branches: {countyInfo?.branchCount || 0}
                            </Box>
                        );
                    }}
                    legends={[
                        {
                            anchor: 'bottom-left',
                            direction: 'column',
                            justify: true,
                            translateX: 20,
                            translateY: -100,
                            itemsSpacing: 0,
                            itemWidth: 94,
                            itemHeight: 18,
                            itemDirection: 'left-to-right',
                            itemTextColor: theme.palette.text.primary,
                            itemOpacity: 0.85,
                            symbolSize: 18,
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: theme.palette.text.primary,
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />
            </Box>
        </ExpandableCard>
    );
};

export default GeographicProfitabilityMap; 