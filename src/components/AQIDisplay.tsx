import { Wind, Thermometer, Droplets, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AQIDisplayProps {
  value: number;
  location: string;
  temperature: number;
  humidity: number;
  uvIndex: number;
}

export const AQIDisplay = ({ value, location, temperature, humidity, uvIndex }: AQIDisplayProps) => {
  const { t } = useLanguage();
  
  const getAQILevel = (value: number) => {
    if (value <= 50) return { label: t.aqi.good, color: "bg-aqi-good", textColor: "text-aqi-good", emoji: "😊" };
    if (value <= 100) return { label: t.aqi.moderate, color: "bg-aqi-moderate", textColor: "text-aqi-moderate", emoji: "🙂" };
    if (value <= 150) return { label: t.aqi.unhealthy, color: "bg-aqi-unhealthySensitive", textColor: "text-aqi-unhealthySensitive", emoji: "😐" };
    if (value <= 200) return { label: t.aqi.unhealthyAll, color: "bg-aqi-unhealthy", textColor: "text-aqi-unhealthy", emoji: "😷" };
    if (value <= 300) return { label: t.aqi.veryUnhealthy, color: "bg-aqi-veryUnhealthy", textColor: "text-aqi-veryUnhealthy", emoji: "🤢" };
    return { label: t.aqi.hazardous, color: "bg-aqi-hazardous", textColor: "text-aqi-hazardous", emoji: "☠️" };
  };

  const level = getAQILevel(value);
  const percentage = Math.min((value / 500) * 100, 100);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{t.map.yourLocation}</p>
          <h3 className="text-lg font-display font-semibold">{location}</h3>
        </div>
        <span className="text-3xl">{level.emoji}</span>
      </div>

      {/* Main AQI Display */}
      <div className="relative flex items-center justify-center my-6">
        <div className="aqi-ring w-36 h-36 flex items-center justify-center p-2">
          <div className="bg-card rounded-full w-full h-full flex flex-col items-center justify-center">
            <span className={`text-4xl font-display font-bold ${level.textColor}`}>{value}</span>
            <span className="text-xs text-muted-foreground mt-1">AQI</span>
          </div>
        </div>
      </div>

      {/* AQI Level */}
      <div className="text-center mb-6">
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-primary-foreground ${level.color}`}>
          {level.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div 
          className={`absolute h-full ${level.color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-xl">
          <Thermometer className="w-5 h-5 mx-auto mb-1 text-destructive" />
          <p className="text-lg font-semibold">{temperature}°</p>
          <p className="text-xs text-muted-foreground">{t.health.temperature}</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-xl">
          <Droplets className="w-5 h-5 mx-auto mb-1 text-secondary" />
          <p className="text-lg font-semibold">{humidity}%</p>
          <p className="text-xs text-muted-foreground">{t.health.humidity}</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-xl">
          <Sun className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-lg font-semibold">{uvIndex}</p>
          <p className="text-xs text-muted-foreground">{t.health.uvIndex}</p>
        </div>
      </div>
    </div>
  );
};
