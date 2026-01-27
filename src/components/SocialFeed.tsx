import { Heart, MessageCircle, Share2, CheckCircle, TreePine, Bike, Recycle, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EcoAction {
  id: number;
  user: {
    name: string;
    avatar?: string;
    level: number;
    verified: boolean;
  };
  action: string;
  type: "tree" | "transport" | "recycle" | "report";
  impact: string;
  likes: number;
  comments: number;
  timeAgo: string;
  image?: string;
}

const actions: EcoAction[] = [
  {
    id: 1,
    user: { name: "Айгерим К.", level: 15, verified: true },
    action: "Посадила 3 дерева в парке Первого Президента",
    type: "tree",
    impact: "-12 кг CO₂/год",
    likes: 234,
    comments: 18,
    timeAgo: "2ч назад",
  },
  {
    id: 2,
    user: { name: "Дмитрий Л.", level: 22, verified: true },
    action: "30 дней подряд использую велосипед вместо авто",
    type: "transport",
    impact: "-45 кг CO₂",
    likes: 567,
    comments: 42,
    timeAgo: "5ч назад",
  },
  {
    id: 3,
    user: { name: "Сауле М.", level: 8, verified: false },
    action: "Сдала 15 кг пластика на переработку",
    type: "recycle",
    impact: "-8 кг отходов",
    likes: 89,
    comments: 5,
    timeAgo: "8ч назад",
  },
  {
    id: 4,
    user: { name: "Артем В.", level: 31, verified: true },
    action: "Сообщил о незаконном сжигании мусора. Инспекция выехала!",
    type: "report",
    impact: "Предотвращено загрязнение",
    likes: 892,
    comments: 67,
    timeAgo: "1д назад",
  },
];

const getActionIcon = (type: EcoAction["type"]) => {
  switch (type) {
    case "tree": return TreePine;
    case "transport": return Bike;
    case "recycle": return Recycle;
    case "report": return AlertCircle;
  }
};

const getActionColor = (type: EcoAction["type"]) => {
  switch (type) {
    case "tree": return "bg-aqi-good text-primary-foreground";
    case "transport": return "bg-secondary text-secondary-foreground";
    case "recycle": return "bg-primary text-primary-foreground";
    case "report": return "bg-accent text-accent-foreground";
  }
};

export const SocialFeed = () => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg">🌍 Эко-сообщество</h3>
        <button className="text-sm text-primary font-medium hover:underline">
          Все посты →
        </button>
      </div>

      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = getActionIcon(action.type);
          return (
            <div
              key={action.id}
              className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={action.user.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {action.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{action.user.name}</span>
                      {action.user.verified && (
                        <CheckCircle className="w-4 h-4 text-secondary fill-secondary/20" />
                      )}
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Lv.{action.user.level}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{action.timeAgo}</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-lg ${getActionColor(action.type)} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Content */}
              <p className="text-sm mb-3">{action.action}</p>

              {/* Impact badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                ✨ {action.impact}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 text-muted-foreground">
                <button className="flex items-center gap-1.5 hover:text-destructive transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{action.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{action.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
