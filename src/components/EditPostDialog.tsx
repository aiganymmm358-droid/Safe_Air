import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    content: string;
    impact_description: string | null;
  };
  onPostUpdated: () => void;
}

export function EditPostDialog({ open, onOpenChange, post, onPostUpdated }: EditPostDialogProps) {
  const [content, setContent] = useState(post.content);
  const [impactDescription, setImpactDescription] = useState(post.impact_description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите текст сообщения",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, moderate the content
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const moderationResponse = await supabase.functions.invoke('moderate-content', {
        body: { 
          content: content.trim(),
          postId: post.id,
          action: 'check'
        }
      });

      if (moderationResponse.error) {
        throw new Error(moderationResponse.error.message);
      }

      const moderationResult = moderationResponse.data;

      if (!moderationResult.approved) {
        let message = moderationResult.reason || 'Контент не прошел модерацию';
        if (moderationResult.actionTaken === 'warning') {
          message += '\n\nВам вынесено предупреждение.';
        } else if (moderationResult.actionTaken === 'ban') {
          message += `\n\nВы заблокированы до ${new Date(moderationResult.banUntil).toLocaleDateString('ru-RU')}.`;
        }

        toast({
          title: "Контент отклонен",
          description: message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Update the post
      const { error } = await supabase
        .from('community_posts')
        .update({
          content: content.trim(),
          impact_description: impactDescription.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Пост обновлен"
      });

      onPostUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пост",
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
          <DialogTitle>Редактировать пост</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Текст сообщения</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Опишите ваше эко-действие..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact">Эко-эффект (опционально)</Label>
            <Input
              id="impact"
              value={impactDescription}
              onChange={(e) => setImpactDescription(e.target.value)}
              placeholder="Например: -12 кг CO₂"
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
