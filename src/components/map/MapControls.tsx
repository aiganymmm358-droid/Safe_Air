import { RefreshCw, Locate, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  isLoading: boolean;
  isLocating: boolean;
  showPollutionSources: boolean;
  onRefresh: () => void;
  onLocate: () => void;
  onTogglePollution: () => void;
}

export const MapControls = ({
  isLoading,
  isLocating,
  showPollutionSources,
  onRefresh,
  onLocate,
  onTogglePollution,
}: MapControlsProps) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="glass-card p-3 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
        title="Обновить данные"
      >
        <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
      </button>
      <button
        onClick={onLocate}
        disabled={isLocating}
        className="glass-card p-3 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
        title="Моё местоположение"
      >
        <Locate className={cn('w-5 h-5', isLocating && 'animate-pulse')} />
      </button>
      <button
        onClick={onTogglePollution}
        className={cn(
          'glass-card p-3 rounded-xl transition-colors',
          showPollutionSources 
            ? 'bg-primary/20 text-primary ring-2 ring-primary/30' 
            : 'hover:bg-muted/80'
        )}
        title="Источники загрязнения"
      >
        <Layers className="w-5 h-5" />
      </button>
    </div>
  );
};
