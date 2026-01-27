import { Trophy, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GamificationPanelProps {
  level: number;
  xp: number;
  xpToNext: number;
  ecoCoins: number;
  streakDays: number;
  badges?: string[];
}

export const GamificationPanel = ({ level, xp, xpToNext, ecoCoins, streakDays }: GamificationPanelProps) => {
  const xpProgress = (xp / xpToNext) * 100;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Ваш прогресс
        </h3>
        <div className="eco-badge">
          🔥 {streakDays} дней
        </div>
      </div>

      {/* Level & XP */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xl font-display font-bold text-primary-foreground">{level}</span>
            </div>
            <div>
              <p className="font-semibold">Эко-Защитник</p>
              <p className="text-sm text-muted-foreground">{xp} / {xpToNext} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-accent" />
            <span className="font-semibold text-accent">{ecoCoins}</span>
          </div>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>
    </div>
  );
};
