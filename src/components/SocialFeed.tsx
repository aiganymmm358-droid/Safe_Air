import { useState } from "react";
import { Heart, MessageCircle, Share2, CheckCircle, TreePine, Bike, Recycle, AlertCircle, MessageSquare, Loader2, Pencil, Flag, MoreHorizontal, Trash2, Pin, PinOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { EditPostDialog } from "./EditPostDialog";
import { ReportPostDialog } from "./ReportPostDialog";
import { DeletePostDialog } from "./DeletePostDialog";
import { toast } from "@/hooks/use-toast";

interface SocialFeedProps {
  onRefreshNeeded?: () => void;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case "tree": return TreePine;
    case "transport": return Bike;
    case "recycle": return Recycle;
    case "report": return AlertCircle;
    default: return MessageSquare;
  }
};

const getActionColor = (type: string) => {
  switch (type) {
    case "tree": return "bg-aqi-good text-primary-foreground";
    case "transport": return "bg-secondary text-secondary-foreground";
    case "recycle": return "bg-primary text-primary-foreground";
    case "report": return "bg-accent text-accent-foreground";
    default: return "bg-muted text-foreground";
  }
};

export const SocialFeed = ({ onRefreshNeeded }: SocialFeedProps) => {
  const { user } = useAuthContext();
  const { posts, isLoading, likePost, refreshPosts, deletePost, pinPost } = useCommunityPosts();
  const [editingPost, setEditingPost] = useState<{ id: string; content: string; impact_description: string | null } | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [pinningPostId, setPinningPostId] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    if (!user) return;
    likePost(postId);
  };

  const handlePostUpdated = () => {
    refreshPosts();
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return false;
    const success = await deletePost(deletingPostId);
    if (success) {
      toast({ title: "Пост удален", description: "Ваш пост был успешно удален" });
    } else {
      toast({ title: "Ошибка", description: "Не удалось удалить пост", variant: "destructive" });
    }
    return success;
  };

  const handlePinPost = async (postId: string, shouldPin: boolean) => {
    setPinningPostId(postId);
    const success = await pinPost(postId, shouldPin);
    setPinningPostId(null);
    if (success) {
      toast({ 
        title: shouldPin ? "Пост закреплен" : "Пост откреплен", 
        description: shouldPin ? "Пост будет отображаться в начале ленты" : "Пост больше не закреплен" 
      });
    } else {
      toast({ 
        title: "Ошибка", 
        description: shouldPin ? "Не удалось закрепить пост. Возможно, контент не соответствует требованиям." : "Не удалось открепить пост", 
        variant: "destructive" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg">🌍 Эко-сообщество</h3>
        <button 
          onClick={refreshPosts}
          className="text-sm text-primary font-medium hover:underline"
        >
          Обновить
        </button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Пока нет постов</p>
            <p className="text-sm">Будьте первым, кто поделится эко-действием!</p>
          </div>
        ) : (
          posts.map((post) => {
            const Icon = getActionIcon(post.post_type);
            const timeAgo = formatDistanceToNow(new Date(post.created_at), { 
              addSuffix: true, 
              locale: ru 
            });
            const isOwner = user?.id === post.user_id;
            
            return (
              <div
                key={post.id}
                className={`p-4 rounded-xl hover:bg-muted/50 transition-all ${
                  post.is_pinned 
                    ? 'bg-primary/5 border-2 border-primary/20' 
                    : 'bg-muted/30'
                }`}
              >
                {/* Pinned badge */}
                {post.is_pinned && (
                  <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-2">
                    <Pin className="w-3 h-3" />
                    <span>Закреплено</span>
                  </div>
                )}
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.user_avatar || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {post.user_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.user_name}</span>
                        {post.is_verified && (
                          <CheckCircle className="w-4 h-4 text-secondary fill-secondary/20" />
                        )}
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Lv.{post.user_level}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${getActionColor(post.post_type)} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 hover:bg-muted rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isOwner && (
                            <>
                              <DropdownMenuItem onClick={() => setEditingPost({
                                id: post.id,
                                content: post.content,
                                impact_description: post.impact_description
                              })}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingPostId(post.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </>
                          )}
                          {!isOwner && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => setReportingPostId(post.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Пожаловаться
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handlePinPost(post.id, !post.is_pinned)}
                                disabled={pinningPostId === post.id}
                              >
                                {post.is_pinned ? (
                                  <>
                                    <PinOff className="w-4 h-4 mr-2" />
                                    Открепить
                                  </>
                                ) : (
                                  <>
                                    <Pin className="w-4 h-4 mr-2" />
                                    Закрепить
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm mb-3">{post.content}</p>

                {/* Post image */}
                {post.image_url && (
                  <div className="mb-3">
                    <img 
                      src={post.image_url} 
                      alt="Post image" 
                      className="rounded-lg max-h-64 w-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Impact badge */}
                {post.impact_description && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                    ✨ {post.impact_description}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 text-muted-foreground">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.is_liked ? 'text-destructive' : 'hover:text-destructive'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Post Dialog */}
      {editingPost && (
        <EditPostDialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          post={editingPost}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* Report Post Dialog */}
      {reportingPostId && (
        <ReportPostDialog
          open={!!reportingPostId}
          onOpenChange={(open) => !open && setReportingPostId(null)}
          postId={reportingPostId}
          onReported={handlePostUpdated}
        />
      )}

      {/* Delete Post Dialog */}
      <DeletePostDialog
        open={!!deletingPostId}
        onOpenChange={(open) => !open && setDeletingPostId(null)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
};
