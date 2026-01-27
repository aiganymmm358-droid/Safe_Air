import { useState } from "react";
import { SocialFeed } from "@/components/SocialFeed";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Users, TrendingUp, Award, MessageCircle, Plus } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CommunityPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { refreshPosts } = useCommunityPosts();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setCreateDialogOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-secondary" />
            Сообщество
          </h1>
          <p className="text-muted-foreground mt-1">Вместе за чистый воздух</p>
        </div>
        <Button onClick={handleCreatePost} className="gap-2">
          <Plus className="w-4 h-4" />
          Создать пост
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">12,450</p>
          <p className="text-sm text-muted-foreground">Активных участников</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-secondary">3,280</p>
          <p className="text-sm text-muted-foreground">Деревьев посажено</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-accent">856</p>
          <p className="text-sm text-muted-foreground">Репортов за неделю</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-aqi-good">45.2 т</p>
          <p className="text-sm text-muted-foreground">CO₂ предотвращено</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <SocialFeed />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-accent" />
              Топ участников недели
            </h3>
            <div className="space-y-3">
              {[
                { name: "Арман К.", avatar: "👨‍💼", score: 1250, badge: "🥇" },
                { name: "Айгерим Н.", avatar: "👩", score: 980, badge: "🥈" },
                { name: "Данияр М.", avatar: "👨", score: 875, badge: "🥉" },
                { name: "Сауле Т.", avatar: "👩‍🦰", score: 720, badge: "" },
                { name: "Вы", avatar: "😊", score: 650, badge: "⭐" },
              ].map((user, index) => (
                <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${user.name === "Вы" ? "bg-primary/10" : ""}`}>
                  <span className="text-lg font-bold text-muted-foreground w-5">{index + 1}</span>
                  <span className="text-2xl">{user.avatar}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name} {user.badge}</p>
                  </div>
                  <span className="font-bold text-sm text-primary">{user.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Challenges */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              Активные челленджи
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">🚴 Неделя без авто</span>
                  <span className="text-xs text-primary">4 дня</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%]" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">342 участника</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">🌳 Посади 5 деревьев</span>
                  <span className="text-xs text-secondary">12 дней</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[30%]" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">128 участников</p>
              </div>
            </div>
          </div>

          {/* Discussion Groups */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-secondary" />
              Обсуждения
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <p className="font-medium text-sm">💬 Общий чат</p>
                <p className="text-xs text-muted-foreground">1,234 сообщения</p>
              </button>
              <button className="w-full text-left p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <p className="font-medium text-sm">🏭 Промышленные выбросы</p>
                <p className="text-xs text-muted-foreground">456 сообщений</p>
              </button>
              <button className="w-full text-left p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <p className="font-medium text-sm">🚗 Автотранспорт</p>
                <p className="text-xs text-muted-foreground">289 сообщений</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onPostCreated={refreshPosts}
      />
    </div>
  );
};

export default CommunityPage;
