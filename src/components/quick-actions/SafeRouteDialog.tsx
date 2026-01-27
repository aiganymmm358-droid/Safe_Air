import { useState } from 'react';
import { Route, MapPin, Navigation, Loader2, Wind, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { toast } from 'sonner';

interface SafeRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RouteResult {
  distance: string;
  duration: string;
  aqiLevel: 'good' | 'moderate' | 'bad';
  recommendation: string;
  waypoints: string[];
}

export function SafeRouteDialog({ open, onOpenChange }: SafeRouteDialogProps) {
  const { location, requestLocation, isLoading: locationLoading } = useGeolocationContext();
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  const handleUseCurrentLocation = async () => {
    await requestLocation();
    if (location) {
      setFromAddress(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      toast.success('Текущее местоположение установлено');
    }
  };

  const calculateRoute = async () => {
    if (!fromAddress.trim()) {
      toast.error('Укажите начальную точку');
      return;
    }

    if (!toAddress.trim()) {
      toast.error('Укажите конечную точку');
      return;
    }

    setIsCalculating(true);
    
    // Simulate route calculation with AQI-based recommendations
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock route result based on simulated AQI data
    const mockRoutes: RouteResult[] = [
      {
        distance: '3.2 км',
        duration: '12 мин',
        aqiLevel: 'good',
        recommendation: 'Рекомендуемый маршрут через парковую зону с минимальным уровнем загрязнения',
        waypoints: ['Центральный парк', 'Ул. Абая', 'Пешеходная зона']
      },
      {
        distance: '2.8 км',
        duration: '10 мин',
        aqiLevel: 'moderate',
        recommendation: 'Короткий маршрут, но проходит через умеренно загрязненную зону',
        waypoints: ['Проспект Назарбаева', 'Перекресток']
      },
      {
        distance: '4.1 км',
        duration: '15 мин',
        aqiLevel: 'bad',
        recommendation: 'Избегайте этот маршрут - высокий уровень загрязнения от транспорта',
        waypoints: ['Автомагистраль', 'Промзона']
      }
    ];

    // Select the best route (lowest AQI)
    setRouteResult(mockRoutes[0]);
    setIsCalculating(false);
  };

  const getAqiColor = (level: string) => {
    switch (level) {
      case 'good': return 'text-aqi-good bg-aqi-good/10';
      case 'moderate': return 'text-aqi-moderate bg-aqi-moderate/10';
      case 'bad': return 'text-aqi-unhealthy bg-aqi-unhealthy/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getAqiLabel = (level: string) => {
    switch (level) {
      case 'good': return 'Чистый воздух';
      case 'moderate': return 'Умеренное загрязнение';
      case 'bad': return 'Высокое загрязнение';
      default: return 'Неизвестно';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Безопасный маршрут
          </DialogTitle>
          <DialogDescription>
            Найдите путь с минимальным уровнем загрязнения воздуха
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* From */}
          <div>
            <label className="text-sm font-medium mb-2 block">Откуда</label>
            <div className="flex gap-2">
              <Input
                placeholder="Адрес или координаты"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* To */}
          <div>
            <label className="text-sm font-medium mb-2 block">Куда</label>
            <Input
              placeholder="Адрес назначения"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>

          {/* Calculate button */}
          <Button 
            onClick={calculateRoute} 
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Расчет маршрута...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Построить маршрут
              </>
            )}
          </Button>

          {/* Route result */}
          {routeResult && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Рекомендуемый маршрут
              </h4>
              
              <div className={`p-4 rounded-xl ${getAqiColor(routeResult.aqiLevel)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{getAqiLabel(routeResult.aqiLevel)}</span>
                  <div className="flex gap-4 text-sm">
                    <span>📍 {routeResult.distance}</span>
                    <span>⏱️ {routeResult.duration}</span>
                  </div>
                </div>
                <p className="text-sm opacity-80">{routeResult.recommendation}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Маршрут через:</p>
                <div className="flex flex-wrap gap-2">
                  {routeResult.waypoints.map((waypoint, index) => (
                    <span key={index} className="px-3 py-1 bg-muted rounded-full text-xs">
                      {waypoint}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Маршрут рассчитан на основе текущих данных о качестве воздуха. 
                  Условия могут измениться.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
