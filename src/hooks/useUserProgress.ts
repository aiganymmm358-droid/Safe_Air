import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { AVAILABLE_TASKS } from '@/data/availableTasks';

export interface UserProgress {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  eco_coins: number;
  total_xp_earned: number;
  total_coins_earned: number;
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_description: string | null;
  achievement_icon: string | null;
  unlocked_at: string;
}

export interface UserDailyTask {
  id: string;
  user_id: string;
  task_id: string;
  task_name: string;
  task_description: string | null;
  xp_reward: number;
  coin_reward: number;
  is_completed: boolean;
  task_date: string;
  completed_at: string | null;
}

export interface UserAction {
  id: string;
  user_id: string;
  action_type: string;
  action_description: string | null;
  xp_earned: number;
  coins_earned: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ProgressState {
  progress: UserProgress | null;
  achievements: UserAchievement[];
  dailyTasks: UserDailyTask[];
  recentActions: UserAction[];
  isLoading: boolean;
  error: string | null;
}

// Default starter tasks for new users (only 3 basic ones)
const DEFAULT_STARTER_TASKS = AVAILABLE_TASKS.filter(t => 
  ['check_aqi', 'view_recommendations', 'share_data'].includes(t.task_id)
).map(t => ({
  task_id: t.task_id,
  task_name: t.task_name,
  task_description: t.task_description,
  xp_reward: t.xp_reward,
  coin_reward: t.coin_reward,
}));

export function useUserProgress() {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<ProgressState>({
    progress: null,
    achievements: [],
    dailyTasks: [],
    recentActions: [],
    isLoading: true,
    error: null,
  });

  // Fetch all user progress data
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all data in parallel
      const [progressRes, achievementsRes, tasksRes, actionsRes] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false }),
        supabase
          .from('user_daily_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('task_date', new Date().toISOString().split('T')[0])
          .order('task_id'),
        supabase
          .from('user_actions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (progressRes.error) throw progressRes.error;
      if (achievementsRes.error) throw achievementsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (actionsRes.error) throw actionsRes.error;

      // Initialize default daily tasks only for new users (first time)
      let dailyTasks = tasksRes.data as UserDailyTask[];
      if (dailyTasks.length === 0 && progressRes.data) {
        // Check if user has ever had tasks
        const { count } = await supabase
          .from('user_daily_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Only add default tasks for completely new users
        if (count === 0) {
          const today = new Date().toISOString().split('T')[0];
          const newTasks = DEFAULT_STARTER_TASKS.map(task => ({
            ...task,
            user_id: user.id,
            task_date: today,
          }));

          const { data: insertedTasks, error: insertError } = await supabase
            .from('user_daily_tasks')
            .insert(newTasks)
            .select();

          if (!insertError && insertedTasks) {
            dailyTasks = insertedTasks as UserDailyTask[];
          }
        }
      }

      setState({
        progress: progressRes.data as UserProgress | null,
        achievements: achievementsRes.data as UserAchievement[],
        dailyTasks,
        recentActions: actionsRes.data as UserAction[],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
      }));
    }
  }, [user]);

  // Initialize on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProgress();
    } else {
      setState({
        progress: null,
        achievements: [],
        dailyTasks: [],
        recentActions: [],
        isLoading: false,
        error: null,
      });
    }
  }, [isAuthenticated, fetchProgress]);

  // Add XP and coins
  const addXP = async (xp: number, coins: number = 0, actionType: string = 'generic', description?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('add_user_xp', {
        _user_id: user.id,
        _xp: xp,
        _coins: coins,
        _action_type: actionType,
        _description: description || null,
      });

      if (error) throw error;

      // Refresh progress
      await fetchProgress();

      const result = data?.[0];
      return {
        success: true,
        leveledUp: result?.leveled_up || false,
        newLevel: result?.new_level,
        newXp: result?.new_xp,
        newCoins: result?.new_coins,
      };
    } catch (error) {
      console.error('Error adding XP:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add XP' };
    }
  };

  // Complete a daily task with optional verification note
  const completeTask = async (taskId: string, verificationNote?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const task = state.dailyTasks.find(t => t.task_id === taskId);
    if (!task || task.is_completed) {
      return { success: false, error: 'Task not found or already completed' };
    }

    // Check if this is a manual task that requires verification
    const taskInfo = AVAILABLE_TASKS.find(t => t.task_id === taskId);
    if (taskInfo?.verification_type === 'manual' && (!verificationNote || verificationNote.length < 3)) {
      return { success: false, error: 'Требуется подтверждение выполнения' };
    }

    try {
      // Mark task as completed with optional note
      const { error: updateError } = await supabase
        .from('user_daily_tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Award XP and coins with verification note in description
      const description = verificationNote 
        ? `Выполнено задание: ${task.task_name} (${verificationNote})`
        : `Выполнено задание: ${task.task_name}`;
        
      const result = await addXP(
        task.xp_reward,
        task.coin_reward,
        'daily_task',
        description
      );

      // Check for achievements
      await checkAchievements();

      return result;
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to complete task' };
    }
  };

  // Uncomplete a task (revert completion)
  const uncompleteTask = async (taskId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const task = state.dailyTasks.find(t => t.task_id === taskId);
    if (!task || !task.is_completed) {
      return { success: false, error: 'Задание не найдено или не было выполнено' };
    }

    try {
      // Mark task as not completed
      const { error: updateError } = await supabase
        .from('user_daily_tasks')
        .update({
          is_completed: false,
          completed_at: null,
        })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Deduct XP and coins from progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          xp: Math.max(0, (state.progress?.xp || 0) - task.xp_reward),
          eco_coins: Math.max(0, (state.progress?.eco_coins || 0) - task.coin_reward),
          total_xp_earned: Math.max(0, (state.progress?.total_xp_earned || 0) - task.xp_reward),
          total_coins_earned: Math.max(0, (state.progress?.total_coins_earned || 0) - task.coin_reward),
        })
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Log the revert action
      await supabase.from('user_actions').insert({
        user_id: user.id,
        action_type: 'task_uncomplete',
        action_description: `Отменено выполнение: ${task.task_name}`,
        xp_earned: -task.xp_reward,
        coins_earned: -task.coin_reward,
      });

      await fetchProgress();
      return { success: true };
    } catch (error) {
      console.error('Error uncompleting task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Не удалось отменить выполнение' };
    }
  };

  // Check and award achievements
  const checkAchievements = async () => {
    if (!user || !state.progress) return;

    const achievementIds = state.achievements.map(a => a.achievement_id);

    // First task completed
    const completedTasks = state.dailyTasks.filter(t => t.is_completed).length + 1;
    if (completedTasks >= 1 && !achievementIds.includes('first_task')) {
      await unlockAchievement('first_task', 'Первый шаг', 'Выполните первое задание', '🎯');
    }

    // 5 tasks completed
    if (completedTasks >= 5 && !achievementIds.includes('five_tasks')) {
      await unlockAchievement('five_tasks', 'Активист', 'Выполните 5 заданий', '⭐');
    }

    // Level up achievements
    if (state.progress.level >= 5 && !achievementIds.includes('level_5')) {
      await unlockAchievement('level_5', 'Опытный эколог', 'Достигните 5 уровня', '🌟');
    }

    if (state.progress.level >= 10 && !achievementIds.includes('level_10')) {
      await unlockAchievement('level_10', 'Эко-мастер', 'Достигните 10 уровня', '👑');
    }

    // Streak achievements
    if (state.progress.streak_days >= 3 && !achievementIds.includes('streak_3')) {
      await unlockAchievement('streak_3', 'Постоянство', '3 дня активности подряд', '🔥');
    }

    if (state.progress.streak_days >= 7 && !achievementIds.includes('streak_7')) {
      await unlockAchievement('streak_7', 'Недельный марафон', '7 дней активности подряд', '💪');
    }
  };

  // Update streak
  const updateStreak = async () => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc('update_user_streak', {
        _user_id: user.id,
      });

      if (error) throw error;

      await fetchProgress();
      return data as number;
    } catch (error) {
      console.error('Error updating streak:', error);
      return 0;
    }
  };

  // Unlock achievement
  const unlockAchievement = async (
    achievementId: string,
    name: string,
    description: string,
    icon: string
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if already unlocked
    if (state.achievements.some(a => a.achievement_id === achievementId)) {
      return { success: false, error: 'Achievement already unlocked' };
    }

    try {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: achievementId,
        achievement_name: name,
        achievement_description: description,
        achievement_icon: icon,
      });

      if (error) throw error;

      await fetchProgress();
      return { success: true };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to unlock achievement' };
    }
  };

  // Remove a task from today's list
  const removeTask = async (taskId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const task = state.dailyTasks.find(t => t.task_id === taskId);
    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    try {
      const { error } = await supabase
        .from('user_daily_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      await fetchProgress();
      return { success: true };
    } catch (error) {
      console.error('Error removing task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove task' };
    }
  };

  // Calculate progress percentage to next level
  const getProgressPercentage = () => {
    if (!state.progress) return 0;
    return Math.round((state.progress.xp / state.progress.xp_to_next_level) * 100);
  };

  // Get completed tasks count
  const getCompletedTasksCount = () => {
    return state.dailyTasks.filter(t => t.is_completed).length;
  };

  return {
    ...state,
    addXP,
    completeTask,
    uncompleteTask,
    removeTask,
    updateStreak,
    unlockAchievement,
    refreshProgress: fetchProgress,
    progressPercentage: getProgressPercentage(),
    completedTasksCount: getCompletedTasksCount(),
    totalTasksCount: state.dailyTasks.length,
  };
}
