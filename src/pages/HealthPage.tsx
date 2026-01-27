import { HealthRecommendations } from "@/components/HealthRecommendations";
import { Heart, Activity, Wind, Thermometer, Clock, AlertCircle, Loader2, MapPin } from "lucide-react";
import { useGeolocationContext } from "@/contexts/GeolocationContext";

// Helper to get AQI category color
const getAqiColor = (aqi: number | null) => {
  if (!aqi) return "text-muted-foreground";
  if (aqi <= 50) return "text-aqi-good";
  if (aqi <= 100) return "text-aqi-moderate";
  if (aqi <= 150) return "text-aqi-unhealthy";
  if (aqi <= 200) return "text-aqi-very-unhealthy";
  return "text-aqi-hazardous";
};

const getAqiBgColor = (aqi: number | null) => {
  if (!aqi) return "bg-muted";
  if (aqi <= 50) return "bg-aqi-good/10";
  if (aqi <= 100) return "bg-aqi-moderate/10";
  if (aqi <= 150) return "bg-aqi-unhealthy/10";
  if (aqi <= 200) return "bg-aqi-very-unhealthy/10";
  return "bg-aqi-hazardous/10";
};

// Get best time for outdoor activity based on typical patterns
const getBestOutdoorTime = (aqi: number | null) => {
  if (!aqi) return "—";
  if (aqi <= 50) return "Любое время";
  if (aqi <= 100) return "Утро (6-9)";
  if (aqi <= 150) return "Раннее утро";
  return "Не рекомендуется";
};

const HealthPage = () => {
  const { environmentData, effectiveLocation, isLoading } = useGeolocationContext();
  
  const cityName = environmentData?.city_name || effectiveLocation?.cityName;

  const currentAqi = environmentData?.current_aqi ?? null;
  const temperature = environmentData?.temperature ?? null;
  const humidity = environmentData?.humidity ?? null;
  const uvIndex = environmentData?.uv_index ?? null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-destructive" />
          Здоровье и рекомендации
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          {cityName ? (
            <>
              <MapPin className="w-4 h-4" />
              Персонализированные советы для {cityName}
            </>
          ) : (
            "Персонализированные советы для вашего здоровья"
          )}
        </p>
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`glass-card rounded-2xl p-4 text-center ${getAqiBgColor(currentAqi)}`}>
          <Wind className={`w-6 h-6 mx-auto mb-2 ${getAqiColor(currentAqi)}`} />
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            <p className={`text-2xl font-bold ${getAqiColor(currentAqi)}`}>
              {currentAqi ?? "—"}
            </p>
          )}
          <p className="text-xs text-muted-foreground">AQI сейчас</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-2 text-destructive" />
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            <p className="text-2xl font-bold">
              {temperature !== null ? `${Math.round(temperature)}°C` : "—"}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Температура</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-secondary" />
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            <p className="text-2xl font-bold">
              {humidity !== null ? `${humidity}%` : "—"}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Влажность</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{getBestOutdoorTime(currentAqi)}</p>
          <p className="text-xs text-muted-foreground">Лучшее время для прогулки</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Recommendations - pass AQI for dynamic recommendations */}
        <HealthRecommendations aqi={currentAqi} />

        {/* Additional Health Info */}
        <div className="space-y-6">
          {/* UV Index & Conditions */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">☀️ Условия сегодня</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm">UV-индекс</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{uvIndex !== null ? uvIndex.toFixed(1) : "—"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    !uvIndex ? "bg-muted" :
                    uvIndex <= 2 ? "bg-aqi-good/20 text-aqi-good" :
                    uvIndex <= 5 ? "bg-aqi-moderate/20 text-aqi-moderate" :
                    uvIndex <= 7 ? "bg-aqi-unhealthy/20 text-aqi-unhealthy" :
                    "bg-aqi-hazardous/20 text-aqi-hazardous"
                  }`}>
                    {!uvIndex ? "—" :
                     uvIndex <= 2 ? "Низкий" :
                     uvIndex <= 5 ? "Средний" :
                     uvIndex <= 7 ? "Высокий" : "Очень высокий"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm">Ветер</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {environmentData?.wind_speed !== null && environmentData?.wind_speed !== undefined
                      ? `${environmentData.wind_speed.toFixed(1)} м/с`
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm">Качество воздуха</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getAqiBgColor(currentAqi)} ${getAqiColor(currentAqi)}`}>
                    {environmentData?.aqi_category || "—"}
                  </span>
                </div>
              </div>
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

      {/* Alert Banner - Dynamic based on AQI */}
      {currentAqi !== null && currentAqi > 100 && (
        <div className={`glass-card rounded-2xl p-4 border ${
          currentAqi > 150 
            ? "bg-aqi-unhealthy/10 border-aqi-unhealthy/30" 
            : "bg-aqi-moderate/10 border-aqi-moderate/30"
        }`}>
          <div className="flex items-center gap-4">
            <AlertCircle className={`w-6 h-6 ${currentAqi > 150 ? "text-aqi-unhealthy" : "text-aqi-moderate"}`} />
            <div className="flex-1">
              <p className="font-medium">
                {currentAqi > 150 
                  ? "Качество воздуха неудовлетворительное" 
                  : "Умеренное загрязнение воздуха"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentAqi > 150 
                  ? "Рекомендуем ограничить пребывание на улице и использовать маску"
                  : "Чувствительным группам рекомендуется сократить активность на улице"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPage;