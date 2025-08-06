// Simple Google Maps Component for Testing
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import ChartCard from './ChartCard';
import GoogleMapsManager from '../utils/GoogleMapsManager';

interface SimpleGoogleMapsProps {
    data?: Array<{ branch?: string | null; grossProfit?: number | null }>;
    isLoading?: boolean;
    error?: Error | null;
}

const SimpleGoogleMaps: React.FC<SimpleGoogleMapsProps> = ({
    data = [],
    isLoading = false,
    error = null
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState<string | null>(null);
    const [apiReady, setApiReady] = useState(false);

    // Callback ref to ensure element is available
    const mapRefCallback = (element: HTMLDivElement | null) => {
        if (element) {
            mapRef.current = element;
            console.log('✅ SimpleGoogleMaps - Map container ref set via callback');

            // Try to initialize if API is ready
            if (apiReady && window.google && window.google.maps) {
                console.log('🚀 SimpleGoogleMaps - Both ref and API ready, initializing...');
                setTimeout(() => initializeMap(), 50);
            }
        }
    };

    // Simple initialization with retry logic
    const initializeMap = (retryCount = 0) => {
        console.log('🗺️ SimpleGoogleMaps - Starting initialization...', { retryCount });

        if (!window.google) {
            console.error('❌ SimpleGoogleMaps - window.google not available');
            setMapError('Google Maps API not loaded');
            setMapLoading(false);
            return;
        }

        if (!mapRef.current) {
            console.warn('⏳ SimpleGoogleMaps - Map container ref not ready, retrying...', { retryCount });

            // Retry up to 5 times with increasing delay
            if (retryCount < 5) {
                setTimeout(() => {
                    initializeMap(retryCount + 1);
                }, 100 * (retryCount + 1)); // 100ms, 200ms, 300ms, etc.
                return;
            } else {
                console.error('❌ SimpleGoogleMaps - Map container ref not available after retries');
                setMapError('Map container not ready after multiple attempts');
                setMapLoading(false);
                return;
            }
        }

        try {
            console.log('✅ SimpleGoogleMaps - Creating map instance...');

            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 6,
                center: { lat: -1.286389, lng: 36.817223 }, // Kenya center
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

            // Add a test marker for Nairobi
            const nairobiMarker = new window.google.maps.Marker({
                position: { lat: -1.286389, lng: 36.817223 },
                map: map,
                title: 'Nairobi - Test Marker',
                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });

            // Add a few more test markers for major cities
            const testLocations = [
                { lat: -4.043740, lng: 39.668207, title: 'Mombasa', color: 'yellow' },
                { lat: -0.091702, lng: 34.767956, title: 'Kisumu', color: 'green' },
                { lat: -0.303099, lng: 36.080025, title: 'Nakuru', color: 'blue' }
            ];

            testLocations.forEach(location => {
                new window.google.maps.Marker({
                    position: { lat: location.lat, lng: location.lng },
                    map: map,
                    title: location.title,
                    icon: `https://maps.google.com/mapfiles/ms/icons/${location.color}-dot.png`
                });
            });

            console.log('✅ SimpleGoogleMaps - Map and markers created successfully');
            setMapLoading(false);
            setMapError(null);

        } catch (error) {
            console.error('❌ SimpleGoogleMaps - Error creating map:', error);
            setMapError(`Failed to create map: ${error.message}`);
            setMapLoading(false);
        }
    };

    useEffect(() => {
        console.log('🔄 SimpleGoogleMaps - Component mounted');

        const manager = GoogleMapsManager.getInstance();

        // Check if already loaded
        if (manager.isGoogleMapsLoaded()) {
            console.log('✅ SimpleGoogleMaps - Maps already loaded');
            setApiReady(true);
            // Try to initialize if ref is also ready
            if (mapRef.current) {
                setTimeout(() => initializeMap(), 100);
            }
            return;
        }

        // Load API
        manager.loadGoogleMapsAPI()
            .then(() => {
                console.log('✅ SimpleGoogleMaps - API loaded successfully');
                setApiReady(true);
                // Try to initialize if ref is also ready
                if (mapRef.current) {
                    setTimeout(() => initializeMap(), 100);
                }
            })
            .catch((error) => {
                console.error('❌ SimpleGoogleMaps - Failed to load API:', error);
                setMapError(error.message);
                setMapLoading(false);
            });
    }, []);

    // Additional effect to ensure ref is available
    useEffect(() => {
        if (mapRef.current && !mapLoading && !mapError) {
            console.log('🔄 SimpleGoogleMaps - Ref is now available');
        }
    }, [mapRef.current, mapLoading, mapError]);

    return (
        <ChartCard
            title="Simple Google Maps Test"
            isLoading={isLoading}
            error={error}
            empty={false}
        >
            {mapLoading ? (
                <Box height={400} display="flex" alignItems="center" justifyContent="center">
                    <Box textAlign="center">
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Loading Google Maps...
                        </Typography>
                    </Box>
                </Box>
            ) : mapError ? (
                <Alert severity="error">
                    <Typography variant="h6">Map Loading Error</Typography>
                    <Typography variant="body2">{mapError}</Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Check browser console for detailed error messages
                    </Typography>
                </Alert>
            ) : (
                <Box>
                    <Box
                        ref={mapRefCallback}
                        height={400}
                        width="100%"
                        borderRadius={1}
                        overflow="hidden"
                        border="1px solid #ddd"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        ✅ Google Maps loaded successfully with test markers
                    </Typography>
                </Box>
            )}
        </ChartCard>
    );
};

export default SimpleGoogleMaps;
