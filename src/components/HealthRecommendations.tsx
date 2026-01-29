import { Baby, Heart, Activity, AlertCircle, Shield, Bike } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Recommendation {
  icon: React.ReactNode;
  group: string;
  status: "safe" | "caution" | "warning" | "danger";
  advice: string;
}

interface HealthRecommendationsProps {
  aqi?: number | null;
}

export const HealthRecommendations = ({ aqi = null }: HealthRecommendationsProps) => {
  const { t } = useLanguage();

  const getStatusStyle = (status: Recommendation["status"]) => {
    switch (status) {
      case "safe": return "bg-aqi-good/10 border-aqi-good text-aqi-good";
      case "caution": return "bg-aqi-moderate/10 border-aqi-moderate text-aqi-moderate";
      case "warning": return "bg-aqi-unhealthy/10 border-aqi-unhealthy text-aqi-unhealthy";
      case "danger": return "bg-aqi-hazardous/10 border-aqi-hazardous text-aqi-hazardous";
    }
  };

  const getStatusLabel = (status: Recommendation["status"]) => {
    switch (status) {
      case "safe": return t.healthRecs.safe;
      case "caution": return t.healthRecs.caution;
      case "warning": return t.healthRecs.warning;
      case "danger": return t.healthRecs.danger;
    }
  };

  const getRecommendations = (aqi: number | null): Recommendation[] => {
    if (aqi === null) {
      return [
        {
          icon: <Baby className="w-5 h-5" />,
          group: t.healthRecs.children,
          status: "caution",
          advice: t.healthRecs.loadingData,
        },
      ];
    }

    if (aqi <= 50) {
      return [
        { icon: <Baby className="w-5 h-5" />, group: t.healthRecs.children, status: "safe", advice: t.healthRecs.safeForPlay },
        { icon: <Heart className="w-5 h-5" />, group: t.healthRecs.elderly, status: "safe", advice: t.healthRecs.greatTimeForWalk },
        { icon: <Activity className="w-5 h-5" />, group: t.healthRecs.asthma, status: "safe", advice: t.healthRecs.canDoOutdoor },
        { icon: <Bike className="w-5 h-5" />, group: t.healthRecs.athletes, status: "safe", advice: t.healthRecs.idealConditions },
      ];
    }

    if (aqi <= 100) {
      return [
        { icon: <Baby className="w-5 h-5" />, group: t.healthRecs.children, status: "safe", advice: t.healthRecs.canWalk },
        { icon: <Heart className="w-5 h-5" />, group: t.healthRecs.elderly, status: "caution", advice: t.healthRecs.limitOutdoor },
        { icon: <Activity className="w-5 h-5" />, group: t.healthRecs.asthma, status: "caution", advice: t.healthRecs.haveInhaler },
        { icon: <Bike className="w-5 h-5" />, group: t.healthRecs.athletes, status: "safe", advice: t.healthRecs.canTrainMorning },
      ];
    }

    if (aqi <= 150) {
      return [
        { icon: <Baby className="w-5 h-5" />, group: t.healthRecs.children, status: "caution", advice: t.healthRecs.limitPlay },
        { icon: <Heart className="w-5 h-5" />, group: t.healthRecs.elderly, status: "warning", advice: t.healthRecs.stayHomeVentilate },
        { icon: <Activity className="w-5 h-5" />, group: t.healthRecs.asthma, status: "warning", advice: t.healthRecs.wearN95 },
        { icon: <Bike className="w-5 h-5" />, group: t.healthRecs.athletes, status: "caution", advice: t.healthRecs.trainIndoorsMorning },
      ];
    }

    if (aqi <= 200) {
      return [
        { icon: <Baby className="w-5 h-5" />, group: t.healthRecs.children, status: "warning", advice: t.healthRecs.avoidWalks },
        { icon: <Heart className="w-5 h-5" />, group: t.healthRecs.elderly, status: "danger", advice: t.healthRecs.stayHomeClosed },
        { icon: <Activity className="w-5 h-5" />, group: t.healthRecs.asthma, status: "danger", advice: t.healthRecs.doNotGoOut },
        { icon: <Bike className="w-5 h-5" />, group: t.healthRecs.athletes, status: "warning", advice: t.healthRecs.trainIndoorsOnly },
      ];
    }

    return [
      { icon: <Baby className="w-5 h-5" />, group: t.healthRecs.children, status: "danger", advice: t.healthRecs.avoidOutdoor },
      { icon: <Heart className="w-5 h-5" />, group: t.healthRecs.elderly, status: "danger", advice: t.healthRecs.dangerStayHome },
      { icon: <Activity className="w-5 h-5" />, group: t.healthRecs.asthma, status: "danger", advice: t.healthRecs.extremeDanger },
      { icon: <Bike className="w-5 h-5" />, group: t.healthRecs.athletes, status: "danger", advice: t.healthRecs.cancelTraining },
    ];
  };

  const recommendations = getRecommendations(aqi);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t.healthRecs.title}
        </h3>
        {aqi !== null && (
          <span className="text-sm text-muted-foreground">AQI: {aqi}</span>
        )}
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-l-4 ${getStatusStyle(rec.status)} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-background rounded-lg">
                {rec.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{rec.group}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(rec.status)}`}>
                    {getStatusLabel(rec.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{rec.advice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 p-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {t.healthRecs.setupNotifications}
      </button>
    </div>
  );
};
