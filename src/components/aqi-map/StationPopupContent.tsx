import { AQIStation, StationDetails } from "@/hooks/useAirQualityData";
import { Button } from "@/components/ui/button";
import { Loader2, Wind, Droplets, Thermometer } from "lucide-react";
import { getAQIColor, getAQILabel } from "@/components/aqi-map/aqiUtils";

interface StationPopupContentProps {
  station: AQIStation;
  details: StationDetails | null;
  onLoadDetails: () => void;
  isLoading: boolean;
}

export function StationPopupContent({ station, details, onLoadDetails, isLoading }: StationPopupContentProps) {
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
          <p className="text-muted-foreground text-xs">Обновлено: {new Date(details.time).toLocaleString("ru-RU")}</p>

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
        <Button onClick={onLoadDetails} disabled={isLoading} size="sm" variant="outline" className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            "Подробнее"
          )}
        </Button>
      )}
    </div>
  );
}
