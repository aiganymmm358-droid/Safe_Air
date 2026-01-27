import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface UserLocation {
  latitude: number;
  longitude: number;
  cityName?: string;
  accuracy?: number;
}

export interface EnvironmentData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  city_name: string | null;
  current_aqi: number | null;
  aqi_category: string | null;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  weather_description: string | null;
  weather_icon: string | null;
  uv_index: number | null;
  pressure: number | null;
  visibility: number | null;
  updated_at: string;
}

interface GeolocationState {
  location: UserLocation | null;
  environmentData: EnvironmentData | null;
  isLoading: boolean;
  isLocating: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

// Default location (Almaty, Kazakhstan)
const DEFAULT_LOCATION: UserLocation = {
  latitude: 43.238949,
  longitude: 76.945465,
  cityName: 'Алматы',
};

export function useGeolocation() {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<GeolocationState>({
    location: null,
    environmentData: null,
    isLoading: true,
    isLocating: false,
    error: null,
    permissionStatus: 'prompt',
  });

  // Check geolocation permission
  const checkPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, permissionStatus: 'unavailable' }));
      return 'unavailable';
    }

    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionStatus: result.state as 'granted' | 'denied' | 'prompt' }));
        return result.state;
      } catch {
        return 'prompt';
      }
    }
    return 'prompt';
  }, []);

  // Get current position
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }, []);

  // Reverse geocode to get city name
  const getCityName = useCallback(async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || data.address?.state;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return undefined;
    }
  }, []);

  // Fetch environment data from database
  const fetchEnvironmentData = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_environment_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching environment data:', error);
      return null;
    }

    return data as EnvironmentData | null;
  }, [user]);

  // Update location and fetch environment data
  const updateLocation = useCallback(async (lat: number, lng: number, cityName?: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Fetch weather/AQI data from edge function
      const { data: envData, error: envError } = await supabase.functions.invoke('user-environment', {
        body: { 
          action: 'updateLocation',
          latitude: lat,
          longitude: lng,
          cityName,
        },
      });

      if (envError) throw envError;

      // Fetch updated environment data
      const environmentData = await fetchEnvironmentData();

      setState(prev => ({
        ...prev,
        location: { latitude: lat, longitude: lng, cityName },
        environmentData,
        isLoading: false,
        error: null,
      }));

      return envData;
    } catch (error) {
      console.error('Error updating location:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update location',
      }));
    }
  }, [user, fetchEnvironmentData]);

  // Request and capture geolocation
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Геолокация не поддерживается вашим браузером',
        permissionStatus: 'unavailable',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLocating: true, error: null }));

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;

      setState(prev => ({ ...prev, permissionStatus: 'granted' }));

      // Get city name
      const cityName = await getCityName(latitude, longitude);

      const location: UserLocation = {
        latitude,
        longitude,
        cityName,
        accuracy,
      };

      setState(prev => ({ ...prev, location, isLocating: false }));

      // If authenticated, save to database and fetch environment data
      if (user) {
        await updateLocation(latitude, longitude, cityName);
      }

      return location;
    } catch (error) {
      let errorMessage = 'Не удалось определить местоположение';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Доступ к геолокации запрещён';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Информация о местоположении недоступна';
            break;
          case error.TIMEOUT:
            errorMessage = 'Превышено время ожидания определения местоположения';
            break;
        }
      }

      setState(prev => ({
        ...prev,
        isLocating: false,
        error: errorMessage,
      }));

      // Use default location if geolocation fails
      if (user) {
        await updateLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.cityName);
      }
    }
  }, [user, getCurrentPosition, getCityName, updateLocation]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await checkPermission();

      if (isAuthenticated && user) {
        // First, try to load existing data from database
        const existingData = await fetchEnvironmentData();
        
        if (existingData) {
          setState(prev => ({
            ...prev,
            location: {
              latitude: existingData.latitude,
              longitude: existingData.longitude,
              cityName: existingData.city_name || undefined,
            },
            environmentData: existingData,
            isLoading: false,
          }));

          // Check if data is stale (older than 30 minutes)
          const updatedAt = new Date(existingData.updated_at);
          const now = new Date();
          const diffMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);

          if (diffMinutes > 30) {
            // Refresh location data
            await requestLocation();
          }
        } else {
          // No existing data, request location
          await requestLocation();
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    init();
  }, [isAuthenticated, user, checkPermission, fetchEnvironmentData, requestLocation]);

  // Use default location as fallback
  const effectiveLocation = state.location || DEFAULT_LOCATION;

  return {
    ...state,
    effectiveLocation,
    requestLocation,
    updateLocation,
    refreshEnvironmentData: fetchEnvironmentData,
    defaultLocation: DEFAULT_LOCATION,
  };
}
