import { HealthRecommendations } from "@/components/HealthRecommendations";
import { Heart, Activity, Wind, Thermometer, Clock, AlertCircle } from "lucide-react";

const HealthPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-destructive" />
          Здоровье и рекомендации
        </h1>
        <p className="text-muted-foreground mt-1">Персонализированные советы для вашего здоровья</p>
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <Wind className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">78</p>
          <p className="text-xs text-muted-foreground">AQI сейчас</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold">24°C</p>
          <p className="text-xs text-muted-foreground">Температура</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold">45%</p>
          <p className="text-xs text-muted-foreground">Влажность</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">16:00</p>
          <p className="text-xs text-muted-foreground">Лучшее время для прогулки</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Recommendations */}
        <HealthRecommendations />

        {/* Additional Health Info */}
        <div className="space-y-6">
          {/* Air Quality Forecast */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">📊 Прогноз на сегодня</h3>
            <div className="space-y-3">
              {[
                { time: "Утро (6-12)", aqi: 65, status: "Хорошо" },
                { time: "День (12-18)", aqi: 85, status: "Умеренно" },
                { time: "Вечер (18-24)", aqi: 72, status: "Хорошо" },
              ].map((period, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm">{period.time}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{period.aqi}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      period.aqi <= 50 ? "bg-aqi-good/20 text-aqi-good" :
                      period.aqi <= 100 ? "bg-aqi-moderate/20 text-aqi-moderate" :
                      "bg-aqi-unhealthy/20 text-aqi-unhealthy"
                    }`}>
                      {period.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protection Tips */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">🛡️ Способы защиты</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-xl">
                <span className="text-xl">😷</span>
                <div>
                  <p className="font-medium text-sm">Маска N95/FFP2</p>
                  <p className="text-xs text-muted-foreground">Фильтрует 95% частиц PM2.5</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl">
                <span className="text-xl">🏠</span>
                <div>
                  <p className="font-medium text-sm">Очиститель воздуха</p>
                  <p className="text-xs text-muted-foreground">HEPA-фильтр для дома</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-xl">
                <span className="text-xl">🌿</span>
                <div>
                  <p className="font-medium text-sm">Комнатные растения</p>
                  <p className="text-xs text-muted-foreground">Хлорофитум, спатифиллум</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="glass-card rounded-2xl p-4 bg-aqi-moderate/10 border border-aqi-moderate/30">
        <div className="flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-aqi-moderate" />
          <div className="flex-1">
            <p className="font-medium">Ожидается ухудшение качества воздуха</p>
            <p className="text-sm text-muted-foreground">Завтра с 14:00 до 18:00 — рекомендуем ограничить пребывание на улице</p>
          </div>
          <button className="px-4 py-2 bg-aqi-moderate text-white rounded-lg text-sm font-medium">
            Настроить оповещения
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
