import { useState } from 'react';
import { TreePine, Calendar, MapPin, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PlantingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  xpReward: number;
  description: string;
}

const PLANTING_EVENTS: PlantingEvent[] = [
  {
    id: 'green-city-jan',
    title: '🌳 Акция «Зелёный город»',
    date: '2026-02-01',
    time: '10:00',
    location: 'Центральный парк, Алматы',
    participants: 42,
    maxParticipants: 100,
    xpReward: 100,
    description: 'Массовая посадка деревьев в рамках городской программы озеленения'
  },
  {
    id: 'eco-marathon',
    title: '🏃 Эко-марафон + Посадка',
    date: '2026-02-08',
    time: '09:00',
    location: 'Парк Первого Президента',
    participants: 28,
    maxParticipants: 50,
    xpReward: 150,
    description: 'Забег на 5 км и посадка саженцев. Каждый участник посадит своё дерево!'
  },
  {
    id: 'school-action',
    title: '📚 Школьная акция',
    date: '2026-02-15',
    time: '11:00',
    location: 'Школа №125, Медеуский район',
    participants: 15,
    maxParticipants: 30,
    xpReward: 75,
    description: 'Озеленение школьной территории совместно с учениками'
  },
  {
    id: 'corporate',
    title: '🏢 Корпоративная посадка',
    date: '2026-02-22',
    time: '14:00',
    location: 'Бизнес-центр Nurly Tau',
    participants: 8,
    maxParticipants: 40,
    xpReward: 80,
    description: 'Озеленение территории бизнес-центра. Открыто для всех желающих!'
  }
];

interface TreePlantingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TreePlantingDialog({ open, onOpenChange }: TreePlantingDialogProps) {
  const { user } = useAuthContext();
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState<string | null>(null);

  const handleRegister = async (event: PlantingEvent) => {
    if (!user) {
      toast.error('Войдите в систему для записи на акцию');
      return;
    }

    if (registeredEvents.includes(event.id)) {
      toast.info('Вы уже записаны на эту акцию');
      return;
    }

    setIsRegistering(event.id);
    try {
      // Create a community post about registration
      await supabase.from('community_posts').insert({
        user_id: user.id,
        content: `🌱 Записался на акцию "${event.title}"\n\n📅 ${formatDate(event.date)} в ${event.time}\n📍 ${event.location}\n\nПрисоединяйтесь! Вместе сделаем город зеленее!`,
        post_type: 'tree',
        impact_description: 'Участие в посадке деревьев',
      });

      // Award XP for registration
      await supabase.rpc('add_user_xp', {
        _user_id: user.id,
        _xp: 15,
        _coins: 5,
        _action_type: 'tree_planting_registration',
        _description: `Запись на акцию: ${event.title}`
      });

      setRegisteredEvents([...registeredEvents, event.id]);
      toast.success(`Вы записаны на акцию! +15 XP (${event.xpReward} XP после участия)`);
    } catch (error: any) {
      console.error('Error registering:', error);
      toast.error('Не удалось записаться на акцию');
    } finally {
      setIsRegistering(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      weekday: 'long'
    });
  };

  const getAvailability = (event: PlantingEvent) => {
    const available = event.maxParticipants - event.participants;
    if (available <= 0) return { text: 'Мест нет', color: 'text-destructive' };
    if (available <= 10) return { text: `Осталось ${available} мест`, color: 'text-aqi-moderate' };
    return { text: `${available} мест свободно`, color: 'text-aqi-good' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-aqi-good" />
            Посадить дерево
          </DialogTitle>
          <DialogDescription>
            Запишитесь на ближайшие акции по озеленению города
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {PLANTING_EVENTS.map((event) => {
            const isRegistered = registeredEvents.includes(event.id);
            const availability = getAvailability(event);
            const isFull = event.participants >= event.maxParticipants;

            return (
              <div 
                key={event.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRegistered 
                    ? 'bg-aqi-good/10 border-aqi-good/30' 
                    : 'bg-muted/30 border-border hover:border-aqi-good/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{event.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-aqi-good/20 text-aqi-good">
                    +{event.xpReward} XP
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(event.date)}, {event.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {event.participants}/{event.maxParticipants} участников
                  </div>
                  <div className={`flex items-center gap-1.5 ${availability.color}`}>
                    {availability.text}
                  </div>
                </div>

                {isRegistered ? (
                  <div className="flex items-center gap-2 p-2 bg-aqi-good/20 rounded-lg text-aqi-good text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Вы записаны на эту акцию
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleRegister(event)}
                    disabled={isFull || isRegistering === event.id}
                    className="w-full bg-aqi-good hover:bg-aqi-good/90 text-white"
                  >
                    {isRegistering === event.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Запись...
                      </>
                    ) : isFull ? (
                      'Мест нет'
                    ) : (
                      'Записаться'
                    )}
                  </Button>
                )}
              </div>
            );
          })}

          <div className="p-4 bg-primary/10 rounded-xl">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Совет:</strong> После участия в акции не забудьте отправить фотоотчёт 
              в сообщество, чтобы получить полную награду XP и вдохновить других!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
