import { X, AlertTriangle } from 'lucide-react';
import { 
  PollutionSource, 
  harmLevelColors, 
  harmLevelLabels, 
  categoryLabels, 
  categoryIcons 
} from '@/data/pollutionSources';

interface PollutionSourcePanelProps {
  source: PollutionSource;
  onClose: () => void;
}

export const PollutionSourcePanel = ({ source, onClose }: PollutionSourcePanelProps) => {
  const color = harmLevelColors[source.harmLevel];

  return (
    <div className="absolute top-4 left-4 z-20 w-80 glass-card rounded-2xl p-4 shadow-elevated animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{categoryIcons[source.category]}</span>
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {harmLevelLabels[source.harmLevel]}
            </span>
          </div>
          <h3 className="font-display font-bold text-lg line-clamp-2">{source.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {categoryLabels[source.category]}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <div 
        className="rounded-xl p-4 mb-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color }} />
          <p className="text-sm">{source.description}</p>
        </div>
      </div>

      {/* Emissions */}
      {source.emissions && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Основные выбросы</p>
          <div className="flex flex-wrap gap-1.5">
            {source.emissions.split(', ').map((emission, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-background rounded text-xs font-medium"
              >
                {emission}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3 text-center">
        📍 {source.lat.toFixed(4)}, {source.lng.toFixed(4)}
      </p>
    </div>
  );
};
