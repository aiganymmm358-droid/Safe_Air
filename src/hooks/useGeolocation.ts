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

  // Fetch weather data directly from Open-Meteo (no auth needed)
  const fetchPublicWeatherData = useCallback(async (lat: number, lng: number, cityName?: string) => {
    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,uv_index&timezone=auto`),
        fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=demo`),
      ]);

      const weatherData = await weatherRes.json();
      const aqiData = await aqiRes.json();

      const getAqiCategory = (aqi: number) => {
        if (aqi <= 50) return 'Хорошее';
        if (aqi <= 100) return 'Умеренное';
        if (aqi <= 150) return 'Вредное для чувствительных';
        if (aqi <= 200) return 'Вредное';
        if (aqi <= 300) return 'Очень вредное';
        return 'Опасное';
      };

      const getWeatherIcon = (code: number) => {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code <= 48) return '🌫️';
        if (code <= 65) return '🌧️';
        if (code <= 77) return '🌨️';
        if (code <= 82) return '🌧️';
        return '⛈️';
      };

      const currentAqi = aqiData?.status === 'ok' ? aqiData.data?.aqi : null;

      const envData: EnvironmentData = {
        id: 'local',
        user_id: 'anonymous',
        latitude: lat,
        longitude: lng,
        city_name: cityName || null,
        current_aqi: currentAqi ?? null,
        aqi_category: currentAqi ? getAqiCategory(currentAqi) : null,
        temperature: weatherData?.current?.temperature_2m ?? null,
        humidity: weatherData?.current?.relative_humidity_2m ?? null,
        wind_speed: weatherData?.current?.wind_speed_10m ?? null,
        weather_description: null,
        weather_icon: weatherData?.current?.weather_code != null ? getWeatherIcon(weatherData.current.weather_code) : null,
        uv_index: weatherData?.current?.uv_index ?? null,
        pressure: weatherData?.current?.surface_pressure ? Math.round(weatherData.current.surface_pressure) : null,
        visibility: null,
        updated_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        environmentData: envData,
        location: { latitude: lat, longitude: lng, cityName },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching public weather data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

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
            await requestLocation();
          }
        } else {
          await requestLocation();
        }
      } else {
        // Not authenticated - fetch public weather data for default location
        const loc = DEFAULT_LOCATION;
        setState(prev => ({ ...prev, isLoading: true }));
        
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation?.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 300000 });
          });
          const cityName = await getCityName(position.coords.latitude, position.coords.longitude);
          await fetchPublicWeatherData(position.coords.latitude, position.coords.longitude, cityName);
        } catch {
          // Fallback to default location
          await fetchPublicWeatherData(loc.latitude, loc.longitude, loc.cityName);
        }
      }
    };

    init();
  }, [isAuthenticated, user, checkPermission, fetchEnvironmentData, requestLocation, getCityName, fetchPublicWeatherData]);

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
