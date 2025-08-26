// Unified Google Maps Component with Multiple Modes and Exact GPS Coordinates
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Chip, Stack } from '@mui/material';
import ChartCard from './ChartCard';
import { enhancedBranchMapping, getBranchCoordinates } from '../utils/locationMapping';

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

interface UnifiedGoogleMapsProps {
    data?: Array<{ branch?: string | null; grossProfit?: number | null }>;
    isLoading?: boolean;
    error?: Error | null;
    mode?: 'simple' | 'precise' | 'enhanced' | 'choropleth' | 'google';
    showControls?: boolean;
}

interface GeocodeResult {
    branch: string;
    address: string;
    coordinates: [number, number];
    formatted_address: string;
    place_id: string;
}

interface BranchMarker {
    branch: string;
    position: { lat: number; lng: number };
    grossProfit: number;
    marker: any;
    infoWindow?: any;
}

const UnifiedGoogleMaps: React.FC<UnifiedGoogleMapsProps> = ({
    data = [],
    isLoading = false,
    error = null,
    mode = 'enhanced',
    showControls = true
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [geocoder, setGeocoder] = useState<any>(null);
    const [apiKeyRequired, setApiKeyRequired] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
    const [geocodingProgress, setGeocodingProgress] = useState(0);
    const [markers, setMarkers] = useState<BranchMarker[]>([]);
    const [currentMode, setCurrentMode] = useState(mode);
    const [apiReady, setApiReady] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    // Filter and process data
    const validData = data.filter(item =>
        item.branch &&
        item.grossProfit !== null &&
        item.grossProfit !== undefined
    ).map(item => ({
        branch: item.branch!,
        grossProfit: item.grossProfit!
    }));

    // Get exact addresses for branches from your mapping
    const getBranchAddress = (branchName: string): string => {
        const branchInfo = enhancedBranchMapping[branchName];
        if (branchInfo?.address) {
            return `${branchInfo.address}, Kenya`;
        }

        // Fallback addresses based on your md/map.md file
        const fallbackAddresses: Record<string, string> = {
            'Nairobi trading': 'New Cargen House, Lusaka Road, Industrial Area, Nairobi, Kenya',
            'Doosan': 'Car & General HQ, Lusaka Road, Industrial Area, Nairobi, Kenya',
            'Toyota': 'Uhuru Highway, Nairobi, Kenya',
            'Mombasa trading': 'Mbaraki Road, Mombasa, Kenya',
            'Kisumu trading': 'Obote Road, Kisumu, Kenya',
            'Nakuru Distribution': 'Nairobi - Eldoret Highway, Nakuru, Kenya',
            'Nakuru trading': 'Nairobi - Eldoret Highway, Nakuru, Kenya',
            'Eldoret': 'Uganda Road, Yana Building, Eldoret, Kenya',
            'Thika': 'Saleh Building Next to KRA, Thika, Kenya',
            'Kitengela': 'Yukos Opposite Shell Petrol Station, Kitengela, Kenya',
            'Malindi': 'Lamu Road, Malindi, Kenya',
            'Voi': 'Caltex - Voi Road, Voi, Kenya',
            'Bungoma': 'Mashambani Road, Bungoma, Kenya',
            'Kisii': 'Kisii - Sotik Road, Ram Plaza/Gudka Building, Kisii, Kenya',
            'Kitale': 'Kitale - Eldoret Road, Soet House, Jovena, Kitale, Kenya'
        };

        return fallbackAddresses[branchName] || `${branchName}, Kenya`;
    };

    // Initialize Google Maps API
    useEffect(() => {
        const initializeGoogleMaps = async () => {
            if (window.google && window.google.maps) {
                setApiReady(true);
                setGeocoder(new window.google.maps.Geocoder());
                return;
            }

            // Check if API key is available
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                setApiKeyRequired(true);
                setMapLoading(false);
                return;
            }

            // Load Google Maps API
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                setApiReady(true);
                setGeocoder(new window.google.maps.Geocoder());
            };

            script.onerror = () => {
                setMapError('Failed to load Google Maps API');
                setMapLoading(false);
            };

            document.head.appendChild(script);
        };

        initializeGoogleMaps();
    }, []);

    // Initialize map when API is ready
    useEffect(() => {
        if (apiReady && mapRef.current && !map) {
            initializeMap();
        }
    }, [apiReady, mapRef.current]);

    // Initialize map instance
    const initializeMap = () => {
        if (!window.google || !mapRef.current) return;

        const kenyaCenter = { lat: -1.286389, lng: 36.817223 };

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            zoom: 6,
            center: kenyaCenter,
            mapTypeId: 'roadmap',
            styles: getMapStyles(currentMode),
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        });

        setMap(mapInstance);
        setMapLoading(false);

        // Add markers based on mode
        if (validData.length > 0) {
            addMarkersToMap(mapInstance);
        }
    };

    // Get map styles based on mode
    const getMapStyles = (mode: string) => {
        const baseStyles = [
            {
                featureType: 'water',
                stylers: [{ color: '#e3f2fd' }]
            },
            {
                featureType: 'landscape',
                stylers: [{ color: '#f5f5f5' }]
            }
        ];

        switch (mode) {
            case 'enhanced':
                return [
                    ...baseStyles,
                    {
                        featureType: 'poi.business',
                        stylers: [{ visibility: 'simplified' }]
                    }
                ];
            case 'choropleth':
                return [
                    ...baseStyles,
                    {
                        featureType: 'administrative',
                        stylers: [{ visibility: 'on' }]
                    }
                ];
            default:
                return baseStyles;
        }
    };

    // Add markers to map with exact coordinates
    const addMarkersToMap = (mapInstance: any) => {
        const newMarkers: BranchMarker[] = [];

        validData.forEach(item => {
            // Get exact coordinates from your mapping
            const coordinates = getBranchCoordinates(item.branch);

            if (coordinates) {
                const [lat, lng] = coordinates;
                const position = { lat, lng };

                // Create marker with exact GPS coordinates
                const marker = new window.google.maps.Marker({
                    position,
                    map: mapInstance,
                    title: `${item.branch} - ${formatCurrency(item.grossProfit)}`,
                    icon: getMarkerIcon(item.grossProfit, currentMode),
                    animation: window.google.maps.Animation.DROP
                });

                // Create info window with branch details
                const infoWindow = new window.google.maps.InfoWindow({
                    content: createInfoWindowContent(item.branch, item.grossProfit, coordinates)
                });

                // Add click listener to marker
                marker.addListener('click', () => {
                    infoWindow.open(mapInstance, marker);
                });

                newMarkers.push({
                    branch: item.branch,
                    position,
                    grossProfit: item.grossProfit,
                    marker,
                    infoWindow
                });
            }
        });

        setMarkers(newMarkers);

        // Fit bounds to show all markers
        if (newMarkers.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            newMarkers.forEach(marker => {
                bounds.extend(marker.position);
            });
            mapInstance.fitBounds(bounds);
        }
    };

    // Get marker icon based on profit and mode
    const getMarkerIcon = (grossProfit: number, mode: string) => {
        const profitLevel = grossProfit > 1000000 ? 'high' :
            grossProfit > 500000 ? 'medium' : 'low';

        const iconColors = {
            high: '#4CAF50',    // Green
            medium: '#FF9800',   // Orange
            low: '#F44336'       // Red
        };

        if (mode === 'enhanced') {
            // Custom colored markers for enhanced mode
            return {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: iconColors[profitLevel],
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                scale: 8
            };
        }

        // Default markers for other modes
        return undefined;
    };

    // Create info window content
    const createInfoWindowContent = (branch: string, grossProfit: number, coordinates: [number, number]) => {
        return `
            <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">${branch}</h3>
                <p style="margin: 5px 0; font-weight: bold;">
                    Gross Profit: <span style="color: #4caf50;">${formatCurrency(grossProfit)}</span>
                </p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">
                    Coordinates: ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}
                </p>
            </div>
        `;
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Handle mode change
    const handleModeChange = (newMode: 'simple' | 'enhanced' | 'choropleth') => {
        setCurrentMode(newMode);
        if (map) {
            map.setOptions({ styles: getMapStyles(newMode) });
            // Refresh markers with new styling
            markers.forEach(marker => {
                marker.marker.setIcon(getMarkerIcon(marker.grossProfit, newMode));
            });
        }
    };

    // Render loading state
    if (isLoading || mapLoading) {
        return (
            <Box sx={{ height: 400 }}>
                <ChartCard title="Branch Location Map" isLoading={false}>
                    <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                        <CircularProgress />
                    </Box>
                </ChartCard>
            </Box>
        );
    }

    // Render API key required message
    if (apiKeyRequired) {
        return (
            <Box sx={{ height: 400 }}>
                <ChartCard title="Branch Location Map" isLoading={false}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Google Maps API key is required for this component to work.
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                        Please set the REACT_APP_GOOGLE_MAPS_API_KEY environment variable.
                    </Typography>
                </ChartCard>
            </Box>
        );
    }

    // Render error state
    if (error) {
        return (
            <Box sx={{ height: 400 }}>
                <ChartCard title="Branch Location Map" isLoading={false}>
                    <Alert severity="error">
                        Error loading map: {error.message}
                    </Alert>
                </ChartCard>
            </Box>
        );
    }

    return (
        <Box sx={{ height: 400 }}>
            <ChartCard title="Branch Location Map" isLoading={false}>
                {showControls && (
                    <Box mb={2}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {(['simple', 'enhanced', 'choropleth'] as const).map((modeOption) => (
                                <Button
                                    key={modeOption}
                                    size="small"
                                    variant={currentMode === modeOption ? 'contained' : 'outlined'}
                                    onClick={() => handleModeChange(modeOption)}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)} View
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                )}

                <Box
                    ref={mapRef}
                    sx={{
                        height: 400,
                        width: '100%',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                />

                {markers.length > 0 && (
                    <Box mt={2}>
                        <Typography variant="caption" color="text.secondary">
                            {markers.length} branches mapped with exact GPS coordinates
                        </Typography>
                    </Box>
                )}
            </ChartCard>
        </Box>
    );
};

export default UnifiedGoogleMaps;
