import { Users, Calendar, Coins, Sparkles, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  endDate: string;
  goalDescription: string | null;
  rewardCoins: number;
  rewardXp: number;
  participantsCount: number;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
  isJoining: boolean;
  isLeaving: boolean;
  isAuthenticated: boolean;
}

export const ChallengeCard = ({
  title,
  description,
  emoji,
  endDate,
  goalDescription,
  rewardCoins,
  rewardXp,
  participantsCount,
  isJoined,
  onJoin,
  onLeave,
  onOpenChat,
  isJoining,
  isLeaving,
  isAuthenticated
}: ChallengeCardProps) => {
  const timeLeft = formatDistanceToNow(new Date(endDate), { locale: ru, addSuffix: false });

  return (
    <div className={`glass-card rounded-2xl p-5 border-2 transition-all ${
      isJoined ? 'border-primary/40 bg-primary/5' : 'border-transparent hover:border-primary/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-lg">{title}</h3>
            {isJoined && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Участвуете
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}

          {goalDescription && (
            <p className="text-sm text-foreground mt-2 font-medium">
              🎯 {goalDescription}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{timeLeft}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participantsCount} участников</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-accent">
              <Coins className="w-4 h-4" />
              <span>+{rewardCoins}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>+{rewardXp} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {isJoined ? (
              <>
                <Button 
                  onClick={onOpenChat}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Чат участников
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={onLeave}
                  disabled={isLeaving}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={onJoin}
                disabled={isJoining || !isAuthenticated}
                className="w-full"
              >
                {isAuthenticated ? 'Присоединиться' : 'Войдите для участия'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
