import { Heart, MessageCircle, Share2, CheckCircle, TreePine, Bike, Recycle, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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
  const { posts, isLoading, likePost, refreshPosts } = useCommunityPosts();

  // Expose refresh function
  if (onRefreshNeeded) {
    // This will be called by parent when needed
  }

  const handleLike = (postId: string) => {
    if (!user) return;
    likePost(postId);
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
            
            return (
              <div
                key={post.id}
                className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
              >
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
                  <div className={`w-8 h-8 rounded-lg ${getActionColor(post.post_type)} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm mb-3">{post.content}</p>

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
    </div>
  );
};
