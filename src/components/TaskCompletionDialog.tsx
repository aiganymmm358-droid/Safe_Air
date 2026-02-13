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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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
        return t.tasks.promptPublicTransport;
      case 'walk_instead_drive':
        return t.tasks.promptWalk;
      case 'reduce_energy':
        return t.tasks.promptEnergy;
      case 'plant_care':
        return t.tasks.promptPlant;
      case 'invite_friend':
        return t.tasks.promptFriend;
      case 'report_pollution':
        return t.tasks.promptPollution;
      case 'learn_pm25':
      case 'learn_sources':
      case 'learn_protection':
        return t.tasks.promptLearning;
      case 'ventilate_home':
        return t.tasks.promptVentilate;
      case 'wear_mask':
        return t.tasks.promptMask;
      case 'morning_exercise':
        return t.tasks.promptExercise;
      default:
        return t.tasks.promptDefault;
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
            {t.tasks.confirmCompletion}
          </DialogTitle>
          <DialogDescription>
            {taskName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isManualTask ? (
            <>
              <p className="text-sm text-muted-foreground">
                {t.tasks.taskRequiresConfirm}
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {getVerificationMessage()}
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.tasks.exampleDescription}
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
                <p className="font-medium">{t.tasks.autoVerified}</p>
                <p className="text-sm text-muted-foreground">
                  {t.tasks.systemRecorded}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t.tasks.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || (isManualTask && note.trim().length < 3)}
          >
            {isSubmitting ? '⏳' : '✓'} {t.tasks.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}