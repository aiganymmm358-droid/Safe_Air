import { Factory, Car, Flame, Building, AlertTriangle, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PollutionSource {
  id: number;
  name: string;
  type: "industrial" | "traffic" | "fire" | "construction";
  severity: "low" | "medium" | "high" | "critical";
  distance: string;
  impact: number;
}

const pollutionSources: PollutionSource[] = [
  { id: 1, name: "ТЭЦ-2", type: "industrial", severity: "high", distance: "2.5", impact: 45 },
  { id: 2, name: "Пр. Абая / Саина", type: "traffic", severity: "medium", distance: "0.8", impact: 28 },
  { id: 3, name: "Стройка ЖК Алатау", type: "construction", severity: "low", distance: "1.2", impact: 15 },
  { id: 4, name: "Горящий полигон", type: "fire", severity: "critical", distance: "5.0", impact: 65 },
];

const getTypeIcon = (type: PollutionSource["type"]) => {
  switch (type) {
    case "industrial": return Factory;
    case "traffic": return Car;
    case "fire": return Flame;
    case "construction": return Building;
  }
};

export const PollutionMap = () => {
  const { t } = useLanguage();

  const getSeverityColor = (severity: PollutionSource["severity"]) => {
    switch (severity) {
      case "low": return "bg-aqi-good text-primary-foreground";
      case "medium": return "bg-aqi-moderate text-foreground";
      case "high": return "bg-aqi-unhealthy text-primary-foreground";
      case "critical": return "bg-aqi-hazardous text-primary-foreground";
    }
  };

  const getSeverityLabel = (severity: PollutionSource["severity"]) => {
    switch (severity) {
      case "low": return t.pollutionSources.low;
      case "medium": return t.pollutionSources.medium;
      case "high": return t.pollutionSources.high;
      case "critical": return t.pollutionSources.critical;
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-elevated animate-fade-in">
      {/* Map placeholder with gradient overlay */}
      <div className="relative h-64 bg-gradient-to-br from-secondary/20 via-primary/10 to-muted">
        {/* Simulated map markers */}
        <div className="absolute inset-0 p-4">
          {/* Your location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 bg-secondary rounded-full animate-pulse-slow" />
              <div className="absolute -inset-2 bg-secondary/30 rounded-full animate-ping" />
            </div>
          </div>

          {/* Pollution markers */}
          <div className="absolute top-8 left-12">
            <div className="w-6 h-6 bg-aqi-hazardous rounded-full flex items-center justify-center shadow-lg animate-float">
              <Flame className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          <div className="absolute top-20 right-16">
            <div className="w-6 h-6 bg-aqi-unhealthy rounded-full flex items-center justify-center shadow-lg">
              <Factory className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          <div className="absolute bottom-12 left-1/3">
            <div className="w-5 h-5 bg-aqi-moderate rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-3 h-3 text-foreground" />
            </div>
          </div>
          <div className="absolute bottom-16 right-1/4">
            <div className="w-5 h-5 bg-aqi-good rounded-full flex items-center justify-center shadow-lg">
              <Building className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="w-8 h-8 bg-card rounded-lg shadow-soft flex items-center justify-center text-foreground hover:bg-muted transition-colors">
            +
          </button>
          <button className="w-8 h-8 bg-card rounded-lg shadow-soft flex items-center justify-center text-foreground hover:bg-muted transition-colors">
            −
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 glass-card rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-secondary" />
            <span className="font-medium">Алматы, Бостандыкский р-н</span>
          </div>
        </div>
      </div>

      {/* Sources list */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          {t.pollutionSources.nearYou}
        </h3>
        <div className="space-y-3">
          {pollutionSources.map((source) => {
            const Icon = getTypeIcon(source.type);
            return (
              <div
                key={source.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getSeverityColor(source.severity)} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{source.name}</p>
                    <p className="text-sm text-muted-foreground">{source.distance} {t.units.km} {t.units.fromYou}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(source.severity)}`}>
                    {getSeverityLabel(source.severity)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">{t.units.contribution}: {source.impact}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
