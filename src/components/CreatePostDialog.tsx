import { useState, useRef } from 'react';
import { TreePine, Bike, Recycle, AlertCircle, Send, Loader2, MessageSquare, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const POST_TYPES = [
  { id: 'general', label: 'Общий', icon: MessageSquare, color: 'bg-muted text-foreground' },
  { id: 'tree', label: 'Озеленение', icon: TreePine, color: 'bg-aqi-good text-primary-foreground' },
  { id: 'transport', label: 'Транспорт', icon: Bike, color: 'bg-secondary text-secondary-foreground' },
  { id: 'recycle', label: 'Переработка', icon: Recycle, color: 'bg-primary text-primary-foreground' },
  { id: 'report', label: 'Репорт', icon: AlertCircle, color: 'bg-accent text-accent-foreground' },
] as const;

type PostType = typeof POST_TYPES[number]['id'];

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { user } = useAuthContext();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('general');
  const [impactDescription, setImpactDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер изображения не должен превышать 5 МБ');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) {
        // If bucket doesn't exist, just return null (image optional)
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Войдите в систему для создания поста');
      return;
    }

    if (!content.trim()) {
      toast.error('Напишите что-нибудь');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('Пост должен содержать минимум 10 символов');
      return;
    }

    setIsSubmitting(true);
    try {
      // First, moderate the content with AI
      const moderationResponse = await supabase.functions.invoke('moderate-content', {
        body: { 
          content: content.trim(),
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
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      // Upload image if present
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Content approved, create the post
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        content: content.trim(),
        post_type: postType,
        impact_description: impactDescription.trim() || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast.success('Пост опубликован! 🎉');
      setContent('');
      setPostType('general');
      setImpactDescription('');
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
      onPostCreated();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Не удалось опубликовать пост');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = POST_TYPES.find(t => t.id === postType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Создать пост
          </DialogTitle>
          <DialogDescription>
            Поделитесь своими эко-действиями с сообществом
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Post type selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Тип поста</label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = postType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? type.color
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">Описание</label>
            <Textarea
              placeholder="Расскажите о своём эко-действии..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {content.length}/500
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Фото <span className="text-muted-foreground">(опционально)</span>
            </label>
            
            {imagePreview ? (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-40 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="post-image-input"
                />
                <label
                  htmlFor="post-image-input"
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <Image className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Нажмите для загрузки фото (макс. 5 МБ)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Impact description (optional) */}
          {postType !== 'general' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Экологический эффект <span className="text-muted-foreground">(опционально)</span>
              </label>
              <Input
                placeholder="Например: -12 кг CO₂, 5 деревьев посажено"
                value={impactDescription}
                onChange={(e) => setImpactDescription(e.target.value)}
                maxLength={100}
              />
            </div>
          )}

          {/* Preview */}
          {content.trim() && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Предпросмотр:</p>
              <div className="flex items-start gap-3">
                {selectedType && (
                  <div className={`w-8 h-8 rounded-lg ${selectedType.color} flex items-center justify-center flex-shrink-0`}>
                    <selectedType.icon className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{content}</p>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-24 rounded-lg object-cover mt-2"
                    />
                  )}
                  {impactDescription && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium mt-2">
                      ✨ {impactDescription}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Публикация...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Опубликовать
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
