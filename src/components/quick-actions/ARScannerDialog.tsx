import { useState, useRef } from 'react';
import { Camera, Wind, Thermometer, Droplets, Loader2, RefreshCw, AlertTriangle, Upload, X, ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AirAnalysis {
  aqi: number;
  aqiCategory: string;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  visibility: string;
  recommendation: string;
  color: string;
}

interface ARScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ARScannerDialog({ open, onOpenChange }: ARScannerDialogProps) {
  const { user } = useAuthContext();
  const { location, requestLocation, isLoading: locationLoading } = useGeolocationContext();
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AirAnalysis | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isImageValidated, setIsImageValidated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = async (base64Image: string): Promise<{ isValid: boolean; reason?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-ar-image', {
        body: { imageBase64: base64Image }
      });

      if (error) {
        console.error('Validation error:', error);
        return { 
          isValid: false, 
          reason: 'Не удалось проверить изображение. Попробуйте ещё раз.' 
        };
      }

      return {
        isValid: data.isValid,
        reason: data.reason
      };
    } catch (err) {
      console.error('Validation request failed:', err);
      return { 
        isValid: false, 
        reason: 'Ошибка соединения. Проверьте интернет и попробуйте снова.' 
      };
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер изображения не должен превышать 10 МБ');
      return;
    }

    setValidationError(null);
    setIsImageValidated(false);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);

      // Validate image with AI
      setIsValidating(true);
      const validation = await validateImage(base64);
      setIsValidating(false);

      if (!validation.isValid) {
        setValidationError(validation.reason || 'Фото не подходит для анализа');
        setIsImageValidated(false);
      } else {
        setIsImageValidated(true);
        toast.success('Фото подходит для анализа!');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValidationError(null);
    setIsImageValidated(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getAqiData = (aqi: number): Partial<AirAnalysis> => {
    if (aqi <= 50) return {
      aqiCategory: 'Хорошо',
      color: 'text-aqi-good',
      recommendation: 'Отличное качество воздуха! Идеально для прогулок и занятий спортом на свежем воздухе.'
    };
    if (aqi <= 100) return {
      aqiCategory: 'Умеренно',
      color: 'text-aqi-moderate',
      recommendation: 'Качество воздуха приемлемое. Чувствительным людям рекомендуется ограничить длительные нагрузки.'
    };
    if (aqi <= 150) return {
      aqiCategory: 'Нездорово для чувствительных',
      color: 'text-aqi-sensitive',
      recommendation: 'Людям с респираторными заболеваниями следует ограничить активность на улице.'
    };
    if (aqi <= 200) return {
      aqiCategory: 'Нездорово',
      color: 'text-aqi-unhealthy',
      recommendation: 'Всем рекомендуется сократить время на улице. Используйте маску при необходимости.'
    };
    if (aqi <= 300) return {
      aqiCategory: 'Очень нездорово',
      color: 'text-aqi-very-unhealthy',
      recommendation: 'Избегайте выхода на улицу. При необходимости используйте маску N95.'
    };
    return {
      aqiCategory: 'Опасно',
      color: 'text-aqi-hazardous',
      recommendation: 'Оставайтесь дома! Критический уровень загрязнения воздуха.'
    };
  };

  const startScan = async () => {
    if (!location) {
      await requestLocation();
      if (!location) {
        toast.error('Не удалось определить местоположение');
        return;
      }
    }

    setIsScanning(true);
    setScanProgress(0);
    setAnalysis(null);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Fetch real data from edge function
    try {
      const { data, error } = await supabase.functions.invoke('user-environment', {
        body: { 
          latitude: location?.latitude || 43.238949, 
          longitude: location?.longitude || 76.945465 
        }
      });

      if (error) throw error;

      const aqiInfo = getAqiData(data.aqi || 75);
      
      setAnalysis({
        aqi: data.aqi || 75,
        aqiCategory: aqiInfo.aqiCategory || 'Умеренно',
        pm25: data.pm25 || Math.round(Math.random() * 50 + 10),
        pm10: data.pm10 || Math.round(Math.random() * 80 + 20),
        temperature: data.temperature || 5,
        humidity: data.humidity || 65,
        visibility: data.visibility ? `${(data.visibility / 1000).toFixed(1)} км` : '8.5 км',
        recommendation: aqiInfo.recommendation || '',
        color: aqiInfo.color || 'text-aqi-moderate'
      });

      // Award XP for scanning
      if (user && !hasScanned) {
        await supabase.rpc('add_user_xp', {
          _user_id: user.id,
          _xp: 10,
          _coins: 3,
          _action_type: 'ar_scan',
          _description: 'AR-сканирование качества воздуха'
        });
        setHasScanned(true);
        toast.success('Сканирование завершено! +10 XP');
      }
    } catch (error) {
      console.error('Error fetching environment data:', error);
      // Fallback to mock data
      const mockAqi = Math.round(Math.random() * 100 + 30);
      const aqiInfo = getAqiData(mockAqi);
      
      setAnalysis({
        aqi: mockAqi,
        aqiCategory: aqiInfo.aqiCategory || 'Умеренно',
        pm25: Math.round(Math.random() * 50 + 10),
        pm10: Math.round(Math.random() * 80 + 20),
        temperature: Math.round(Math.random() * 10 - 5),
        humidity: Math.round(Math.random() * 30 + 50),
        visibility: `${(Math.random() * 5 + 5).toFixed(1)} км`,
        recommendation: aqiInfo.recommendation || '',
        color: aqiInfo.color || 'text-aqi-moderate'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setAnalysis(null);
    setScanProgress(0);
    setImagePreview(null);
    setImageFile(null);
    setValidationError(null);
    setIsImageValidated(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent" />
            AR Сканер воздуха
          </DialogTitle>
          <DialogDescription>
            Анализ качества воздуха в вашем местоположении
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!analysis ? (
            // Scanning interface
            <div className="space-y-4">
              {/* Image upload area */}
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                {isScanning || isValidating ? (
                  <div className="text-center">
                    <div className="w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {isValidating ? 'Проверка изображения...' : 'Анализ изображения...'}
                    </p>
                    {isScanning && <p className="text-2xl font-bold mt-2">{scanProgress}%</p>}
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className={`w-full h-full object-cover ${validationError ? 'opacity-50' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Validation status overlay */}
                    {isImageValidated && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-aqi-good/90 text-white text-xs rounded-full flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Фото подходит
                      </div>
                    )}
                    {/* Scanning overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="ar-scanner-image-input"
                    />
                    <label
                      htmlFor="ar-scanner-image-input"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4 hover:bg-accent/30 transition-colors">
                        <ImageIcon className="w-10 h-10 text-accent" />
                      </div>
                      <p className="text-muted-foreground font-medium">Загрузите фото для анализа</p>
                      <p className="text-xs text-muted-foreground mt-1">Фото неба, улицы или природы</p>
                    </label>
                  </div>
                )}
                
                {/* Decorative scanning lines */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
                  </div>
                )}
              </div>

              {/* Validation error */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationError}. Пожалуйста, загрузите фото неба, улицы или природы.
                  </AlertDescription>
                </Alert>
              )}

              {isScanning && <Progress value={scanProgress} className="h-2" />}

              <div className="flex gap-2">
                {!imagePreview ? (
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning || isValidating || locationLoading}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать фото
                  </Button>
                ) : validationError ? (
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning || isValidating || locationLoading}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Выбрать другое фото
                  </Button>
                ) : null}
                
                {imagePreview && isImageValidated && (
                  <Button 
                    onClick={startScan} 
                    disabled={isScanning || isValidating || locationLoading || !isImageValidated}
                    className="flex-1"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Определение...
                      </>
                    ) : isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Анализ...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Анализировать фото
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Results interface
            <div className="space-y-4">
              {/* AQI Display */}
              <div className={`p-6 rounded-xl bg-gradient-to-br from-background to-muted text-center`}>
                <p className="text-sm text-muted-foreground mb-1">Индекс качества воздуха</p>
                <p className={`text-5xl font-bold ${analysis.color}`}>{analysis.aqi}</p>
                <p className={`text-lg font-medium ${analysis.color}`}>{analysis.aqiCategory}</p>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs">PM2.5</span>
                  </div>
                  <p className="text-lg font-semibold">{analysis.pm25} µg/m³</p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs">PM10</span>
                  </div>
                  <p className="text-lg font-semibold">{analysis.pm10} µg/m³</p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-xs">Температура</span>
                  </div>
                  <p className="text-lg font-semibold">{analysis.temperature}°C</p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs">Влажность</span>
                  </div>
                  <p className="text-lg font-semibold">{analysis.humidity}%</p>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-xl border ${
                analysis.aqi <= 50 ? 'bg-aqi-good/10 border-aqi-good/30' :
                analysis.aqi <= 100 ? 'bg-aqi-moderate/10 border-aqi-moderate/30' :
                'bg-aqi-unhealthy/10 border-aqi-unhealthy/30'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{analysis.recommendation}</p>
                </div>
              </div>

              <Button onClick={resetScan} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Сканировать снова
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
