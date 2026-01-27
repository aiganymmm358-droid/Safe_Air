import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Gift } from "lucide-react";

interface District {
  id: number;
  name: string;
  score: number;
  change: "up" | "down" | "same";
  trees: number;
  reports: number;
  rank: number;
}

const districts: District[] = [
  { id: 1, name: "Бостандыкский", score: 12450, change: "up", trees: 234, reports: 89, rank: 1 },
  { id: 2, name: "Медеуский", score: 11230, change: "up", trees: 198, reports: 76, rank: 2 },
  { id: 3, name: "Алмалинский", score: 10890, change: "down", trees: 167, reports: 92, rank: 3 },
  { id: 4, name: "Наурызбайский", score: 9870, change: "same", trees: 145, reports: 54, rank: 4 },
  { id: 5, name: "Ауэзовский", score: 9540, change: "up", trees: 189, reports: 67, rank: 5 },
];

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900";
    case 2: return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700";
    case 3: return "bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100";
    default: return "bg-muted text-muted-foreground";
  }
};

const getChangeIcon = (change: District["change"]) => {
  switch (change) {
    case "up": return <TrendingUp className="w-4 h-4 text-aqi-good" />;
    case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
    case "same": return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

export const DistrictBattle = () => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Битва районов
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gift className="w-4 h-4" />
          Приз: 50,000 Eco-Coins
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {districts.map((district) => (
          <div
            key={district.id}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-muted/50 ${
              district.rank === 1 ? "bg-accent/10 border border-accent/20" : ""
            }`}
          >
            {/* Rank */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(district.rank)}`}>
              {district.rank <= 3 ? (
                <Medal className="w-4 h-4" />
              ) : (
                district.rank
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{district.name}</span>
                {getChangeIcon(district.change)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>🌳 {district.trees} деревьев</span>
                <span>📢 {district.reports} репортов</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="font-display font-bold text-lg">{district.score.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">очков</p>
            </div>
          </div>
        ))}
      </div>

      {/* Your district */}
      <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ваш район</p>
            <p className="font-semibold text-primary">Бостандыкский — #1 🏆</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Участвовать
          </button>
        </div>
      </div>
    </div>
  );
};
