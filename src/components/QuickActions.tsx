import { AlertTriangle, Route, GraduationCap, TreePine, Camera, Map } from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    label: "Сообщить",
    description: "О нарушении",
    color: "text-destructive",
    bgColor: "bg-destructive/10 hover:bg-destructive/20",
  },
  {
    icon: <Route className="w-6 h-6" />,
    label: "Маршрут",
    description: "Безопасный путь",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    label: "Обучение",
    description: "Эко-уроки",
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/20",
  },
  {
    icon: <TreePine className="w-6 h-6" />,
    label: "Посадить",
    description: "Записаться",
    color: "text-aqi-good",
    bgColor: "bg-aqi-good/10 hover:bg-aqi-good/20",
  },
  {
    icon: <Camera className="w-6 h-6" />,
    label: "AR Сканер",
    description: "Анализ воздуха",
    color: "text-accent",
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
  {
    icon: <Map className="w-6 h-6" />,
    label: "Карта",
    description: "Все источники",
    color: "text-muted-foreground",
    bgColor: "bg-muted hover:bg-muted/80",
  },
];

export const QuickActions = () => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-scale-in">
      <h3 className="font-display font-bold text-lg mb-4">⚡ Быстрые действия</h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.bgColor} ${action.color} transition-all hover-lift cursor-pointer`}
          >
            {action.icon}
            <span className="text-sm font-medium mt-2">{action.label}</span>
            <span className="text-xs text-muted-foreground">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
