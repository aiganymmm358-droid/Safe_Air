import { useState, useEffect, useMemo } from 'react';
import { MapPin, Users, Trophy, CheckCircle, Loader2, Navigation, AlertCircle, Search, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeolocationContext } from '@/contexts/GeolocationContext';

interface District {
  id: string;
  name: string;
  city: string;
  total_score: number;
  trees_planted: number;
  reports_sent: number;
  participants_count: number;
  current_rank: number;
}

interface JoinDistrictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  districts: District[];
  onJoin: (districtId: string) => Promise<boolean>;
  isJoining: boolean;
}

// Extended district boundaries for multiple cities
const DISTRICT_BOUNDARIES: Record<string, { city: string; lat: [number, number]; lng: [number, number] }> = {
  // Алматы
  'Бостандыкский': { city: 'Алматы', lat: [43.21, 43.28], lng: [76.89, 76.98] },
  'Медеуский': { city: 'Алматы', lat: [43.23, 43.35], lng: [76.92, 77.05] },
  'Алмалинский': { city: 'Алматы', lat: [43.24, 43.28], lng: [76.90, 76.96] },
  'Наурызбайский': { city: 'Алматы', lat: [43.18, 43.25], lng: [76.75, 76.88] },
  'Ауэзовский': { city: 'Алматы', lat: [43.20, 43.26], lng: [76.82, 76.92] },
  'Алатауский': { city: 'Алматы', lat: [43.16, 43.24], lng: [76.82, 76.95] },
  'Жетысуский': { city: 'Алматы', lat: [43.26, 43.32], lng: [76.88, 76.98] },
  'Турксибский': { city: 'Алматы', lat: [43.28, 43.35], lng: [76.90, 77.02] },
  // Астана
  'Есильский': { city: 'Астана', lat: [51.12, 51.18], lng: [71.40, 71.50] },
  'Алматинский': { city: 'Астана', lat: [51.10, 51.16], lng: [71.42, 71.52] },
  'Сарыаркинский': { city: 'Астана', lat: [51.14, 51.20], lng: [71.38, 71.48] },
  'Байконырский': { city: 'Астана', lat: [51.08, 51.14], lng: [71.35, 71.45] },
  // Шымкент
  'Аль-Фарабийский': { city: 'Шымкент', lat: [42.30, 42.36], lng: [69.55, 69.65] },
  'Абайский': { city: 'Шымкент', lat: [42.28, 42.34], lng: [69.58, 69.68] },
  'Енбекшинский': { city: 'Шымкент', lat: [42.32, 42.38], lng: [69.52, 69.62] },
  'Каратауский': { city: 'Шымкент', lat: [42.26, 42.32], lng: [69.50, 69.60] },
};

// City centers for search
const CITIES: Record<string, { lat: number; lng: number }> = {
  'Алматы': { lat: 43.238949, lng: 76.945465 },
  'Астана': { lat: 51.169392, lng: 71.449074 },
  'Шымкент': { lat: 42.315514, lng: 69.586907 },
  'Караганда': { lat: 49.806406, lng: 73.085485 },
  'Актобе': { lat: 50.283937, lng: 57.166978 },
  'Тараз': { lat: 42.900990, lng: 71.378438 },
  'Павлодар': { lat: 52.287387, lng: 76.967453 },
  'Усть-Каменогорск': { lat: 49.948759, lng: 82.627785 },
  'Семей': { lat: 50.411144, lng: 80.227631 },
  'Атырау': { lat: 47.106738, lng: 51.903183 },
};

function detectDistrictByLocation(lat: number, lng: number): { district: string; city: string } | null {
  // Find matching district
  for (const [name, bounds] of Object.entries(DISTRICT_BOUNDARIES)) {
    if (
      lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
      lng >= bounds.lng[0] && lng <= bounds.lng[1]
    ) {
      return { district: name, city: bounds.city };
    }
  }

  // If no exact match, find the closest district
  let closestDistrict = null;
  let closestCity = null;
  let minDistance = Infinity;

  for (const [name, bounds] of Object.entries(DISTRICT_BOUNDARIES)) {
    const centerLat = (bounds.lat[0] + bounds.lat[1]) / 2;
    const centerLng = (bounds.lng[0] + bounds.lng[1]) / 2;
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
    
    if (distance < minDistance && distance < 0.5) { // Max 0.5 degrees ~50km
      minDistance = distance;
      closestDistrict = name;
      closestCity = bounds.city;
    }
  }

  return closestDistrict && closestCity ? { district: closestDistrict, city: closestCity } : null;
}

export function JoinDistrictDialog({
  open,
  onOpenChange,
  districts,
  onJoin,
  isJoining
}: JoinDistrictDialogProps) {
  const { location, isLoading: geoLoading, error: geoError, requestLocation } = useGeolocationContext();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [detectedDistrictName, setDetectedDistrictName] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique cities from districts
  const cities = useMemo(() => {
    const citySet = new Set(districts.map(d => d.city));
    return Array.from(citySet);
  }, [districts]);

  // Filter districts based on search query
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return districts;
    
    const query = searchQuery.toLowerCase();
    return districts.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.city.toLowerCase().includes(query)
    );
  }, [districts, searchQuery]);

  // Group districts by city
  const groupedDistricts = useMemo(() => {
    const groups: Record<string, District[]> = {};
    filteredDistricts.forEach(d => {
      if (!groups[d.city]) groups[d.city] = [];
      groups[d.city].push(d);
    });
    return groups;
  }, [filteredDistricts]);

  // Auto-detect district when dialog opens
  useEffect(() => {
    if (open && location?.latitude && location?.longitude) {
      setIsDetecting(true);
      const detected = detectDistrictByLocation(location.latitude, location.longitude);
      if (detected) {
        setDetectedDistrictName(detected.district);
        setDetectedCity(detected.city);
        const district = districts.find(d => d.name === detected.district && d.city === detected.city);
        if (district) {
          setSelectedDistrict(district.id);
        }
      }
      setIsDetecting(false);
    }
  }, [open, location, districts]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDistrict(null);
      setDetectedDistrictName(null);
      setDetectedCity(null);
      setShowManualSelection(false);
      setSearchQuery('');
    }
  }, [open]);

  const handleRequestLocation = async () => {
    setIsDetecting(true);
    await requestLocation();
    setIsDetecting(false);
  };

  const handleJoin = async () => {
    if (!selectedDistrict) return;
    const success = await onJoin(selectedDistrict);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleAutoJoin = async () => {
    if (!selectedDistrict) return;
    await handleJoin();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const selectedDistrictData = districts.find(d => d.id === selectedDistrict);

  // Show loading state
  if (geoLoading || isDetecting) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Определяем ваше местоположение...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show location request or detected district
  if (!showManualSelection && !geoError && location?.latitude && location?.longitude && detectedDistrictName && selectedDistrictData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Район определён!
            </DialogTitle>
            <DialogDescription>
              По вашей геолокации вы находитесь в:
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-primary/10 rounded-2xl border-2 border-primary text-center">
            <p className="text-sm text-muted-foreground mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              {detectedCity}
            </p>
            <p className="text-3xl font-bold mb-2">
              {getRankBadge(selectedDistrictData.current_rank)} {selectedDistrictData.name}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {selectedDistrictData.participants_count} участников
              </span>
              <span>🌳 {selectedDistrictData.trees_planted}</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-3">
              {selectedDistrictData.total_score.toLocaleString()} очков
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleAutoJoin}
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Присоединение...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Присоединиться к {selectedDistrictData.name}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManualSelection(true)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Выбрать другой район
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show location request if not available
  if (!showManualSelection && (!location?.latitude || !location?.longitude || geoError)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Где вы живёте?
            </DialogTitle>
            <DialogDescription>
              Разрешите доступ к геолокации для автоматического определения района или выберите вручную.
            </DialogDescription>
          </DialogHeader>

          {geoError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Ошибка геолокации</p>
                <p className="text-xs text-muted-foreground mt-1">{geoError}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleRequestLocation}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Определение...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Определить по геолокации
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManualSelection(true)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Выбрать район вручную
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Manual district selection with search
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Выберите свой район
          </DialogTitle>
          <DialogDescription>
            Присоединитесь к битве и помогите своему району стать самым экологичным!
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по городу или району..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* City quick filters */}
        {!searchQuery && cities.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {cities.map(city => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(city)}
                className="text-xs"
              >
                <Building2 className="w-3 h-3 mr-1" />
                {city}
              </Button>
            ))}
          </div>
        )}

        <ScrollArea className="max-h-[350px] pr-4">
          {Object.keys(groupedDistricts).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Ничего не найдено</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedDistricts).map(([city, cityDistricts]) => (
                <div key={city}>
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur py-1">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{city}</span>
                    <span className="text-xs text-muted-foreground">
                      ({cityDistricts.length} {cityDistricts.length === 1 ? 'район' : 'районов'})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cityDistricts.map((district) => (
                      <button
                        key={district.id}
                        onClick={() => setSelectedDistrict(district.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedDistrict === district.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">
                              {getRankBadge(district.current_rank)}
                            </span>
                            <div>
                              <p className="font-semibold flex items-center gap-2">
                                {district.name}
                                {selectedDistrict === district.id && (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                )}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {district.participants_count}
                                </span>
                                <span>🌳 {district.trees_planted}</span>
                                <span>📢 {district.reports_sent}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{district.total_score.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">очков</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              if (detectedDistrictName) {
                setShowManualSelection(false);
                setSearchQuery('');
              } else {
                onOpenChange(false);
              }
            }}
          >
            {detectedDistrictName ? 'Назад' : 'Отмена'}
          </Button>
          <Button
            className="flex-1"
            onClick={handleJoin}
            disabled={!selectedDistrict || isJoining}
          >
            {isJoining ? 'Присоединение...' : 'Присоединиться'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
