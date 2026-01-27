import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AQIStation, StationDetails } from '@/hooks/useAirQualityData';
import { StationPopupContent } from './InteractiveAQIMap';
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

interface LeafletMapProps {
  stations: AQIStation[];
  selectedStation: StationDetails | null;
  activeStationId: number | null;
  isLoading: boolean;
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onMarkerClick: (station: AQIStation) => void;
  onLoadDetails: (station: AQIStation) => void;
}

export default function LeafletMap({
  stations,
  selectedStation,
  activeStationId,
  isLoading,
  onBoundsChange,
  onMarkerClick,
  onLoadDetails,
}: LeafletMapProps) {
  const defaultCenter: [number, number] = [43.238949, 76.945465];
  const defaultZoom = 11;

  return (
    <>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full z-0"
        style={{ background: 'hsl(var(--muted))' }}
      >
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
      </MapContainer>

      <AQILegend />

      <div className="absolute top-4 right-4 z-[1000] glass-card rounded-lg px-3 py-2">
        <span className="text-sm font-medium">{stations.length} станций</span>
      </div>
    </>
  );
}
