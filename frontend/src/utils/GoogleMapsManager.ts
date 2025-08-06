// Google Maps API Manager - Singleton pattern to handle script loading
class GoogleMapsManager {
    private static instance: GoogleMapsManager;
    private isLoaded = false;
    private isLoading = false;
    private callbacks: (() => void)[] = [];
    private apiKey: string | null = null;

    private constructor() {
        this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    }

    public static getInstance(): GoogleMapsManager {
        if (!GoogleMapsManager.instance) {
            GoogleMapsManager.instance = new GoogleMapsManager();
        }
        return GoogleMapsManager.instance;
    }

    public async loadGoogleMapsAPI(): Promise<void> {
        return new Promise((resolve, reject) => {
            // If already loaded, resolve immediately
            if (this.isLoaded && window.google && window.google.maps) {
                console.log('✅ GoogleMapsManager - Already loaded');
                resolve();
                return;
            }

            // Add callback to queue
            this.callbacks.push(() => {
                console.log('✅ GoogleMapsManager - Callback executed');
                resolve();
            });

            // If already loading, just wait for callback
            if (this.isLoading) {
                console.log('⏳ GoogleMapsManager - Already loading, waiting...');
                return;
            }

            // Check API key
            if (!this.apiKey) {
                console.error('❌ GoogleMapsManager - No API key found');
                reject(new Error('Google Maps API key not found'));
                return;
            }

            console.log('📡 GoogleMapsManager - Loading Google Maps API...');
            this.isLoading = true;

            // Create script
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geometry,places&callback=googleMapsReady`;
            script.async = true;
            script.defer = true;

            // Global callback function
            (window as any).googleMapsReady = () => {
                console.log('🚀 GoogleMapsManager - Google Maps API loaded successfully');
                this.isLoaded = true;
                this.isLoading = false;

                // Execute all pending callbacks
                this.callbacks.forEach(callback => {
                    try {
                        callback();
                    } catch (error) {
                        console.error('❌ GoogleMapsManager - Callback error:', error);
                    }
                });
                this.callbacks = [];
            };

            // Handle errors
            script.onerror = () => {
                console.error('❌ GoogleMapsManager - Failed to load Google Maps API');
                this.isLoading = false;
                this.callbacks.forEach(() => {}); // Clear callbacks
                this.callbacks = [];
                reject(new Error('Failed to load Google Maps API'));
            };

            // Add to document
            document.head.appendChild(script);
        });
    }

    public isGoogleMapsLoaded(): boolean {
        return this.isLoaded && !!(window.google && window.google.maps);
    }
}

export default GoogleMapsManager;
