import { MapPin, Thermometer, Wind, Droplets, Loader2 } from 'lucide-react';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LocationWidget() {
  const {
    effectiveLocation,
    environmentData,
    isLoading,
    isLocating,
    error,
    permissionStatus,
    requestLocation,
  } = useGeolocationContext();

  const getAqiColor = (aqi: number | null) => {
    if (!aqi) return 'bg-muted text-muted-foreground';
    if (aqi <= 50) return 'bg-aqi-good text-white';
    if (aqi <= 100) return 'bg-aqi-moderate text-white';
    if (aqi <= 150) return 'bg-aqi-unhealthy-sensitive text-white';
    if (aqi <= 200) return 'bg-aqi-unhealthy text-white';
    if (aqi <= 300) return 'bg-aqi-very-unhealthy text-white';
    return 'bg-aqi-hazardous text-white';
  };

  if (isLoading || isLocating) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          {isLocating ? 'Определение местоположения...' : 'Загрузка данных...'}
        </span>
      </div>
    );
  }

  if (permissionStatus === 'denied' || error) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={requestLocation}
            className="gap-2"
          >
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{effectiveLocation.cityName || 'Местоположение'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Нажмите, чтобы обновить местоположение</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Location */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={requestLocation}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {effectiveLocation.cityName || 'Ваше местоположение'}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Нажмите для обновления местоположения</p>
        </TooltipContent>
      </Tooltip>

      {/* AQI Badge */}
      {environmentData?.current_aqi !== null && environmentData?.current_aqi !== undefined && (
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`${getAqiColor(environmentData.current_aqi)} font-bold`}>
              AQI {environmentData.current_aqi}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{environmentData.aqi_category || 'Качество воздуха'}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Weather */}
      {environmentData?.temperature !== null && environmentData?.temperature !== undefined && (
        <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <span className="text-lg">{environmentData.weather_icon}</span>
              <Thermometer className="w-3.5 h-3.5" />
              <span>{Math.round(environmentData.temperature)}°C</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{environmentData.weather_description}</p>
            </TooltipContent>
          </Tooltip>

          {environmentData.humidity !== null && (
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>{environmentData.humidity}%</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Влажность</p>
              </TooltipContent>
            </Tooltip>
          )}

          {environmentData.wind_speed !== null && (
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-0.5">
                <Wind className="w-3 h-3" />
                <span className="tabular-nums">{Math.round(environmentData.wind_speed)}</span>
                <span className="text-xs">км/ч</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Скорость ветра</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
