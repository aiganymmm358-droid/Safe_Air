import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAirQualityData, AQIStation, StationDetails } from '@/hooks/useAirQualityData';
import { Loader2, RefreshCw, Locate, Layers, X, Wind, Droplets, Thermometer, Clock, AlertTriangle } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// AQI color utilities
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#22c55e'; // Good - green
  if (aqi <= 100) return '#eab308'; // Moderate - yellow
  if (aqi <= 150) return '#f97316'; // Unhealthy for sensitive - orange
  if (aqi <= 200) return '#ef4444'; // Unhealthy - red
  if (aqi <= 300) return '#8b5cf6'; // Very unhealthy - purple
  return '#7c2d12'; // Hazardous - maroon
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

// Create custom marker icon
const createAQIMarker = (aqi: number): L.DivIcon => {
  const color = getAQIColor(aqi);
  return L.divIcon({
    className: 'custom-aqi-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        font-weight: bold;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        min-width: 28px;
        text-align: center;
      ">${aqi}</div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });
};

interface LiveAQIMapProps {
  className?: string;
}

export const LiveAQIMap = ({ className = '' }: LiveAQIMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  
  const { stations, isLoading, error, fetchStationsInBounds, fetchStationDetails, selectedStation, clearSelectedStation } = useAirQualityData();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStationInfo, setSelectedStationInfo] = useState<AQIStation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered on Almaty
    const map = L.map(mapRef.current, {
      center: [43.238949, 76.945465],
      zoom: 12,
      zoomControl: false,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create markers layer
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Fetch data on map move
    const fetchData = () => {
      const bounds = map.getBounds();
      fetchStationsInBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
      setLastUpdate(new Date());
    };

    map.on('moveend', fetchData);
    
    // Initial fetch
    fetchData();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [fetchStationsInBounds]);

  // Update markers when stations change
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add markers for each station
    stations.forEach((station) => {
      if (station.aqi <= 0) return; // Skip invalid readings

      const marker = L.marker([station.lat, station.lng], {
        icon: createAQIMarker(station.aqi),
      });

      marker.on('click', async () => {
        setSelectedStationInfo(station);
        setShowDetails(true);
        await fetchStationDetails(station.lat, station.lng);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [stations, fetchStationDetails]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const bounds = mapInstanceRef.current.getBounds();
    fetchStationsInBounds({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
    setLastUpdate(new Date());
  }, [fetchStationsInBounds]);

  // Locate user
  const handleLocate = useCallback(() => {
    if (!mapInstanceRef.current) return;
    setIsLocating(true);

    mapInstanceRef.current.locate({ setView: true, maxZoom: 14 });

    mapInstanceRef.current.once('locationfound', (e) => {
      setIsLocating(false);
      
      // Remove previous user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(mapInstanceRef.current!);
      userMarkerRef.current.bindPopup('📍 Вы здесь').openPopup();
    });

    mapInstanceRef.current.once('locationerror', () => {
      setIsLocating(false);
      console.error('Location access denied');
    });
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(handleRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedStationInfo(null);
    clearSelectedStation();
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-card px-4 py-2 rounded-full flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">Загрузка данных...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="glass-card p-3 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
          title="Обновить данные"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className="glass-card p-3 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
          title="Моё местоположение"
        >
          <Locate className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-card rounded-xl p-3">
        <p className="text-xs font-medium mb-2">Качество воздуха (AQI)</p>
        <div className="flex gap-1">
          {[
            { color: '#22c55e', label: '0-50' },
            { color: '#eab308', label: '51-100' },
            { color: '#f97316', label: '101-150' },
            { color: '#ef4444', label: '151-200' },
            { color: '#8b5cf6', label: '201-300' },
            { color: '#7c2d12', label: '300+' },
          ].map((item, i) => (
            <div
              key={i}
              className="w-6 h-3 rounded"
              style={{ backgroundColor: item.color }}
              title={item.label}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Хорошо</span>
          <span>Опасно</span>
        </div>
      </div>

      {/* Station count & last update */}
      <div className="absolute bottom-4 right-20 z-10 glass-card rounded-xl px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-aqi-good rounded-full animate-pulse" />
          <span>{stations.length} станций</span>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            <span>Обновлено {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      {/* Station details panel */}
      {showDetails && selectedStationInfo && (
        <div className="absolute top-4 left-4 z-20 w-80 glass-card rounded-2xl p-4 shadow-elevated animate-scale-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg line-clamp-2">{selectedStationInfo.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedStationInfo.lat.toFixed(4)}, {selectedStationInfo.lng.toFixed(4)}
              </p>
            </div>
            <button onClick={closeDetails} className="p-1 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main AQI display */}
          <div 
            className="rounded-xl p-4 text-center mb-4"
            style={{ backgroundColor: `${getAQIColor(selectedStationInfo.aqi)}20` }}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{getAQIEmoji(selectedStationInfo.aqi)}</span>
              <div>
                <p className="text-4xl font-display font-bold" style={{ color: getAQIColor(selectedStationInfo.aqi) }}>
                  {selectedStationInfo.aqi}
                </p>
                <p className="text-sm font-medium">{getAQILabel(selectedStationInfo.aqi)}</p>
              </div>
            </div>
          </div>

          {/* Detailed pollutants */}
          {selectedStation && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedStation.pollutants.pm25 !== undefined && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{selectedStation.pollutants.pm25}</p>
                    <p className="text-xs text-muted-foreground">PM2.5</p>
                  </div>
                )}
                {selectedStation.pollutants.pm10 !== undefined && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{selectedStation.pollutants.pm10}</p>
                    <p className="text-xs text-muted-foreground">PM10</p>
                  </div>
                )}
                {selectedStation.pollutants.o3 !== undefined && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{selectedStation.pollutants.o3}</p>
                    <p className="text-xs text-muted-foreground">O₃</p>
                  </div>
                )}
                {selectedStation.pollutants.no2 !== undefined && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{selectedStation.pollutants.no2}</p>
                    <p className="text-xs text-muted-foreground">NO₂</p>
                  </div>
                )}
              </div>

              {/* Weather info */}
              <div className="flex items-center justify-around text-sm border-t border-border pt-3">
                {selectedStation.weather.temperature !== undefined && (
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-destructive" />
                    <span>{selectedStation.weather.temperature}°C</span>
                  </div>
                )}
                {selectedStation.weather.humidity !== undefined && (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-secondary" />
                    <span>{selectedStation.weather.humidity}%</span>
                  </div>
                )}
                {selectedStation.weather.wind !== undefined && (
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-primary" />
                    <span>{selectedStation.weather.wind} м/с</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 text-center">
                Обновлено: {selectedStation.time}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
