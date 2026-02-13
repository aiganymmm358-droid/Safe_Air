import { useState, useRef } from 'react';
import { Camera, MapPin, Send, TreeDeciduous, Bike, BookOpen, Recycle, AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { toast } from 'sonner';

interface SubmitActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (activity: {
    activity_type: string;
    description?: string;
    photo_url?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<boolean>;
  isSubmitting: boolean;
}

const activityTypes = [
  { id: 'tree_planted', icon: TreeDeciduous, label: 'Посадка дерева', points: 100, color: 'text-green-500' },
  { id: 'report_sent', icon: AlertTriangle, label: 'Репорт о нарушении', points: 50, color: 'text-amber-500' },
  { id: 'car_free_day', icon: Bike, label: 'День без авто', points: 25, color: 'text-blue-500' },
  { id: 'eco_lesson', icon: BookOpen, label: 'Эко-урок', points: 20, color: 'text-purple-500' },
  { id: 'cleanup', icon: Trash2, label: 'Уборка территории', points: 75, color: 'text-teal-500' },
  { id: 'recycling', icon: Recycle, label: 'Сдача вторсырья', points: 30, color: 'text-emerald-500' },
];

export function SubmitActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: SubmitActivityDialogProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { location } = useGeolocationContext();

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo, we'll use a data URL. In production, upload to Supabase Storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (location) {
      setCoordinates({ lat: location.latitude, lng: location.longitude });
      setHasLocation(true);
      toast.success('Геолокация получена! 📍');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setHasLocation(true);
          toast.success('Геолокация получена! 📍');
        },
        (error) => {
          toast.error('Не удалось получить геолокацию');
          console.error(error);
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Выберите тип активности');
      return;
    }

    const success = await onSubmit({
      activity_type: selectedType,
      description: description.trim() || undefined,
      photo_url: photoPreview || undefined,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng
    });

    if (success) {
      onOpenChange(false);
      // Reset form
      setSelectedType(null);
      setDescription('');
      setPhotoPreview(null);
      setHasLocation(false);
      setCoordinates(null);
    }
  };

  const selectedActivity = activityTypes.find(t => t.id === selectedType);
  const verificationScore = (photoPreview ? 50 : 0) + (hasLocation ? 50 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Отправить активность
          </DialogTitle>
          <DialogDescription>
            Добавьте фото и геолокацию для автоматической верификации
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity type selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Тип активности</label>
            <div className="grid grid-cols-2 gap-2">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${type.color}`} />
                      <div>
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">+{type.points} очков</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Описание (опционально)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажите о вашей активности..."
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Verification tools */}
          <div className="p-4 bg-muted/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Верификация</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${verificationScore >= 50 ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
                <div className={`w-2 h-2 rounded-full ${verificationScore >= 100 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                <span className="text-xs text-muted-foreground ml-1">{verificationScore}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Photo upload */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Button
                variant={photoPreview ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                {photoPreview ? 'Фото добавлено ✓' : 'Добавить фото'}
              </Button>

              {/* Geolocation */}
              <Button
                variant={hasLocation ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={handleGetLocation}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {hasLocation ? 'Локация ✓' : 'Добавить локацию'}
              </Button>
            </div>

            {photoPreview && (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                >
                  ×
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {verificationScore === 100
                ? '✅ Активность будет автоматически подтверждена'
                : verificationScore >= 50
                ? '⏳ Активность будет проверена модератором'
                : '⚠️ Добавьте фото и геолокацию для быстрой верификации'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!selectedType || isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : `Отправить${selectedActivity ? ` (+${selectedActivity.points})` : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
