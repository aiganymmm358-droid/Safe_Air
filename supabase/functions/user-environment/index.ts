import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WAQI_API_TOKEN = Deno.env.get('WAQI_API_TOKEN');

interface RequestBody {
  action: 'updateLocation' | 'getEnvironmentData';
  latitude: number;
  longitude: number;
  cityName?: string;
}

// Get AQI category based on value
function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Хорошее';
  if (aqi <= 100) return 'Умеренное';
  if (aqi <= 150) return 'Вредное для чувствительных';
  if (aqi <= 200) return 'Вредное';
  if (aqi <= 300) return 'Очень вредное';
  return 'Опасное';
}

// Fetch AQI data from WAQI API
async function fetchAqiData(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_API_TOKEN}`
    );
    const data = await response.json();

    if (data.status === 'ok' && data.data) {
      return {
        aqi: data.data.aqi,
        category: getAqiCategory(data.data.aqi),
        station: data.data.city?.name,
        dominentPol: data.data.dominentpol,
        iaqi: data.data.iaqi,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return null;
  }
}

// Fetch weather data from Open-Meteo (free, no API key needed)
async function fetchWeatherData(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,uv_index&timezone=auto`
    );
    const data = await response.json();

    if (data.current) {
      const weatherCode = data.current.weather_code;
      const { description, icon } = getWeatherDescription(weatherCode);

      return {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        pressure: Math.round(data.current.surface_pressure),
        uvIndex: data.current.uv_index,
        weatherDescription: description,
        weatherIcon: icon,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Get weather description from WMO weather code
function getWeatherDescription(code: number): { description: string; icon: string } {
  const weatherCodes: Record<number, { description: string; icon: string }> = {
    0: { description: 'Ясно', icon: '☀️' },
    1: { description: 'Преимущественно ясно', icon: '🌤️' },
    2: { description: 'Переменная облачность', icon: '⛅' },
    3: { description: 'Пасмурно', icon: '☁️' },
    45: { description: 'Туман', icon: '🌫️' },
    48: { description: 'Изморозь', icon: '🌫️' },
    51: { description: 'Лёгкая морось', icon: '🌧️' },
    53: { description: 'Морось', icon: '🌧️' },
    55: { description: 'Сильная морось', icon: '🌧️' },
    61: { description: 'Небольшой дождь', icon: '🌧️' },
    63: { description: 'Дождь', icon: '🌧️' },
    65: { description: 'Сильный дождь', icon: '🌧️' },
    71: { description: 'Небольшой снег', icon: '🌨️' },
    73: { description: 'Снег', icon: '🌨️' },
    75: { description: 'Сильный снег', icon: '🌨️' },
    77: { description: 'Снежная крупа', icon: '🌨️' },
    80: { description: 'Ливень', icon: '🌧️' },
    81: { description: 'Сильный ливень', icon: '🌧️' },
    82: { description: 'Очень сильный ливень', icon: '⛈️' },
    85: { description: 'Снегопад', icon: '🌨️' },
    86: { description: 'Сильный снегопад', icon: '🌨️' },
    95: { description: 'Гроза', icon: '⛈️' },
    96: { description: 'Гроза с градом', icon: '⛈️' },
    99: { description: 'Сильная гроза', icon: '⛈️' },
  };

  return weatherCodes[code] || { description: 'Неизвестно', icon: '❓' };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Parse request body
    const body: RequestBody = await req.json();
    const { action, latitude, longitude, cityName } = body;

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${action} for user ${userId} at ${latitude}, ${longitude}`);

    // Fetch AQI and weather data in parallel
    const [aqiData, weatherData] = await Promise.all([
      fetchAqiData(latitude, longitude),
      fetchWeatherData(latitude, longitude),
    ]);

    console.log('AQI Data:', aqiData);
    console.log('Weather Data:', weatherData);

    // Update database using RPC function
    const { data: upsertResult, error: upsertError } = await supabase.rpc('upsert_user_environment', {
      _user_id: userId,
      _latitude: latitude,
      _longitude: longitude,
      _city_name: cityName || null,
      _current_aqi: aqiData?.aqi || null,
      _aqi_category: aqiData?.category || null,
      _temperature: weatherData?.temperature || null,
      _humidity: weatherData?.humidity || null,
      _wind_speed: weatherData?.windSpeed || null,
      _weather_description: weatherData?.weatherDescription || null,
      _weather_icon: weatherData?.weatherIcon || null,
      _uv_index: weatherData?.uvIndex || null,
      _pressure: weatherData?.pressure || null,
      _visibility: null,
    });

    if (upsertError) {
      console.error('Error upserting environment data:', upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          location: { latitude, longitude, cityName },
          aqi: aqiData,
          weather: weatherData,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in user-environment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
