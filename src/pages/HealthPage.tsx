import { HealthRecommendations } from "@/components/HealthRecommendations";
import { Heart, Activity, Wind, Thermometer, Clock, AlertCircle, Loader2, MapPin } from "lucide-react";
import { useGeolocationContext } from "@/contexts/GeolocationContext";
import { useLanguage } from "@/contexts/LanguageContext";

const HealthPage = () => {
  const { t } = useLanguage();
  const { environmentData, effectiveLocation, isLoading } = useGeolocationContext();
  
  const cityName = environmentData?.city_name || effectiveLocation?.cityName;

  const currentAqi = environmentData?.current_aqi ?? null;
  const temperature = environmentData?.temperature ?? null;
  const humidity = environmentData?.humidity ?? null;
  const uvIndex = environmentData?.uv_index ?? null;

  // Get AQI category color
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
    if (aqi <= 50) return t.health.anyTime;
    if (aqi <= 100) return t.health.morning;
    if (aqi <= 150) return t.health.earlyMorning;
    return t.health.notRecommended;
  };

  const getUvLabel = (uv: number | null) => {
    if (!uv) return "—";
    if (uv <= 2) return t.health.uvLow;
    if (uv <= 5) return t.health.uvMedium;
    if (uv <= 7) return t.health.uvHigh;
    return t.health.uvVeryHigh;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-destructive" />
          {t.health.title}
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          {cityName ? (
            <>
              <MapPin className="w-4 h-4" />
              {t.health.personalizedFor} {cityName}
            </>
          ) : (
            t.health.personalizedTips
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
          <p className="text-xs text-muted-foreground">{t.map.aqiNow}</p>
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
          <p className="text-xs text-muted-foreground">{t.health.temperature}</p>
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
          <p className="text-xs text-muted-foreground">{t.health.humidity}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{getBestOutdoorTime(currentAqi)}</p>
          <p className="text-xs text-muted-foreground">{t.health.bestTimeForWalk}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Recommendations - pass AQI for dynamic recommendations */}
        <HealthRecommendations aqi={currentAqi} />

        {/* Additional Health Info */}
        <div className="space-y-6">
          {/* UV Index & Conditions */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">☀️ {t.health.todayConditions}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm">{t.health.uvIndex}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{uvIndex !== null ? uvIndex.toFixed(1) : "—"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    !uvIndex ? "bg-muted" :
                    uvIndex <= 2 ? "bg-aqi-good/20 text-aqi-good" :
                    uvIndex <= 5 ? "bg-aqi-moderate/20 text-aqi-moderate" :
                    uvIndex <= 7 ? "bg-aqi-unhealthy/20 text-aqi-unhealthy" :
                    "bg-aqi-hazardous/20 text-aqi-hazardous"
                  }`}>
                    {getUvLabel(uvIndex)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm">{t.health.wind}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {environmentData?.wind_speed !== null && environmentData?.wind_speed !== undefined
                      ? `${environmentData.wind_speed.toFixed(1)} ${t.units.ms}`
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <span className="text-sm">{t.health.airQuality}</span>
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
            <h3 className="font-display font-bold text-lg mb-4">🛡️ {t.health.protectionMethods}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-xl">
                <span className="text-xl">😷</span>
                <div>
                  <p className="font-medium text-sm">{t.health.maskN95}</p>
                  <p className="text-xs text-muted-foreground">{t.health.maskDescription}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl">
                <span className="text-xl">🏠</span>
                <div>
                  <p className="font-medium text-sm">{t.health.airPurifier}</p>
                  <p className="text-xs text-muted-foreground">{t.health.airPurifierDescription}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-xl">
                <span className="text-xl">🌿</span>
                <div>
                  <p className="font-medium text-sm">{t.health.housePlants}</p>
                  <p className="text-xs text-muted-foreground">{t.health.housePlantsDescription}</p>
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
                  ? t.health.unhealthyAir 
                  : t.health.moderatePollution}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentAqi > 150 
                  ? t.health.unhealthyAdvice
                  : t.health.moderateAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPage;
