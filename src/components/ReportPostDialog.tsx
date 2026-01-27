import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onReported: () => void;
}

const REPORT_REASONS = [
  { value: 'off_topic', label: 'Не по теме (не связано с экологией)' },
  { value: 'spam', label: 'Спам или реклама' },
  { value: 'offensive', label: 'Оскорбительный контент' },
  { value: 'misinformation', label: 'Ложная информация' },
  { value: 'other', label: 'Другое' }
];

export function ReportPostDialog({ open, onOpenChange, postId, onReported }: ReportPostDialogProps) {
  const [reason, setReason] = useState('off_topic');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const selectedReason = REPORT_REASONS.find(r => r.value === reason);
      const fullReason = additionalInfo.trim() 
        ? `${selectedReason?.label}: ${additionalInfo.trim()}`
        : selectedReason?.label || 'Нарушение правил';

      const response = await supabase.functions.invoke('moderate-content', {
        body: { 
          postId,
          action: 'report',
          reportReason: fullReason
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (result.autoModerated) {
        toast({
          title: "Контент удален",
          description: result.message
        });
      } else {
        toast({
          title: "Жалоба отправлена",
          description: result.message
        });
      }

      onReported();
      onOpenChange(false);
      setReason('off_topic');
      setAdditionalInfo('');
    } catch (error: any) {
      console.error('Error reporting post:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить жалобу",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Пожаловаться на пост
          </DialogTitle>
          <DialogDescription>
            Выберите причину жалобы. Модераторы рассмотрят ваше обращение.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <Label htmlFor={r.value} className="cursor-pointer">{r.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Дополнительная информация (опционально)</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Опишите подробнее причину жалобы..."
              rows={3}
              maxLength={300}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Flag className="w-4 h-4 mr-2" />
                Отправить жалобу
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
