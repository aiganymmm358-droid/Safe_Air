import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAirQualityData, AQIStation, StationDetails } from '@/hooks/useAirQualityData';
import { Loader2, Wind, Droplets, Thermometer, AlertTriangle, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

const createAQIIcon = (aqi: number) => {
  const color = getAQIColor(aqi);
  const size = aqi > 150 ? 40 : 32;
  
  return L.divIcon({
    className: 'custom-aqi-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${aqi > 150 ? '12px' : '11px'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        ${aqi}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface MapBoundsHandlerProps {
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

function MapBoundsHandler({ onBoundsChange }: MapBoundsHandlerProps) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    // Initial fetch
    handleMoveEnd();

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

interface StationPopupContentProps {
  station: AQIStation;
  details: StationDetails | null;
  onLoadDetails: () => void;
  isLoading: boolean;
}

function StationPopupContent({ station, details, onLoadDetails, isLoading }: StationPopupContentProps) {
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

function AQILegend() {
  const levels = [
    { range: '0-50', label: 'Отлично', color: '#22c55e' },
    { range: '51-100', label: 'Умеренно', color: '#eab308' },
    { range: '101-150', label: 'Для чувствительных', color: '#f97316' },
    { range: '151-200', label: 'Нездорово', color: '#ef4444' },
    { range: '201-300', label: 'Очень нездорово', color: '#a855f7' },
    { range: '300+', label: 'Опасно', color: '#7f1d1d' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] glass-card rounded-xl p-3">
      <h4 className="font-semibold text-xs mb-2">Индекс AQI</h4>
      <div className="space-y-1">
        {levels.map((level) => (
          <div key={level.range} className="flex items-center gap-2 text-xs">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-muted-foreground">{level.range}</span>
            <span>{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MapContentProps {
  stations: AQIStation[];
  selectedStation: StationDetails | null;
  activeStationId: number | null;
  isLoading: boolean;
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onMarkerClick: (station: AQIStation) => void;
  onLoadDetails: (station: AQIStation) => void;
}

function MapContent({
  stations,
  selectedStation,
  activeStationId,
  isLoading,
  onBoundsChange,
  onMarkerClick,
  onLoadDetails,
}: MapContentProps) {
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsHandler onBoundsChange={onBoundsChange} />
      {stations.map((station) => (
        <Marker
          key={station.uid}
          position={[station.lat, station.lng]}
          icon={createAQIIcon(station.aqi)}
          eventHandlers={{
            click: () => onMarkerClick(station),
          }}
        >
          <Popup>
            <StationPopupContent
              station={station}
              details={activeStationId === station.uid ? selectedStation : null}
              onLoadDetails={() => onLoadDetails(station)}
              isLoading={isLoading && activeStationId === station.uid}
            />
          </Popup>
        </Marker>
      ))}
    </>
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

  const defaultCenter: [number, number] = [43.238949, 76.945465];
  const defaultZoom = 11;

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
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          className="h-full w-full z-0"
          style={{ background: 'hsl(var(--muted))' }}
        >
          <MapContent
            stations={stations}
            selectedStation={selectedStation}
            activeStationId={activeStationId}
            isLoading={isLoading}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
            onLoadDetails={handleLoadDetails}
          />
        </MapContainer>

        <AQILegend />

        <div className="absolute top-4 right-4 z-[1000] glass-card rounded-lg px-3 py-2">
          <span className="text-sm font-medium">{stations.length} станций</span>
        </div>
      </div>

      <div className="p-3 border-t border-border/50 text-xs text-muted-foreground text-center">
        Данные предоставлены <a href="https://aqicn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">World Air Quality Index Project</a>
      </div>
    </div>
  );
}
