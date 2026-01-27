import { X, Thermometer, Droplets, Wind } from 'lucide-react';
import { AQIStation, StationDetails } from '@/hooks/useAirQualityData';

interface StationDetailsPanelProps {
  station: AQIStation;
  details: StationDetails | null;
  onClose: () => void;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'hsl(152, 80%, 45%)';
  if (aqi <= 100) return 'hsl(48, 95%, 50%)';
  if (aqi <= 150) return 'hsl(28, 95%, 55%)';
  if (aqi <= 200) return 'hsl(12, 85%, 55%)';
  if (aqi <= 300) return 'hsl(340, 75%, 50%)';
  return 'hsl(280, 60%, 35%)';
};

const getAQILabel = (aqi: number): string => {
  if (aqi <= 50) return 'Хорошо';
  if (aqi <= 100) return 'Умеренно';
  if (aqi <= 150) return 'Нездорово для чувствительных';
  if (aqi <= 200) return 'Нездорово';
  if (aqi <= 300) return 'Очень нездорово';
  return 'Опасно';
};

const getAQIEmoji = (aqi: number): string => {
  if (aqi <= 50) return '😊';
  if (aqi <= 100) return '🙂';
  if (aqi <= 150) return '😐';
  if (aqi <= 200) return '😷';
  if (aqi <= 300) return '🤢';
  return '☠️';
};

export const StationDetailsPanel = ({ station, details, onClose }: StationDetailsPanelProps) => {
  const color = getAQIColor(station.aqi);

  return (
    <div className="absolute top-4 left-4 z-20 w-80 glass-card rounded-2xl p-4 shadow-elevated animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-2">
          <h3 className="font-display font-bold text-lg line-clamp-2">{station.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main AQI display */}
      <div
        className="rounded-xl p-4 text-center mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">{getAQIEmoji(station.aqi)}</span>
          <div>
            <p className="text-4xl font-display font-bold" style={{ color }}>
              {station.aqi}
            </p>
            <p className="text-sm font-medium">{getAQILabel(station.aqi)}</p>
          </div>
        </div>
      </div>

      {/* Detailed pollutants */}
      {details && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {details.pollutants.pm25 !== undefined && (
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold">{details.pollutants.pm25}</p>
                <p className="text-xs text-muted-foreground">PM2.5</p>
              </div>
            )}
            {details.pollutants.pm10 !== undefined && (
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold">{details.pollutants.pm10}</p>
                <p className="text-xs text-muted-foreground">PM10</p>
              </div>
            )}
            {details.pollutants.o3 !== undefined && (
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold">{details.pollutants.o3}</p>
                <p className="text-xs text-muted-foreground">O₃</p>
              </div>
            )}
            {details.pollutants.no2 !== undefined && (
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold">{details.pollutants.no2}</p>
                <p className="text-xs text-muted-foreground">NO₂</p>
              </div>
            )}
          </div>

          {/* Weather info */}
          <div className="flex items-center justify-around text-sm border-t border-border pt-3">
            {details.weather.temperature !== undefined && (
              <div className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-destructive" />
                <span>{details.weather.temperature}°C</span>
              </div>
            )}
            {details.weather.humidity !== undefined && (
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-secondary" />
                <span>{details.weather.humidity}%</span>
              </div>
            )}
            {details.weather.wind !== undefined && (
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4 text-primary" />
                <span>{details.weather.wind} м/с</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Обновлено: {details.time}
          </p>
        </>
      )}
    </div>
  );
};
