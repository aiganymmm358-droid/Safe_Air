import { useState, useCallback, lazy, Suspense } from "react";
import { useAirQualityData, AQIStation } from "@/hooks/useAirQualityData";
import { Loader2, AlertTriangle, MapPin } from "lucide-react";

// NOTE: Keep Leaflet/react-leaflet isolated in a lazily-loaded module.
// This avoids crashes and prevents circular imports.
const LeafletMap = lazy(() => import("@/components/aqi-map/LeafletMap"));

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
