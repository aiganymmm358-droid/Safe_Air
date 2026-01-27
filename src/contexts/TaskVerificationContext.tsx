import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TaskVerification {
  task_id: string;
  verified: boolean;
  verified_at: string | null;
}

interface TaskVerificationContextType {
  verifiedTasks: TaskVerification[];
  verifyTask: (taskId: string) => void;
  isTaskVerified: (taskId: string) => boolean;
  autoCompleteTask: (taskId: string, taskName: string) => Promise<void>;
}

const TaskVerificationContext = createContext<TaskVerificationContextType | null>(null);

export function TaskVerificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const location = useLocation();
  const [verifiedTasks, setVerifiedTasks] = useState<TaskVerification[]>([]);
  const verificationProcessedRef = useRef<Set<string>>(new Set());

  // Track page visits for auto-verification
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const verifyBasedOnRoute = async () => {
      const path = location.pathname;
      
      // Auto-verify based on visited pages
      if (path === '/map' && !verificationProcessedRef.current.has('check_aqi')) {
        verificationProcessedRef.current.add('check_aqi');
        await autoVerifyAndComplete('check_aqi', 'Проверить качество воздуха');
      }
      
      if (path === '/health' && !verificationProcessedRef.current.has('view_recommendations')) {
        verificationProcessedRef.current.add('view_recommendations');
        await autoVerifyAndComplete('view_recommendations', 'Прочитать рекомендации');
      }
      
      if (path === '/community' && !verificationProcessedRef.current.has('community_discussion')) {
        verificationProcessedRef.current.add('community_discussion');
        await autoVerifyAndComplete('community_discussion', 'Участвовать в обсуждении');
      }
    };

    verifyBasedOnRoute();
  }, [location.pathname, isAuthenticated, user]);

  const verifyTask = useCallback((taskId: string) => {
    setVerifiedTasks(prev => {
      if (prev.some(t => t.task_id === taskId)) return prev;
      return [...prev, { task_id: taskId, verified: true, verified_at: new Date().toISOString() }];
    });
  }, []);

  const isTaskVerified = useCallback((taskId: string) => {
    return verifiedTasks.some(t => t.task_id === taskId && t.verified);
  }, [verifiedTasks]);

  const autoVerifyAndComplete = async (taskId: string, taskName: string) => {
    if (!user) return;

    try {
      // Check if task exists for today and is not completed
      const today = new Date().toISOString().split('T')[0];
      const { data: existingTask } = await supabase
        .from('user_daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .eq('task_date', today)
        .maybeSingle();

      if (existingTask && !existingTask.is_completed) {
        // Mark as completed
        await supabase
          .from('user_daily_tasks')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingTask.id);

        // Award XP
        await supabase.rpc('add_user_xp', {
          _user_id: user.id,
          _xp: existingTask.xp_reward,
          _coins: existingTask.coin_reward,
          _action_type: 'daily_task',
          _description: `Выполнено задание: ${taskName}`,
        });

        toast.success(`✓ Задание "${taskName}" выполнено автоматически!`, {
          description: `+${existingTask.xp_reward} XP, +${existingTask.coin_reward} монет`,
        });

        verifyTask(taskId);
      }
    } catch (error) {
      console.error('Error auto-completing task:', error);
    }
  };

  const autoCompleteTask = useCallback(async (taskId: string, taskName: string) => {
    await autoVerifyAndComplete(taskId, taskName);
  }, [user]);

  return (
    <TaskVerificationContext.Provider value={{ verifiedTasks, verifyTask, isTaskVerified, autoCompleteTask }}>
      {children}
    </TaskVerificationContext.Provider>
  );
}

export function useTaskVerification() {
  const context = useContext(TaskVerificationContext);
  if (!context) {
    throw new Error('useTaskVerification must be used within TaskVerificationProvider');
  }
  return context;
}
