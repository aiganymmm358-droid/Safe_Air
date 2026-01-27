import { useState } from 'react';
import { MapPin, Users, Trophy, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export function JoinDistrictDialog({
  open,
  onOpenChange,
  districts,
  onJoin,
  isJoining
}: JoinDistrictDialogProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!selectedDistrict) return;
    const success = await onJoin(selectedDistrict);
    if (success) {
      onOpenChange(false);
      setSelectedDistrict(null);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

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

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {districts.map((district) => (
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
        </ScrollArea>

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
