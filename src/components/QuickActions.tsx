import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Route, GraduationCap, TreePine, Camera, Map } from "lucide-react";
import { ReportViolationDialog, SafeRouteDialog, EcoLessonsDialog, TreePlantingDialog, ARScannerDialog } from "./quick-actions";

type ActionId = 'report' | 'route' | 'education' | 'plant' | 'scanner' | 'map';

interface QuickAction {
  id: ActionId;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    id: 'report',
    icon: <AlertTriangle className="w-6 h-6" />,
    label: "Сообщить",
    description: "О нарушении",
    color: "text-destructive",
    bgColor: "bg-destructive/10 hover:bg-destructive/20",
  },
  {
    id: 'route',
    icon: <Route className="w-6 h-6" />,
    label: "Маршрут",
    description: "Безопасный путь",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    id: 'education',
    icon: <GraduationCap className="w-6 h-6" />,
    label: "Обучение",
    description: "Эко-уроки",
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/20",
  },
  {
    id: 'plant',
    icon: <TreePine className="w-6 h-6" />,
    label: "Посадить",
    description: "Записаться",
    color: "text-aqi-good",
    bgColor: "bg-aqi-good/10 hover:bg-aqi-good/20",
  },
  {
    id: 'scanner',
    icon: <Camera className="w-6 h-6" />,
    label: "AR Сканер",
    description: "Анализ воздуха",
    color: "text-accent",
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
  {
    id: 'map',
    icon: <Map className="w-6 h-6" />,
    label: "Карта",
    description: "Все источники",
    color: "text-muted-foreground",
    bgColor: "bg-muted hover:bg-muted/80",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [plantOpen, setPlantOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleAction = (actionId: ActionId) => {
    switch (actionId) {
      case 'report':
        setReportOpen(true);
        break;
      case 'route':
        setRouteOpen(true);
        break;
      case 'education':
        setEducationOpen(true);
        break;
      case 'plant':
        setPlantOpen(true);
        break;
      case 'scanner':
        setScannerOpen(true);
        break;
      case 'map':
        navigate('/map');
        break;
    }
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-6 shadow-elevated animate-scale-in">
        <h3 className="font-display font-bold text-lg mb-4">⚡ Быстрые действия</h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.bgColor} ${action.color} transition-all hover-lift cursor-pointer`}
            >
              {action.icon}
              <span className="text-sm font-medium mt-2">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <ReportViolationDialog open={reportOpen} onOpenChange={setReportOpen} />
      <SafeRouteDialog open={routeOpen} onOpenChange={setRouteOpen} />
      <EcoLessonsDialog open={educationOpen} onOpenChange={setEducationOpen} />
      <TreePlantingDialog open={plantOpen} onOpenChange={setPlantOpen} />
      <ARScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} />
    </>
  );
};
