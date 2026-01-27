import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { AVAILABLE_TASKS } from '@/data/availableTasks';

interface TaskCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskName: string;
  onConfirm: (note?: string) => Promise<void>;
}

export function TaskCompletionDialog({
  open,
  onOpenChange,
  taskId,
  taskName,
  onConfirm,
}: TaskCompletionDialogProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskInfo = AVAILABLE_TASKS.find(t => t.task_id === taskId);
  const isManualTask = taskInfo?.verification_type === 'manual';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(note.trim() || undefined);
      setNote('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationMessage = () => {
    switch (taskId) {
      case 'use_public_transport':
        return 'Каким транспортом вы воспользовались?';
      case 'walk_instead_drive':
        return 'Примерно сколько км вы прошли?';
      case 'reduce_energy':
        return 'Что именно вы отключили?';
      case 'plant_care':
        return 'Какое растение вы полили/посадили?';
      case 'invite_friend':
        return 'Имя друга, которого пригласили?';
      case 'report_pollution':
        return 'Что и где вы обнаружили?';
      case 'learn_pm25':
      case 'learn_sources':
      case 'learn_protection':
        return 'Что нового вы узнали? (кратко)';
      case 'ventilate_home':
        return 'Как долго проветривали?';
      case 'wear_mask':
        return 'Какой тип маски использовали?';
      case 'morning_exercise':
        return 'Какие упражнения выполняли?';
      default:
        return 'Опишите кратко выполнение задания';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isManualTask ? (
              <AlertCircle className="w-5 h-5 text-accent" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
            Подтверждение выполнения
          </DialogTitle>
          <DialogDescription>
            {taskName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isManualTask ? (
            <>
              <p className="text-sm text-muted-foreground">
                Это задание требует подтверждения. Пожалуйста, опишите кратко, как вы его выполнили.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {getVerificationMessage()}
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Например: Прошёл 2 км до работы пешком..."
                  className="min-h-[80px]"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {note.length}/200
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">Задание проверено автоматически</p>
                <p className="text-sm text-muted-foreground">
                  Система зафиксировала выполнение этого действия
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || (isManualTask && note.trim().length < 3)}
          >
            {isSubmitting ? '⏳' : '✓'} Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
