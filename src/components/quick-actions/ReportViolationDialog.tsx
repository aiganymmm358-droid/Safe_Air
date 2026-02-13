import { useState, useRef } from 'react';
import { AlertTriangle, Camera, MapPin, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { toast } from 'sonner';

const VIOLATION_TYPES = [
  { id: 'industrial', label: '🏭 Промышленные выбросы', points: 50 },
  { id: 'transport', label: '🚗 Дымящий транспорт', points: 30 },
  { id: 'burning', label: '🔥 Сжигание мусора', points: 40 },
  { id: 'construction', label: '🏗️ Строительная пыль', points: 35 },
  { id: 'other', label: '❓ Другое', points: 25 },
];

interface ReportViolationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportViolationDialog({ open, onOpenChange }: ReportViolationDialogProps) {
  const { user } = useAuthContext();
  const { location, requestLocation } = useGeolocationContext();
  const [violationType, setViolationType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер изображения не должен превышать 5 МБ');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `reports/${user!.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Войдите в систему для отправки репорта');
      return;
    }

    if (!violationType) {
      toast.error('Выберите тип нарушения');
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error('Опишите нарушение (минимум 10 символов)');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const selectedType = VIOLATION_TYPES.find(t => t.id === violationType);
      
      // Create a community post with the report
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        content: `📍 Репорт о нарушении: ${selectedType?.label}\n\n${description}${location ? `\n\n📌 Координаты: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : ''}`,
        post_type: 'report',
        image_url: imageUrl,
        impact_description: `Потенциальный вред экологии`,
      });

      if (error) throw error;

      // Award XP for the report
      await supabase.rpc('add_user_xp', {
        _user_id: user.id,
        _xp: selectedType?.points || 25,
        _coins: 10,
        _action_type: 'violation_report',
        _description: `Репорт о нарушении: ${selectedType?.label}`
      });

      toast.success(`Репорт отправлен! +${selectedType?.points || 25} XP`);
      
      // Reset form
      setViolationType('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error(error.message || 'Не удалось отправить репорт');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Сообщить о нарушении
          </DialogTitle>
          <DialogDescription>
            Помогите выявить источники загрязнения воздуха
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Violation type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Тип нарушения</label>
            <Select value={violationType} onValueChange={setViolationType}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип нарушения" />
              </SelectTrigger>
              <SelectContent>
                {VIOLATION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label} (+{type.points} XP)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Описание</label>
            <Textarea
              placeholder="Опишите нарушение подробно: что вы видите, где это происходит..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium mb-2 block">Местоположение</label>
            {location ? (
              <div className="flex items-center gap-2 p-3 bg-aqi-good/10 rounded-lg text-sm">
                <MapPin className="w-4 h-4 text-aqi-good" />
                <span>Геопозиция определена: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
              </div>
            ) : (
              <Button variant="outline" onClick={requestLocation} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Определить местоположение
              </Button>
            )}
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Фото доказательство</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="report-image-input"
                />
                <label
                  htmlFor="report-image-input"
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-destructive/50 hover:bg-destructive/5 transition-all"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Добавить фото (рекомендуется)</span>
                </label>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-destructive hover:bg-destructive/90">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Отправить репорт
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
