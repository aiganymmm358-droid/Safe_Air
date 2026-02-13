import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AQIStation {
  uid: number;
  aqi: number;
  lat: number;
  lng: number;
  name: string;
  time: string;
}

export interface StationDetails {
  aqi: number;
  city: string;
  time: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
  };
  weather: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    wind?: number;
  };
  forecast?: {
    pm25?: Array<{ day: string; avg: number; min: number; max: number }>;
    pm10?: Array<{ day: string; avg: number; min: number; max: number }>;
    o3?: Array<{ day: string; avg: number; min: number; max: number }>;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const useAirQualityData = () => {
  const [stations, setStations] = useState<AQIStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStationsInBounds = useCallback(async (bounds: MapBounds, retries = 3) => {
    setIsLoading(true);
    setError(null);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, error: funcError } = await supabase.functions.invoke('waqi-data', {
          body: { action: 'getStationsInBounds', bounds },
        });

        if (funcError) {
          throw new Error(funcError.message);
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch stations');
        }

        setStations(data.data);
        setError(null);
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn(`Attempt ${attempt}/${retries} failed:`, err);
        
        if (attempt === retries) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch air quality data';
          setError(errorMessage);
          console.error('Error fetching stations after retries:', err);
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const fetchStationDetails = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('waqi-data', {
        body: { action: 'getStationDetails', lat, lng },
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch station details');
      }

      setSelectedStation(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch station details';
      setError(errorMessage);
      console.error('Error fetching station details:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelectedStation = useCallback(() => {
    setSelectedStation(null);
  }, []);

  return {
    stations,
    selectedStation,
    isLoading,
    error,
    fetchStationsInBounds,
    fetchStationDetails,
    clearSelectedStation,
  };
};
