import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Gift, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface District {
  id: string;
  name: string;
  total_score: number;
  trees_planted: number;
  reports_sent: number;
  participants_count: number;
  current_rank: number;
}

interface DistrictBattleProps {
  districts: District[];
  userDistrictId?: string;
  isLoading?: boolean;
  initialVisibleCount?: number;
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900";
    case 2: return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700";
    case 3: return "bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100";
    default: return "bg-muted text-muted-foreground";
  }
};

const getChangeIcon = (rank: number, prevRank?: number) => {
  if (!prevRank) return <Minus className="w-4 h-4 text-muted-foreground" />;
  if (rank < prevRank) return <TrendingUp className="w-4 h-4 text-aqi-good" />;
  if (rank > prevRank) return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export const DistrictBattle = ({ districts, userDistrictId, isLoading, initialVisibleCount = 10 }: DistrictBattleProps) => {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  
  const visibleDistricts = showAll ? districts : districts.slice(0, initialVisibleCount);
  const hasMore = districts.length > initialVisibleCount;

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 shadow-elevated animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-elevated animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          {t.districtBattle.ranking}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gift className="w-4 h-4" />
          {t.districtBattle.prize}: 50,000 Eco-Coins
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {visibleDistricts.map((district) => (
          <div
            key={district.id}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-muted/50 ${
              district.current_rank === 1 ? "bg-accent/10 border border-accent/20" : ""
            } ${userDistrictId === district.id ? "ring-2 ring-primary" : ""}`}
          >
            {/* Rank */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(district.current_rank)}`}>
              {district.current_rank <= 3 ? (
                <Medal className="w-4 h-4" />
              ) : (
                district.current_rank
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{district.name}</span>
                {userDistrictId === district.id && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {t.districtBattle.yourDistrict}
                  </span>
                )}
                {getChangeIcon(district.current_rank)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {district.participants_count}
                </span>
                <span>🌳 {district.trees_planted}</span>
                <span>📢 {district.reports_sent}</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="font-display font-bold text-lg">{district.total_score.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t.districtBattle.points}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {hasMore && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              {t.districtBattle.hide} ({districts.length - initialVisibleCount})
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              {t.districtBattle.showMore} ({districts.length - initialVisibleCount})
            </>
          )}
        </Button>
      )}
    </div>
  );
};
