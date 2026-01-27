import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useAirQualityData, AQIStation, StationDetails } from '@/hooks/useAirQualityData';
import { Loader2, Wind, Droplets, Thermometer, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load the map component to avoid SSR issues
const LeafletMap = lazy(() => import('./LeafletMap'));

interface StationPopupContentProps {
  station: AQIStation;
  details: StationDetails | null;
  onLoadDetails: () => void;
  isLoading: boolean;
}

export function StationPopupContent({ station, details, onLoadDetails, isLoading }: StationPopupContentProps) {
  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#7f1d1d';
  };

  const getAQILabel = (aqi: number): string => {
    if (aqi <= 50) return 'Отлично';
    if (aqi <= 100) return 'Умеренно';
    if (aqi <= 150) return 'Нездорово для чувствительных';
    if (aqi <= 200) return 'Нездорово';
    if (aqi <= 300) return 'Очень нездорово';
    return 'Опасно';
  };

  const color = getAQIColor(station.aqi);
  const label = getAQILabel(station.aqi);

  return (
    <div className="min-w-[250px] p-2">
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color }}
        >
          {station.aqi}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{station.name}</h3>
          <span 
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
        </div>
      </div>

      {details ? (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground text-xs">
            Обновлено: {new Date(details.time).toLocaleString('ru-RU')}
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {details.pollutants.pm25 !== undefined && (
              <div className="bg-muted/50 rounded p-2">
                <span className="text-xs text-muted-foreground">PM2.5</span>
                <p className="font-semibold">{details.pollutants.pm25}</p>
              </div>
            )}
            {details.pollutants.pm10 !== undefined && (
              <div className="bg-muted/50 rounded p-2">
                <span className="text-xs text-muted-foreground">PM10</span>
                <p className="font-semibold">{details.pollutants.pm10}</p>
              </div>
            )}
            {details.pollutants.o3 !== undefined && (
              <div className="bg-muted/50 rounded p-2">
                <span className="text-xs text-muted-foreground">O₃</span>
                <p className="font-semibold">{details.pollutants.o3}</p>
              </div>
            )}
            {details.pollutants.no2 !== undefined && (
              <div className="bg-muted/50 rounded p-2">
                <span className="text-xs text-muted-foreground">NO₂</span>
                <p className="font-semibold">{details.pollutants.no2}</p>
              </div>
            )}
          </div>

          {(details.weather.temperature !== undefined || details.weather.humidity !== undefined) && (
            <div className="flex gap-3 text-xs text-muted-foreground mt-2">
              {details.weather.temperature !== undefined && (
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  {details.weather.temperature}°C
                </span>
              )}
              {details.weather.humidity !== undefined && (
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {details.weather.humidity}%
                </span>
              )}
              {details.weather.wind !== undefined && (
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  {details.weather.wind} м/с
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button 
          onClick={onLoadDetails} 
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            'Подробнее'
          )}
        </Button>
      )}
    </div>
  );
}

function MapLoadingFallback() {
  return (
    <div className="h-[400px] flex items-center justify-center bg-muted/50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка карты...</p>
      </div>
    </div>
  );
}

export function InteractiveAQIMap() {
  const { 
    stations, 
    selectedStation, 
    isLoading, 
    error, 
    fetchStationsInBounds, 
    fetchStationDetails,
    clearSelectedStation 
  } = useAirQualityData();
  
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleBoundsChange = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    fetchStationsInBounds(bounds);
    setLastUpdate(new Date());
  }, [fetchStationsInBounds]);

  const handleMarkerClick = (station: AQIStation) => {
    setActiveStationId(station.uid);
    clearSelectedStation();
  };

  const handleLoadDetails = async (station: AQIStation) => {
    await fetchStationDetails(station.lat, station.lng);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-elevated animate-fade-in">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Карта качества воздуха</h3>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="relative h-[400px]">
        <Suspense fallback={<MapLoadingFallback />}>
          <LeafletMap
            stations={stations}
            selectedStation={selectedStation}
            activeStationId={activeStationId}
            isLoading={isLoading}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
            onLoadDetails={handleLoadDetails}
          />
        </Suspense>
      </div>

      <div className="p-3 border-t border-border/50 text-xs text-muted-foreground text-center">
        Данные предоставлены <a href="https://aqicn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">World Air Quality Index Project</a>
      </div>
    </div>
  );
}
