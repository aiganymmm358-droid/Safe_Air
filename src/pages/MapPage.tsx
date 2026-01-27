import { AQIDisplay } from "@/components/AQIDisplay";
import { PollutionMap } from "@/components/PollutionMap";
import { Wind, TrendingUp, AlertTriangle, Clock } from "lucide-react";

const MapPage = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      {/* Left Panel - AQI Info */}
      <div className="lg:w-80 xl:w-96 p-4 space-y-4 overflow-y-auto border-r border-border/50">
        <AQIDisplay
          value={78}
          location="Алматы, Бостандыкский район"
          temperature={24}
          humidity={45}
          uvIndex={6}
        />

        {/* Quick Stats */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Динамика за 24 часа
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-aqi-good/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-aqi-good">-12%</p>
              <p className="text-xs text-muted-foreground">PM2.5</p>
            </div>
            <div className="bg-aqi-moderate/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-aqi-moderate">+5%</p>
              <p className="text-xs text-muted-foreground">NO₂</p>
            </div>
          </div>
        </div>

        {/* Nearby Alerts */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Ближайшие источники
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-destructive/10 rounded-lg">
              <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                🏭
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">ТЭЦ-2</p>
                <p className="text-xs text-muted-foreground">2.3 км</p>
              </div>
              <span className="text-xs text-destructive font-medium">Высокий</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-aqi-moderate/10 rounded-lg">
              <div className="w-8 h-8 bg-aqi-moderate/20 rounded-full flex items-center justify-center">
                🚗
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Аль-Фараби / Назарбаева</p>
                <p className="text-xs text-muted-foreground">0.8 км</p>
              </div>
              <span className="text-xs text-aqi-moderate font-medium">Средний</span>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Обновлено 2 мин назад
        </div>
      </div>

      {/* Right Panel - Full Map */}
      <div className="flex-1 relative">
        <PollutionMap />
        
        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="glass-card p-3 rounded-xl hover:bg-muted/80 transition-colors">
            <Wind className="w-5 h-5" />
          </button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 glass-card rounded-xl p-3">
          <p className="text-xs font-medium mb-2">Качество воздуха</p>
          <div className="flex gap-1">
            <div className="w-6 h-3 bg-aqi-good rounded" title="Хорошо" />
            <div className="w-6 h-3 bg-aqi-moderate rounded" title="Умеренно" />
            <div className="w-6 h-3 bg-aqi-unhealthySensitive rounded" title="Для чувствительных" />
            <div className="w-6 h-3 bg-aqi-unhealthy rounded" title="Нездорово" />
            <div className="w-6 h-3 bg-aqi-veryUnhealthy rounded" title="Очень нездорово" />
            <div className="w-6 h-3 bg-aqi-hazardous rounded" title="Опасно" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
