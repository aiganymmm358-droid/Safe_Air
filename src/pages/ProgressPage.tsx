import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GamificationPanel } from "@/components/GamificationPanel";
import { DailyTasksManager } from "@/components/DailyTasksManager";
import { Trophy, TrendingUp, Loader2, Flame, Star } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const ProgressPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const {
    progress,
    achievements,
    dailyTasks,
    recentActions,
    isLoading,
    completeTask,
    uncompleteTask,
    refreshProgress,
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

  // Helper function for day pluralization based on language
  const getDaysWord = (days: number): string => {
    if (language === 'en') {
      return days === 1 ? 'day' : 'days';
    }
    if (language === 'kz') {
      return 'күн';
    }
    // Russian pluralization
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  };

  // Get date locale based on language
  const getDateLocale = () => {
    switch (language) {
      case 'en': return 'en-US';
      case 'kz': return 'kk-KZ';
      default: return 'ru-RU';
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-12 text-center">
          <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">{t.auth.loginToTrack}</h2>
          <p className="text-muted-foreground mb-6">
            {t.auth.loginPrompt}
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            {t.auth.login} / {t.auth.register}
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

  // Extract achievement icons for badges display
  const badgeIcons = achievements.map(a => a.achievement_icon || '🏅').slice(0, 5);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            {t.progress.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.progress.trackAchievements}</p>
        </div>
        {progress && progress.streak_days > 0 && (
          <div className="eco-badge text-lg flex items-center gap-2">
            <Flame className="w-5 h-5" />
            {progress.streak_days} {getDaysWord(progress.streak_days)} {language === 'ru' ? 'подряд' : language === 'kz' ? 'қатарынан' : 'in a row'}
          </div>
        )}
      </div>

      {/* Main Gamification Panel */}
      <GamificationPanel
        level={progress?.level || 1}
        xp={progress?.xp || 0}
        xpToNext={progress?.xp_to_next_level || 100}
        ecoCoins={progress?.eco_coins || 0}
        streakDays={progress?.streak_days || 0}
        badges={badgeIcons.length > 0 ? badgeIcons : ["🎉"]}
      />

      {/* Daily Tasks Manager - Full Width */}
      <div className="glass-card rounded-2xl p-6">
        <DailyTasksManager
          dailyTasks={dailyTasks}
          onTaskAdded={refreshProgress}
          onTaskCompleted={completeTask}
          onTaskUncompleted={uncompleteTask}
          onTaskRemoved={refreshProgress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent" />
            {t.progress.myAchievements} ({achievements.length})
          </h3>
          <div className="space-y-3">
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <span className="text-3xl">{achievement.achievement_icon || '🏅'}</span>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.achievement_name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.achievement_description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.unlocked_at).toLocaleDateString(getDateLocale(), {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.progress.completeTasksForAchievements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t.progress.recentActivity}
          </h3>
          {recentActions.length > 0 ? (
            <div className="space-y-2">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm">{action.action_description || action.action_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(action.created_at).toLocaleDateString(getDateLocale(), {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {action.xp_earned > 0 && (
                      <span className="text-sm text-primary font-medium">+{action.xp_earned} XP</span>
                    )}
                    {action.coins_earned > 0 && (
                      <span className="text-sm text-accent font-medium">+{action.coins_earned} 🪙</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.progress.startTasksToTrack}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{progress?.total_xp_earned || 0}</p>
          <p className="text-sm text-muted-foreground">{t.progress.totalXP}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-accent">{progress?.total_coins_earned || 0}</p>
          <p className="text-sm text-muted-foreground">{t.progress.totalCoins}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-secondary">{achievements.length}</p>
          <p className="text-sm text-muted-foreground">{t.progress.achievements}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{progress?.level || 1}</p>
          <p className="text-sm text-muted-foreground">{t.progress.level}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;