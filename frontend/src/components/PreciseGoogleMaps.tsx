// Enhanced Google Maps with Geocoding API for exact locations
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Chip, Stack } from '@mui/material';
import ChartCard from './ChartCard';
import { enhancedBranchMapping } from '../utils/locationMapping';

declare global {
    interface Window {
        google: any;
        initMap: () => void;
        initPreciseGoogleMaps: () => void;
    }
}

interface PreciseGoogleMapsProps {
    data?: Array<{ branch?: string | null; grossProfit?: number | null }>;
    isLoading?: boolean;
    error?: Error | null;
}

interface GeocodeResult {
    branch: string;
    address: string;
    coordinates: [number, number];
    formatted_address: string;
    place_id: string;
}

const PreciseGoogleMaps: React.FC<PreciseGoogleMapsProps> = ({
    data = [],
    isLoading = false,
    error = null
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [geocoder, setGeocoder] = useState<any>(null);
    const [apiKeyRequired, setApiKeyRequired] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
    const [geocodingProgress, setGeocodingProgress] = useState(0);

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

    // Filter and process data
    const validData = data.filter(item =>
        item.branch &&
        item.grossProfit !== null &&
        item.grossProfit !== undefined
    ).map(item => ({
        branch: item.branch!,
        grossProfit: item.grossProfit!
    }));

    console.log('📊 PreciseGoogleMaps - Data processed:', {
        totalData: data.length,
        validData: validData.length,
        sampleData: validData.slice(0, 3)
    });

    // Geocode all branch addresses to get exact coordinates
    const geocodeAllBranches = async () => {
        if (!geocoder || !validData.length) return;

        console.log('Starting geocoding for', validData.length, 'branches');
        setGeocodingProgress(0);

        const results: GeocodeResult[] = [];

        for (let i = 0; i < validData.length; i++) {
            const branch = validData[i];
            const address = getBranchAddress(branch.branch);

            try {
                console.log(`Geocoding ${branch.branch}: ${address}`);

                const result = await new Promise<any>((resolve, reject) => {
                    geocoder.geocode({ address: address }, (results: any[], status: string) => {
                        if (status === 'OK' && results[0]) {
                            resolve(results[0]);
                        } else {
                            console.warn(`Geocoding failed for ${branch.branch}: ${status}`);
                            reject(new Error(`Geocoding failed: ${status}`));
                        }
                    });
                });

                const location = result.geometry.location;
                const geocodeResult: GeocodeResult = {
                    branch: branch.branch,
                    address: address,
                    coordinates: [location.lng(), location.lat()],
                    formatted_address: result.formatted_address,
                    place_id: result.place_id
                };

                results.push(geocodeResult);
                console.log(`✅ Geocoded ${branch.branch}:`, geocodeResult);

                // Update progress
                setGeocodingProgress(((i + 1) / validData.length) * 100);

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`❌ Failed to geocode ${branch.branch}:`, error);

                // Use fallback coordinates from your existing mapping
                const fallbackCoords = enhancedBranchMapping[branch.branch]?.coordinates;
                if (fallbackCoords) {
                    results.push({
                        branch: branch.branch,
                        address: address,
                        coordinates: fallbackCoords,
                        formatted_address: address,
                        place_id: 'fallback'
                    });
                }
            }
        }

        setGeocodeResults(results);
        console.log('✅ Geocoding complete. Results:', results);

        // Now create markers with exact locations
        createPreciseMarkers(results);
    };

    // Create markers with precise geocoded locations
    const createPreciseMarkers = (geocodedData: GeocodeResult[]) => {
        if (!map) return;

        // Clear existing markers
        // (In a full implementation, you'd store markers in state to clear them)

        geocodedData.forEach(location => {
            const branchData = validData.find(d => d.branch === location.branch);
            if (!branchData) return;

            const marker = new window.google.maps.Marker({
                position: { lat: location.coordinates[1], lng: location.coordinates[0] },
                map: map,
                title: location.branch,
                icon: {
                    url: branchData.grossProfit > 5000000
                        ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        : branchData.grossProfit > 1000000
                            ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                            : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                }
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
                        <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">
                            ${location.branch}
                        </h3>
                        <div style="margin: 6px 0; font-size: 14px;">
                            <strong>Gross Profit:</strong> KSh ${(branchData.grossProfit / 1000000).toFixed(1)}M
                        </div>
                        <div style="margin: 6px 0; font-size: 13px; color: #666;">
                            <strong>📍 Exact Address:</strong><br>
                            ${location.formatted_address}
                        </div>
                        <div style="margin: 6px 0; font-size: 12px; color: #888;">
                            <strong>Coordinates:</strong> ${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}
                        </div>
                        <div style="margin: 6px 0; font-size: 11px; color: #aaa;">
                            ${location.place_id !== 'fallback' ? '✅ Google-verified location' : '⚠️ Fallback coordinates'}
                        </div>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });

        // Fit map to show all markers
        if (geocodedData.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            geocodedData.forEach(location => {
                bounds.extend(new window.google.maps.LatLng(location.coordinates[1], location.coordinates[0]));
            });
            map.fitBounds(bounds);

            // Set max zoom to avoid being too close
            const listener = window.google.maps.event.addListener(map, 'idle', () => {
                if (map.getZoom() > 10) map.setZoom(10);
                window.google.maps.event.removeListener(listener);
            });
        }
    };

    // Initialize Google Maps
    const initializeMap = () => {
        console.log('🗺️ PreciseGoogleMaps - Initializing map...');
        if (!window.google || !mapRef.current) {
            console.error('❌ PreciseGoogleMaps - Google Maps not available or ref missing');
            return;
        }

        const kenyaCenter = { lat: -1.286389, lng: 36.817223 };

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            zoom: 6,
            center: kenyaCenter,
            mapTypeId: 'roadmap',
            styles: [
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

        // Initialize geocoder
        const geocoderInstance = new window.google.maps.Geocoder();

        setMap(mapInstance);
        setGeocoder(geocoderInstance);
        setMapLoading(false);

        console.log('✅ Google Maps and Geocoder initialized');
    };

    // Load Google Maps API
    const loadGoogleMapsAPI = () => {
        const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        console.log('🔑 PreciseGoogleMaps - API Key Check:', GOOGLE_MAPS_API_KEY ? 'Found' : 'Missing');

        if (!GOOGLE_MAPS_API_KEY) {
            console.error('Google Maps API key not found');
            setApiKeyRequired(true);
            setMapLoading(false);
            return;
        }

        if (window.google && window.google.maps) {
            console.log('✅ PreciseGoogleMaps - Google Maps already loaded');
            setApiKeyRequired(false);
            initializeMap();
            return;
        }

        console.log('📡 PreciseGoogleMaps - Loading Google Maps script...');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initPreciseGoogleMaps`;
        script.async = true;
        script.defer = true;

        window.initPreciseGoogleMaps = () => {
            console.log('🚀 PreciseGoogleMaps - Google Maps loaded via callback');
            setApiKeyRequired(false);
            initializeMap();
        };

        script.onerror = () => {
            console.error('❌ PreciseGoogleMaps - Failed to load Google Maps API');
            setApiKeyRequired(true);
            setMapLoading(false);
        };

        document.head.appendChild(script);
    };

    // Auto-load when component mounts
    useEffect(() => {
        console.log('🔄 PreciseGoogleMaps - Component mounted, loading API...');
        loadGoogleMapsAPI();
    }, []);

    // Geocode when map and data are ready
    useEffect(() => {
        console.log('🔄 PreciseGoogleMaps - Dependencies changed:', {
            hasMap: !!map,
            hasGeocoder: !!geocoder,
            validDataLength: validData.length,
            geocodeResultsLength: geocodeResults.length
        });

        if (map && geocoder && validData.length > 0 && geocodeResults.length === 0) {
            console.log('🚀 PreciseGoogleMaps - Starting geocoding process...');
            geocodeAllBranches();
        }
    }, [map, geocoder, validData]);

    const formatValue = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toFixed(0);
    };

    return (
        <ChartCard
            title="Precise Google Maps Locations"
            isLoading={isLoading}
            error={error}
            empty={validData.length === 0}
        >
            {mapLoading ? (
                <Box height={500} display="flex" alignItems="center" justifyContent="center">
                    <Box textAlign="center">
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Loading Google Maps & Geocoding API...
                        </Typography>
                    </Box>
                </Box>
            ) : apiKeyRequired ? (
                <Box p={3}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Google Maps API Key Required
                        </Typography>
                        <Typography variant="body2">
                            Please check your .env file and ensure VITE_GOOGLE_MAPS_API_KEY is set.
                        </Typography>
                    </Alert>
                </Box>
            ) : (
                <Box>
                    {/* Status Bar */}
                    <Box mb={2}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                                label={`${validData.length} Branches to Map`}
                                color="primary"
                                size="small"
                            />
                            <Chip
                                label={`${geocodeResults.length} Geocoded`}
                                color={geocodeResults.length === validData.length ? "success" : "default"}
                                size="small"
                            />
                            {geocodingProgress > 0 && geocodingProgress < 100 && (
                                <Chip
                                    label={`${Math.round(geocodingProgress)}% Complete`}
                                    color="info"
                                    size="small"
                                />
                            )}
                        </Stack>
                    </Box>

                    {/* Map */}
                    <Box
                        ref={mapRef}
                        height={500}
                        width="100%"
                        borderRadius={1}
                        overflow="hidden"
                        border="1px solid #ddd"
                    />

                    {/* Geocoding Results */}
                    {geocodeResults.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                📍 Exact Locations Found ({geocodeResults.length}/{validData.length})
                            </Typography>
                            <Box maxHeight={150} overflow="auto">
                                {geocodeResults.slice(0, 5).map(result => (
                                    <Box
                                        key={result.branch}
                                        p={1}
                                        mb={1}
                                        bgcolor="action.hover"
                                        borderRadius={1}
                                        fontSize="0.8rem"
                                    >
                                        <Typography variant="body2" fontWeight={500}>
                                            {result.branch} {result.place_id !== 'fallback' ? '✅' : '⚠️'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {result.formatted_address}
                                        </Typography>
                                    </Box>
                                ))}
                                {geocodeResults.length > 5 && (
                                    <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
                                        +{geocodeResults.length - 5} more locations
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
        </ChartCard>
    );
};

export default PreciseGoogleMaps;
