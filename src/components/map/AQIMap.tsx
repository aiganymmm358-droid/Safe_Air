import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAirQualityData, AQIStation } from '@/hooks/useAirQualityData';
import { pollutionSources, PollutionSource, harmLevelColors, categoryIcons } from '@/data/pollutionSources';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapStatusBar } from './MapStatusBar';
import { StationDetailsPanel } from './StationDetailsPanel';
import { PollutionSourcePanel } from './PollutionSourcePanel';
import { useUserLocation } from './useUserLocation';
import { Loader2, AlertTriangle } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// AQI marker colors
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#7f1d1d';
};

// Create AQI station marker
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
        padding: 6px 10px;
        border-radius: 20px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
        min-width: 32px;
        text-align: center;
        cursor: pointer;
      ">${aqi}</div>
    `,
    iconSize: [44, 28],
    iconAnchor: [22, 14],
  });
};

// Create pollution source marker
const createPollutionMarker = (source: PollutionSource): L.DivIcon => {
  const color = harmLevelColors[source.harmLevel];
  const icon = categoryIcons[source.category];
  
  return L.divIcon({
    className: 'custom-pollution-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 8px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
      ">${icon}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

interface AQIMapProps {
  className?: string;
}

export const AQIMap = ({ className = '' }: AQIMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stationLayerRef = useRef<L.LayerGroup | null>(null);
  const pollutionLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { 
    stations, 
    isLoading, 
    error, 
    fetchStationsInBounds, 
    fetchStationDetails, 
    selectedStation, 
    clearSelectedStation 
  } = useAirQualityData();

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedStationInfo, setSelectedStationInfo] = useState<AQIStation | null>(null);
  const [selectedPollutionSource, setSelectedPollutionSource] = useState<PollutionSource | null>(null);
  const [showPollutionSources, setShowPollutionSources] = useState(true);

  const { isLocating, locateUser } = useUserLocation();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [43.238949, 76.945465],
      zoom: 12,
      zoomControl: false,
    });

    // Add tile layer - CartoDB Positron for clean look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create marker layers
    stationLayerRef.current = L.layerGroup().addTo(map);
    pollutionLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Fetch initial data
    const bounds = map.getBounds();
    fetchStationsInBounds({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
    setLastUpdate(new Date());

    // Fetch data on map move
    const handleMoveEnd = () => {
      const newBounds = map.getBounds();
      fetchStationsInBounds({
        north: newBounds.getNorth(),
        south: newBounds.getSouth(),
        east: newBounds.getEast(),
        west: newBounds.getWest(),
      });
      setLastUpdate(new Date());
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.remove();
      mapInstanceRef.current = null;
      stationLayerRef.current = null;
      pollutionLayerRef.current = null;
      setMapReady(false);
    };
  }, [fetchStationsInBounds]);

  // Handle station click
  const handleStationClick = useCallback(async (station: AQIStation) => {
    setSelectedPollutionSource(null);
    setSelectedStationInfo(station);
    await fetchStationDetails(station.lat, station.lng);
  }, [fetchStationDetails]);

  // Handle pollution source click
  const handlePollutionClick = useCallback((source: PollutionSource) => {
    setSelectedStationInfo(null);
    clearSelectedStation();
    setSelectedPollutionSource(source);
  }, [clearSelectedStation]);

  // Update station markers when stations change
  useEffect(() => {
    if (!mapReady || !stationLayerRef.current) return;

    stationLayerRef.current.clearLayers();

    stations.forEach((station) => {
      if (station.aqi <= 0) return;

      const marker = L.marker([station.lat, station.lng], {
        icon: createAQIMarker(station.aqi),
      });

      marker.on('click', () => handleStationClick(station));
      marker.addTo(stationLayerRef.current!);
    });
  }, [stations, mapReady, handleStationClick]);

  // Update pollution source markers
  useEffect(() => {
    if (!mapReady || !pollutionLayerRef.current) return;

    pollutionLayerRef.current.clearLayers();

    if (!showPollutionSources) return;

    pollutionSources.forEach((source) => {
      const marker = L.marker([source.lat, source.lng], {
        icon: createPollutionMarker(source),
      });

      marker.on('click', () => handlePollutionClick(source));
      marker.addTo(pollutionLayerRef.current!);
    });
  }, [showPollutionSources, mapReady, handlePollutionClick]);

  // Refresh handler
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

  // Locate user handler
  const handleLocate = useCallback(() => {
    if (mapInstanceRef.current) {
      locateUser(mapInstanceRef.current);
    }
  }, [locateUser]);

  // Toggle pollution sources
  const handleTogglePollution = useCallback(() => {
    setShowPollutionSources((prev) => !prev);
  }, []);

  // Close panels
  const closeStationPanel = useCallback(() => {
    setSelectedStationInfo(null);
    clearSelectedStation();
  }, [clearSelectedStation]);

  const closePollutionPanel = useCallback(() => {
    setSelectedPollutionSource(null);
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(handleRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

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

      {/* Controls */}
      <MapControls
        isLoading={isLoading}
        isLocating={isLocating}
        showPollutionSources={showPollutionSources}
        onRefresh={handleRefresh}
        onLocate={handleLocate}
        onTogglePollution={handleTogglePollution}
      />

      {/* Legend */}
      <MapLegend showPollutionSources={showPollutionSources} />

      {/* Status bar */}
      <MapStatusBar
        stationCount={stations.length}
        pollutionSourceCount={pollutionSources.length}
        showPollutionSources={showPollutionSources}
        lastUpdate={lastUpdate}
      />

      {/* Station details panel */}
      {selectedStationInfo && (
        <StationDetailsPanel
          station={selectedStationInfo}
          details={selectedStation}
          onClose={closeStationPanel}
        />
      )}

      {/* Pollution source panel */}
      {selectedPollutionSource && (
        <PollutionSourcePanel
          source={selectedPollutionSource}
          onClose={closePollutionPanel}
        />
      )}
    </div>
  );
};
