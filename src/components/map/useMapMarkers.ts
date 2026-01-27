import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AQIStation } from '@/hooks/useAirQualityData';
import { PollutionSource, harmLevelColors, categoryIcons } from '@/data/pollutionSources';

// AQI marker colors
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'hsl(152, 80%, 45%)';
  if (aqi <= 100) return 'hsl(48, 95%, 50%)';
  if (aqi <= 150) return 'hsl(28, 95%, 55%)';
  if (aqi <= 200) return 'hsl(12, 85%, 55%)';
  if (aqi <= 300) return 'hsl(340, 75%, 50%)';
  return 'hsl(280, 60%, 35%)';
};

// Create AQI station marker
export const createAQIMarker = (aqi: number): L.DivIcon => {
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
        transition: transform 0.2s ease;
      ">${aqi}</div>
    `,
    iconSize: [44, 28],
    iconAnchor: [22, 14],
  });
};

// Create pollution source marker
export const createPollutionMarker = (source: PollutionSource): L.DivIcon => {
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
        transition: transform 0.2s ease;
      ">${icon}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

interface UseMapMarkersProps {
  map: L.Map | null;
  stations: AQIStation[];
  pollutionSources: PollutionSource[];
  showPollutionSources: boolean;
  onStationClick: (station: AQIStation) => void;
  onPollutionClick: (source: PollutionSource) => void;
}

export const useMapMarkers = ({
  map,
  stations,
  pollutionSources,
  showPollutionSources,
  onStationClick,
  onPollutionClick,
}: UseMapMarkersProps) => {
  const stationLayerRef = useRef<L.LayerGroup | null>(null);
  const pollutionLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize layers
  useEffect(() => {
    if (!map) return;

    stationLayerRef.current = L.layerGroup().addTo(map);
    pollutionLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      stationLayerRef.current?.remove();
      pollutionLayerRef.current?.remove();
    };
  }, [map]);

  // Update station markers
  useEffect(() => {
    if (!stationLayerRef.current) return;

    stationLayerRef.current.clearLayers();

    stations.forEach((station) => {
      if (station.aqi <= 0) return;

      const marker = L.marker([station.lat, station.lng], {
        icon: createAQIMarker(station.aqi),
      });

      marker.on('click', () => onStationClick(station));
      marker.addTo(stationLayerRef.current!);
    });
  }, [stations, onStationClick]);

  // Update pollution source markers
  useEffect(() => {
    if (!pollutionLayerRef.current) return;

    pollutionLayerRef.current.clearLayers();

    if (!showPollutionSources) return;

    pollutionSources.forEach((source) => {
      const marker = L.marker([source.lat, source.lng], {
        icon: createPollutionMarker(source),
      });

      marker.on('click', () => onPollutionClick(source));
      marker.addTo(pollutionLayerRef.current!);
    });
  }, [pollutionSources, showPollutionSources, onPollutionClick]);
};
