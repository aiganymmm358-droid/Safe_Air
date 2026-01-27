import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GamificationPanel } from "@/components/GamificationPanel";
import { Trophy, Target, TrendingUp, CheckCircle2, Circle, Loader2, Flame, Star } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const ProgressPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const {
    progress,
    achievements,
    dailyTasks,
    recentActions,
    isLoading,
    completeTask,
    progressPercentage,
    completedTasksCount,
    totalTasksCount,
    updateStreak,
  } = useUserProgress();

  const streakUpdatedRef = useRef(false);

  // Update streak only once on mount
  useEffect(() => {
    if (isAuthenticated && !streakUpdatedRef.current) {
      streakUpdatedRef.current = true;
      updateStreak();
    }
  }, [isAuthenticated]);

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-12 text-center">
          <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Войдите для отслеживания прогресса</h2>
          <p className="text-muted-foreground mb-6">
            Зарегистрируйтесь или войдите, чтобы сохранять достижения, получать награды и соревноваться с другими
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Войти / Зарегистрироваться
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCompleteTask = async (taskId: string) => {
    const result = await completeTask(taskId);
    if (result.success) {
      if (result.leveledUp) {
        toast.success(`🎉 Поздравляем! Вы достигли ${result.newLevel} уровня!`);
      } else {
        toast.success('Задание выполнено! +XP и монеты получены');
      }
    } else {
      toast.error(result.error || 'Не удалось выполнить задание');
    }
  };

  // Extract achievement icons for badges display
  const badgeIcons = achievements.map(a => a.achievement_icon || '🏅').slice(0, 5);

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
        {progress && progress.streak_days > 0 && (
          <div className="eco-badge text-lg flex items-center gap-2">
            <Flame className="w-5 h-5" />
            {progress.streak_days} {getDaysWord(progress.streak_days)} подряд
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Gamification Panel */}
        <div className="lg:col-span-2">
          <GamificationPanel
            level={progress?.level || 1}
            xp={progress?.xp || 0}
            xpToNext={progress?.xp_to_next_level || 100}
            ecoCoins={progress?.eco_coins || 0}
            streakDays={progress?.streak_days || 0}
            badges={badgeIcons.length > 0 ? badgeIcons : ["🎉"]}
          />
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Daily Tasks */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              Ежедневные задания
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {completedTasksCount}/{totalTasksCount}
              </span>
            </h3>
            <div className="space-y-3">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    task.is_completed ? 'bg-primary/10' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {task.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${task.is_completed ? 'line-through opacity-60' : ''}`}>
                      {task.task_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{task.xp_reward} XP, +{task.coin_reward} монет
                    </p>
                  </div>
                  {!task.is_completed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCompleteTask(task.task_id)}
                    >
                      ✓
                    </Button>
                  )}
                </div>
              ))}
              {dailyTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Загрузка заданий...
                </p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-accent" />
              Достижения
            </h3>
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2">
                  <span className="text-2xl">{achievement.achievement_icon || '🏅'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.achievement_name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.achievement_description}</p>
                  </div>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Выполняйте задания, чтобы получить достижения!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{progress?.total_xp_earned || 0}</p>
          <p className="text-sm text-muted-foreground">Всего XP</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-accent">{progress?.total_coins_earned || 0}</p>
          <p className="text-sm text-muted-foreground">Всего монет</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-secondary">{achievements.length}</p>
          <p className="text-sm text-muted-foreground">Достижений</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{progress?.level || 1}</p>
          <p className="text-sm text-muted-foreground">Уровень</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          Недавняя активность
        </h3>
        {recentActions.length > 0 ? (
          <div className="space-y-2">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm">{action.action_description || action.action_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(action.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  {action.xp_earned > 0 && (
                    <span className="text-sm text-primary font-medium">+{action.xp_earned} XP</span>
                  )}
                  {action.coins_earned > 0 && (
                    <span className="text-sm text-accent font-medium ml-2">+{action.coins_earned} 🪙</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center bg-muted/30 rounded-xl">
            <p className="text-muted-foreground">Начните выполнять задания для отслеживания активности</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for Russian day pluralization
function getDaysWord(days: number): string {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
}

export default ProgressPage;
