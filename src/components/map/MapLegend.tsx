import { 
  harmLevelColors, 
  harmLevelLabels, 
  categoryLabels, 
  categoryIcons,
  type PollutionCategory,
  type HarmLevel 
} from '@/data/pollutionSources';

interface MapLegendProps {
  showPollutionSources: boolean;
}

const aqiLevels = [
  { color: 'hsl(152, 80%, 45%)', label: '0-50', text: 'Хорошо' },
  { color: 'hsl(48, 95%, 50%)', label: '51-100', text: 'Умеренно' },
  { color: 'hsl(28, 95%, 55%)', label: '101-150', text: 'Для чувств.' },
  { color: 'hsl(12, 85%, 55%)', label: '151-200', text: 'Нездорово' },
  { color: 'hsl(340, 75%, 50%)', label: '201-300', text: 'Очень нездорово' },
  { color: 'hsl(280, 60%, 35%)', label: '300+', text: 'Опасно' },
];

const harmLevels: HarmLevel[] = ['low', 'medium', 'high', 'critical'];
const categories: PollutionCategory[] = ['power', 'industrial', 'transport', 'construction', 'heating'];

export const MapLegend = ({ showPollutionSources }: MapLegendProps) => {
  return (
    <div className="absolute bottom-4 left-4 z-10 glass-card rounded-xl p-3 max-w-xs">
      {/* AQI Legend */}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-2">Качество воздуха (AQI)</p>
        <div className="grid grid-cols-3 gap-1">
          {aqiLevels.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-muted-foreground truncate">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pollution Sources Legend */}
      {showPollutionSources && (
        <>
          <div className="border-t border-border pt-3 mb-2">
            <p className="text-xs font-semibold mb-2">Уровень вредности</p>
            <div className="grid grid-cols-2 gap-1">
              {harmLevels.map((level) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded shrink-0"
                    style={{ backgroundColor: harmLevelColors[level] }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {harmLevelLabels[level]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-2">
            <p className="text-xs font-semibold mb-2">Категории</p>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[10px]"
                >
                  <span>{categoryIcons[cat]}</span>
                  <span className="text-muted-foreground">{categoryLabels[cat]}</span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
