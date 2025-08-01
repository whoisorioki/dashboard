import { useState, useEffect } from 'react';

interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

interface UseKenyaGeoJsonReturn {
  geoJsonData: GeoJsonData | null;
  loading: boolean;
  error: Error | null;
}

export const useKenyaGeoJson = (): UseKenyaGeoJsonReturn => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/kenya-counties.geojson');
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
        }
        
        const data = await response.json() as GeoJsonData;
        setGeoJsonData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error loading GeoJSON'));
      } finally {
        setLoading(false);
      }
    };

    loadGeoJson();
  }, []);

  return { geoJsonData, loading, error };
};
