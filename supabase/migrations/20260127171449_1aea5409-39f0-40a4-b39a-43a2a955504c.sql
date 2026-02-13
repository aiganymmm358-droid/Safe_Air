-- Add location columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS city_name TEXT,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

-- Create table for user weather/environment data cache
CREATE TABLE public.user_environment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city_name TEXT,
  current_aqi INTEGER,
  aqi_category TEXT,
  temperature DOUBLE PRECISION,
  humidity INTEGER,
  wind_speed DOUBLE PRECISION,
  weather_description TEXT,
  weather_icon TEXT,
  uv_index DOUBLE PRECISION,
  pressure INTEGER,
  visibility INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_environment_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_environment_data
CREATE POLICY "Users can view their own environment data"
ON public.user_environment_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own environment data"
ON public.user_environment_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own environment data"
ON public.user_environment_data FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Function to update or create environment data
CREATE OR REPLACE FUNCTION public.upsert_user_environment(
  _user_id UUID,
  _latitude DOUBLE PRECISION,
  _longitude DOUBLE PRECISION,
  _city_name TEXT DEFAULT NULL,
  _current_aqi INTEGER DEFAULT NULL,
  _aqi_category TEXT DEFAULT NULL,
  _temperature DOUBLE PRECISION DEFAULT NULL,
  _humidity INTEGER DEFAULT NULL,
  _wind_speed DOUBLE PRECISION DEFAULT NULL,
  _weather_description TEXT DEFAULT NULL,
  _weather_icon TEXT DEFAULT NULL,
  _uv_index DOUBLE PRECISION DEFAULT NULL,
  _pressure INTEGER DEFAULT NULL,
  _visibility INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.user_environment_data (
    user_id, latitude, longitude, city_name, current_aqi, aqi_category,
    temperature, humidity, wind_speed, weather_description, weather_icon,
    uv_index, pressure, visibility, updated_at
  )
  VALUES (
    _user_id, _latitude, _longitude, _city_name, _current_aqi, _aqi_category,
    _temperature, _humidity, _wind_speed, _weather_description, _weather_icon,
    _uv_index, _pressure, _visibility, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    city_name = COALESCE(EXCLUDED.city_name, user_environment_data.city_name),
    current_aqi = COALESCE(EXCLUDED.current_aqi, user_environment_data.current_aqi),
    aqi_category = COALESCE(EXCLUDED.aqi_category, user_environment_data.aqi_category),
    temperature = COALESCE(EXCLUDED.temperature, user_environment_data.temperature),
    humidity = COALESCE(EXCLUDED.humidity, user_environment_data.humidity),
    wind_speed = COALESCE(EXCLUDED.wind_speed, user_environment_data.wind_speed),
    weather_description = COALESCE(EXCLUDED.weather_description, user_environment_data.weather_description),
    weather_icon = COALESCE(EXCLUDED.weather_icon, user_environment_data.weather_icon),
    uv_index = COALESCE(EXCLUDED.uv_index, user_environment_data.uv_index),
    pressure = COALESCE(EXCLUDED.pressure, user_environment_data.pressure),
    visibility = COALESCE(EXCLUDED.visibility, user_environment_data.visibility),
    updated_at = now()
  RETURNING id INTO v_id;
  
  -- Also update profile location
  UPDATE public.profiles
  SET 
    latitude = _latitude,
    longitude = _longitude,
    city_name = COALESCE(_city_name, city_name),
    location_updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN v_id;
END;
$$;

-- Create progress for existing users who don't have it
INSERT INTO public.user_progress (user_id, level, xp, xp_to_next_level, eco_coins)
SELECT id, 1, 0, 100, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_progress)
ON CONFLICT DO NOTHING;

-- Create welcome achievement for existing users who don't have it
INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon)
SELECT id, 'welcome', 'Добро пожаловать!', 'Первый вход в SafeAir Pro', '🎉'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_achievements WHERE achievement_id = 'welcome')
ON CONFLICT DO NOTHING;