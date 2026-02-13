import { Clock } from 'lucide-react';

interface MapStatusBarProps {
  stationCount: number;
  pollutionSourceCount: number;
  showPollutionSources: boolean;
  lastUpdate: Date | null;
}

export const MapStatusBar = ({
  stationCount,
  pollutionSourceCount,
  showPollutionSources,
  lastUpdate,
}: MapStatusBarProps) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 glass-card rounded-xl px-3 py-2 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>{stationCount} станций</span>
        </div>
        {showPollutionSources && (
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="w-2 h-2 bg-destructive rounded-full" />
            <span>{pollutionSourceCount} источников</span>
          </div>
        )}
      </div>
      {lastUpdate && (
        <div className="flex items-center gap-1 text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          <span>
            {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
};
