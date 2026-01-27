import { Baby, Heart, Activity, AlertCircle, Shield, Bike } from "lucide-react";

interface Recommendation {
  icon: React.ReactNode;
  group: string;
  status: "safe" | "caution" | "warning" | "danger";
  advice: string;
}

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
    case "safe": return "Безопасно";
    case "caution": return "Осторожно";
    case "warning": return "Внимание";
    case "danger": return "Опасно";
  }
};

const recommendations: Recommendation[] = [
  {
    icon: <Baby className="w-5 h-5" />,
    group: "Дети",
    status: "caution",
    advice: "Ограничьте активные игры на улице до 1 часа",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    group: "Пожилые",
    status: "warning",
    advice: "Рекомендуется оставаться дома, проветривать кратко",
  },
  {
    icon: <Activity className="w-5 h-5" />,
    group: "Астматики",
    status: "warning",
    advice: "Носите маску N95, имейте ингалятор при себе",
  },
  {
    icon: <Bike className="w-5 h-5" />,
    group: "Спортсмены",
    status: "caution",
    advice: "Перенесите тренировку в помещение или на утро",
  },
];

export const HealthRecommendations = () => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Рекомендации для здоровья
        </h3>
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

      {/* Quick Action */}
      <button className="w-full mt-4 p-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Получить персональные рекомендации
      </button>
    </div>
  );
};
