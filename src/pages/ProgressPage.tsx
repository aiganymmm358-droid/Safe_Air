import { GamificationPanel } from "@/components/GamificationPanel";
import { Trophy, Target, Gift, Calendar, TrendingUp } from "lucide-react";

const ProgressPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            Мой прогресс
          </h1>
          <p className="text-muted-foreground mt-1">Отслеживайте свои достижения и развивайтесь</p>
        </div>
        <div className="eco-badge text-lg">
          🔥 7 дней подряд
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Gamification Panel */}
        <div className="lg:col-span-2">
          <GamificationPanel
            level={15}
            xp={2340}
            xpToNext={3000}
            ecoCoins={1250}
            streakDays={7}
            badges={["🌳", "🚴", "📢", "🏆", "⭐"]}
          />
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Weekly Stats */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-secondary" />
              Статистика недели
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Проверок воздуха</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Репортов отправлено</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Эко-уроков пройдено</span>
                <span className="font-bold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">CO₂ предотвращено</span>
                <span className="font-bold text-primary">12.5 кг</span>
              </div>
            </div>
          </div>

          {/* Available Rewards */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-accent" />
              Доступные награды
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl">
                <span className="text-2xl">🎟️</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Скидка в эко-магазине</p>
                  <p className="text-xs text-muted-foreground">500 Eco-Coins</p>
                </div>
                <button className="px-3 py-1 bg-accent text-accent-foreground rounded-lg text-sm font-medium">
                  Получить
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl opacity-60">
                <span className="text-2xl">🌳</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Посадить дерево</p>
                  <p className="text-xs text-muted-foreground">1000 Eco-Coins</p>
                </div>
                <span className="text-xs text-muted-foreground">Скоро</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          Прогресс за месяц
        </h3>
        <div className="h-48 flex items-center justify-center bg-muted/30 rounded-xl">
          <p className="text-muted-foreground">График прогресса будет здесь</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
