import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAirQualityData, AQIStation } from '@/hooks/useAirQualityData';
import { pollutionSources, PollutionSource } from '@/data/pollutionSources';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapStatusBar } from './MapStatusBar';
import { StationDetailsPanel } from './StationDetailsPanel';
import { PollutionSourcePanel } from './PollutionSourcePanel';
import { useMapMarkers } from './useMapMarkers';
import { useUserLocation } from './useUserLocation';
import { Loader2, AlertTriangle } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface AQIMapProps {
  className?: string;
}

export const AQIMap = ({ className = '' }: AQIMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

    // Add tile layer with better styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

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
    fetchData();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
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

  // Use map markers hook
  useMapMarkers({
    map: mapInstanceRef.current,
    stations,
    pollutionSources,
    showPollutionSources,
    onStationClick: handleStationClick,
    onPollutionClick: handlePollutionClick,
  });

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
