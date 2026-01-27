import { Trophy, Zap, Coins, Target, CheckCircle, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GamificationPanelProps {
  level: number;
  xp: number;
  xpToNext: number;
  ecoCoins: number;
  streakDays: number;
  badges: string[];
}

const dailyQuests = [
  { id: 1, title: "Проверить качество воздуха", xp: 10, completed: true },
  { id: 2, title: "Поделиться данными о локации", xp: 25, completed: true },
  { id: 3, title: "Пройти эко-урок", xp: 50, completed: false },
  { id: 4, title: "Сообщить о нарушителе", xp: 100, completed: false },
];

export const GamificationPanel = ({ level, xp, xpToNext, ecoCoins, streakDays, badges }: GamificationPanelProps) => {
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
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6">
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

      {/* Daily Quests */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-secondary" />
          Ежедневные задания
        </h4>
        <div className="space-y-2">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                quest.completed 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                {quest.completed ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={quest.completed ? "line-through text-muted-foreground" : ""}>
                  {quest.title}
                </span>
              </div>
              <span className="text-sm font-medium text-accent">+{quest.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Preview */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-accent" />
          Достижения
        </h4>
        <div className="flex gap-2 flex-wrap">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-lg hover-lift cursor-pointer"
              title={badge}
            >
              {badge}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            +5
          </div>
        </div>
      </div>
    </div>
  );
};
