import { useState, useEffect } from 'react';
import { Plus, Check, X, Target, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AVAILABLE_TASKS, TASK_CATEGORIES, DIFFICULTY_LABELS, type AvailableTask } from '@/data/availableTasks';

interface DailyTask {
  id: string;
  task_id: string;
  task_name: string;
  task_description: string | null;
  xp_reward: number;
  coin_reward: number;
  is_completed: boolean;
  task_date: string;
}

interface DailyTasksManagerProps {
  dailyTasks: DailyTask[];
  onTaskAdded: () => void;
  onTaskCompleted: (taskId: string) => Promise<{ success: boolean; leveledUp?: boolean; newLevel?: number; error?: string }>;
  onTaskRemoved: () => void;
}

export function DailyTasksManager({ dailyTasks, onTaskAdded, onTaskCompleted, onTaskRemoved }: DailyTasksManagerProps) {
  const { user } = useAuthContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('daily');
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const addedTaskIds = dailyTasks.map(t => t.task_id);

  const handleAddTask = async (task: AvailableTask) => {
    if (!user) return;

    setAddingTaskId(task.task_id);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('user_daily_tasks').insert({
        user_id: user.id,
        task_id: task.task_id,
        task_name: task.task_name,
        task_description: task.task_description,
        xp_reward: task.xp_reward,
        coin_reward: task.coin_reward,
        task_date: today,
      });

      if (error) throw error;

      toast.success(`Задание "${task.task_name}" добавлено!`);
      onTaskAdded();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Не удалось добавить задание');
    } finally {
      setAddingTaskId(null);
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!user) return;

    try {
      const task = dailyTasks.find(t => t.task_id === taskId);
      if (!task) return;

      const { error } = await supabase
        .from('user_daily_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Задание удалено из списка');
      onTaskRemoved();
    } catch (error) {
      console.error('Error removing task:', error);
      toast.error('Не удалось удалить задание');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      const result = await onTaskCompleted(taskId);
      if (result.success) {
        if (result.leveledUp) {
          toast.success(`🎉 Поздравляем! Вы достигли ${result.newLevel} уровня!`);
        }
      } else {
        toast.error(result.error || 'Не удалось выполнить задание');
      }
    } finally {
      setCompletingTaskId(null);
    }
  };

  const filteredTasks = AVAILABLE_TASKS.filter(
    task => task.category === selectedCategory && !addedTaskIds.includes(task.task_id)
  );

  const completedCount = dailyTasks.filter(t => t.is_completed).length;
  const totalCount = dailyTasks.length;

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Мои задания на сегодня</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {completedCount}/{totalCount} выполнено
          </Badge>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Выбрать задания
                </DialogTitle>
                <DialogDescription>
                  Добавьте задания в свой список на сегодня
                </DialogDescription>
              </DialogHeader>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="grid grid-cols-5 w-full">
                  {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                    <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                      <span className="mr-1">{cat.icon}</span>
                      <span className="hidden sm:inline">{cat.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex-1 overflow-y-auto mt-4">
                  {Object.keys(TASK_CATEGORIES).map(catKey => (
                    <TabsContent key={catKey} value={catKey} className="mt-0 space-y-3">
                      {filteredTasks.filter(t => t.category === catKey).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Все задания этой категории уже добавлены</p>
                        </div>
                      ) : (
                        filteredTasks.filter(t => t.category === catKey).map(task => (
                          <div
                            key={task.task_id}
                            className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                          >
                            <span className="text-2xl">{task.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{task.task_name}</p>
                                <span className={`text-xs ${DIFFICULTY_LABELS[task.difficulty].color}`}>
                                  {DIFFICULTY_LABELS[task.difficulty].name}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {task.task_description}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-primary font-medium">+{task.xp_reward} XP</span>
                                <span className="text-xs text-accent font-medium">+{task.coin_reward} 🪙</span>
                                {task.verification_type !== 'manual' && (
                                  <Badge variant="outline" className="text-xs">
                                    Авто-проверка
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddTask(task)}
                              disabled={addingTaskId === task.task_id}
                            >
                              {addingTaskId === task.task_id ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))
                      )}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {dailyTasks.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-xl">
            <Target className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              У вас пока нет заданий на сегодня
            </p>
            <Button
              variant="link"
              onClick={() => setDialogOpen(true)}
              className="mt-2"
            >
              Добавить первое задание
            </Button>
          </div>
        ) : (
          dailyTasks.map(task => {
            const taskInfo = AVAILABLE_TASKS.find(t => t.task_id === task.task_id);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  task.is_completed
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                {/* Task icon */}
                <span className="text-2xl">{taskInfo?.icon || '📋'}</span>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.is_completed ? 'line-through opacity-60' : ''}`}>
                    {task.task_name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {task.task_description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary">+{task.xp_reward} XP</span>
                    <span className="text-xs text-accent">+{task.coin_reward} 🪙</span>
                    {taskInfo?.verification_type !== 'manual' && !task.is_completed && (
                      <Badge variant="outline" className="text-xs">
                        Авто
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {task.is_completed ? (
                    <Badge className="bg-primary text-primary-foreground">
                      <Check className="w-3 h-3 mr-1" />
                      Готово
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.task_id)}
                        disabled={completingTaskId === task.task_id}
                      >
                        {completingTaskId === task.task_id ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Выполнено
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTask(task.task_id)}
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completion bonus */}
      {totalCount > 0 && completedCount === totalCount && (
        <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold">Все задания выполнены!</p>
              <p className="text-sm text-muted-foreground">
                Отличная работа! Приходите завтра за новыми заданиями
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
