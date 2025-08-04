// Google Maps Integration Setup Guide
// This requires a Google Maps JavaScript API key

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import ChartCard from './ChartCard';
import { enhancedBranchMapping, getBranchCoordinates } from '../utils/locationMapping';

// Types for Google Maps
declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

interface GoogleMapsBranchViewProps {
    data?: Array<{ branch?: string | null; grossProfit?: number | null }>;
    isLoading?: boolean;
    error?: Error | null;
}

const GoogleMapsBranchView: React.FC<GoogleMapsBranchViewProps> = ({
    data = [],
    isLoading = false,
    error = null
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [apiKeyRequired, setApiKeyRequired] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);

    // Filter valid data for use throughout the component
    const validData = data.filter(item =>
        item.branch &&
        item.grossProfit !== null &&
        item.grossProfit !== undefined
    );

    // Google Maps API Key Setup Instructions
    const setupInstructions = {
        step1: "Go to Google Cloud Console (console.cloud.google.com)",
        step2: "Create a new project or select existing one",
        step3: "Enable Maps JavaScript API",
        step4: "Create credentials → API Key",
        step5: "Restrict the key to your domain for security",
        cost: "Free tier: 28,000 map loads per month",
        pricing: "After free tier: $7 per 1,000 additional loads"
    };

    // Initialize Google Maps (requires API key)
    const initializeMap = () => {
        if (!window.google || !mapRef.current) return;

        // Center map on Kenya
        const kenyaCenter = { lat: -1.286389, lng: 36.817223 };

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            zoom: 6,
            center: kenyaCenter,
            mapTypeId: 'roadmap',
            styles: [
                // Custom styling for professional look
                {
                    featureType: 'water',
                    stylers: [{ color: '#e3f2fd' }]
                },
                {
                    featureType: 'landscape',
                    stylers: [{ color: '#f5f5f5' }]
                }
            ]
        });

        // Add markers for each branch with profit data
        validData.forEach(item => {
            const coordinates = getBranchCoordinates(item.branch!);
            const branchInfo = enhancedBranchMapping[item.branch!];

            if (coordinates && branchInfo) {
                const marker = new window.google.maps.Marker({
                    position: { lat: coordinates[1], lng: coordinates[0] },
                    map: mapInstance,
                    title: item.branch!,
                    icon: {
                        // Custom marker based on profit level
                        url: item.grossProfit! > 5000000
                            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'  // High profit
                            : item.grossProfit! > 1000000
                                ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' // Medium profit
                                : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'  // Lower profit
                    }
                });

                // Info window with detailed information
                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1976d2;">${item.branch}</h3>
              <p style="margin: 4px 0;"><strong>County:</strong> ${branchInfo.county}</p>
              <p style="margin: 4px 0;"><strong>Gross Profit:</strong> KSh ${(item.grossProfit! / 1000000).toFixed(1)}M</p>
              <p style="margin: 4px 0; font-size: 0.875rem;">${branchInfo.address}</p>
              <p style="margin: 4px 0; font-size: 0.75rem; color: #666;">
                📍 ${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}
              </p>
            </div>
          `
                });

                marker.addListener('click', () => {
                    infoWindow.open(mapInstance, marker);
                });
            }
        });

        setMap(mapInstance);
    };

    // Load Google Maps API (using your API key)
    const loadGoogleMapsAPI = () => {
        // Get API key from environment variables
        const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!GOOGLE_MAPS_API_KEY) {
            console.error('Google Maps API key not found in environment variables');
            setApiKeyRequired(true);
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            setApiKeyRequired(false);
            setMapLoading(false);
            initializeMap();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;

        window.initMap = () => {
            setApiKeyRequired(false);
            setMapLoading(false);
            initializeMap();
        };

        script.onerror = () => {
            console.error('Failed to load Google Maps API');
            setApiKeyRequired(true);
            setMapLoading(false);
        };

        document.head.appendChild(script);
    };

    useEffect(() => {
        // Auto-load Google Maps when component mounts
        const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (GOOGLE_MAPS_API_KEY) {
            loadGoogleMapsAPI();
        } else {
            setApiKeyRequired(true);
            setMapLoading(false);
        }
    }, []);

    useEffect(() => {
        if (data.length > 0 && !apiKeyRequired && window.google) {
            initializeMap();
        }
    }, [data, apiKeyRequired]);

    const formatValue = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toFixed(0);
    };

    return (
        <ChartCard
            title="Google Maps Branch Locations"
            isLoading={isLoading}
            error={error}
            empty={data.length === 0}
        >
            {apiKeyRequired ? (
                <Box p={3}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Google Maps API Key Setup Complete!
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Your API key has been configured. Click the button below to load Google Maps.
                        </Typography>
                    </Alert>

                    <Box mt={2}>
                        <Button
                            variant="contained"
                            onClick={loadGoogleMapsAPI}
                            sx={{ mr: 1 }}
                        >
                            Load Google Maps
                        </Button>
                        <Button
                            variant="outlined"
                            href="https://console.cloud.google.com/google/maps-apis/overview"
                            target="_blank"
                        >
                            Manage API Key
                        </Button>
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                            Current Branch Coordinates Available:
                        </Typography>
                        <Box maxHeight={200} overflow="auto">
                            {Object.values(enhancedBranchMapping).slice(0, 5).map(branch => (
                                <Box key={branch.branch} p={1} border="1px solid #ddd" mb={1}>
                                    <Typography variant="body2">
                                        <strong>{branch.branch}</strong> ({branch.county})<br />
                                        📍 {branch.coordinates?.[1].toFixed(4)}, {branch.coordinates?.[0].toFixed(4)}<br />
                                        <small>{branch.address}</small>
                                    </Typography>
                                </Box>
                            ))}
                            <Typography variant="caption" color="textSecondary">
                                +{Object.keys(enhancedBranchMapping).length - 5} more branches with coordinates
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            ) : mapLoading ? (
                <Box height={500} display="flex" alignItems="center" justifyContent="center">
                    <Box textAlign="center">
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Loading Google Maps...
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <Box>
                    {/* Map Container */}
                    <Box
                        ref={mapRef}
                        height={500}
                        width="100%"
                        borderRadius={1}
                        overflow="hidden"
                    />

                    {/* Legend */}
                    <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box width={12} height={12} bgcolor="red" borderRadius="50%" />
                            <Typography variant="caption">High Profit (&gt;5M)</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box width={12} height={12} bgcolor="orange" borderRadius="50%" />
                            <Typography variant="caption">Medium Profit (1-5M)</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box width={12} height={12} bgcolor="green" borderRadius="50%" />
                            <Typography variant="caption">Lower Profit (&lt;1M)</Typography>
                        </Box>
                    </Box>

                    {/* Summary Stats */}
                    <Box mt={2}>
                        <Typography variant="body2" color="textSecondary">
                            Showing {validData.length} branches with total profit of KSh {formatValue(validData.reduce((sum, item) => sum + item.grossProfit!, 0))}
                        </Typography>
                    </Box>
                </Box>
            )}
        </ChartCard>
    );
};

export default GoogleMapsBranchView;
