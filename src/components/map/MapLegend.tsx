import { useLanguage } from '@/contexts/LanguageContext';
import { 
  harmLevelColors, 
  categoryIcons,
  type PollutionCategory,
  type HarmLevel 
} from '@/data/pollutionSources';

interface MapLegendProps {
  showPollutionSources: boolean;
}

const harmLevels: HarmLevel[] = ['low', 'medium', 'high', 'critical'];
const categories: PollutionCategory[] = ['power', 'industrial', 'transport', 'construction', 'heating', 'oil_gas', 'mining'];

export const MapLegend = ({ showPollutionSources }: MapLegendProps) => {
  const { t } = useLanguage();

  const aqiLevels = [
    { color: 'hsl(152, 80%, 45%)', label: '0-50', text: t.mapLegend.good },
    { color: 'hsl(48, 95%, 50%)', label: '51-100', text: t.mapLegend.moderate },
    { color: 'hsl(28, 95%, 55%)', label: '101-150', text: t.mapLegend.sensitive },
    { color: 'hsl(12, 85%, 55%)', label: '151-200', text: t.mapLegend.unhealthy },
    { color: 'hsl(340, 75%, 50%)', label: '201-300', text: t.mapLegend.veryUnhealthy },
    { color: 'hsl(280, 60%, 35%)', label: '300+', text: t.mapLegend.hazardous },
  ];

  const harmLevelLabels: Record<HarmLevel, string> = {
    low: t.pollutionSources.low,
    medium: t.pollutionSources.medium,
    high: t.pollutionSources.high,
    critical: t.pollutionSources.critical,
  };

  const categoryLabels: Record<PollutionCategory, string> = {
    power: t.pollutionSources.power,
    industrial: t.pollutionSources.industrial,
    transport: t.pollutionSources.transport,
    construction: t.pollutionSources.construction,
    heating: t.pollutionSources.heating,
    oil_gas: t.pollutionSources.oil_gas,
    mining: t.pollutionSources.mining,
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 glass-card rounded-xl p-3 max-w-xs">
      {/* AQI Legend */}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-2">{t.mapLegend.airQuality}</p>
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
            <p className="text-xs font-semibold mb-2">{t.pollutionSources.harmLevel}</p>
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
            <p className="text-xs font-semibold mb-2">{t.pollutionSources.categories}</p>
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
