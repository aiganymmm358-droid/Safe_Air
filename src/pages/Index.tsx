import { Header } from "@/components/Header";
import { AQIDisplay } from "@/components/AQIDisplay";
import { GamificationPanel } from "@/components/GamificationPanel";
import { PollutionMap } from "@/components/PollutionMap";
import { SocialFeed } from "@/components/SocialFeed";
import { HealthRecommendations } from "@/components/HealthRecommendations";
import { QuickActions } from "@/components/QuickActions";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 
    ? t.index.goodMorning 
    : currentHour < 18 
    ? t.index.goodAfternoon 
    : t.index.goodEvening;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted via-background to-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 px-4">
        <div className="container mx-auto">
          {/* Greeting */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {greeting}, <span className="gradient-text">Алия!</span>
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              {t.index.yourContribution} — 127 {t.index.co2Prevented}
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - AQI & Gamification */}
            <div className="space-y-6">
              <AQIDisplay
                value={78}
                location="Алматы, Бостандыкский район"
                temperature={24}
                humidity={45}
                uvIndex={6}
              />
              <GamificationPanel
                level={15}
                xp={2340}
                xpToNext={3000}
                ecoCoins={1250}
                streakDays={7}
                badges={["🌳", "🚴", "📢", "🏆", "⭐"]}
              />
            </div>

            {/* Center Column - Map & Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <QuickActions />
              <PollutionMap />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Health Recommendations */}
            <div>
              <HealthRecommendations />
            </div>

            {/* Social Feed */}
            <div>
              <SocialFeed />
            </div>

            {/* District Battle - Hidden on Index, use dedicated page */}
            <div className="glass-card rounded-2xl p-6 shadow-elevated">
              <h3 className="font-display font-bold text-lg mb-4">🏆 {t.index.districtBattle}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t.index.districtBattleDesc}
              </p>
              <a 
                href="/districts" 
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                {t.index.goToBattle}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>🌍 SafeAir Pro — {t.index.platform}</p>
          <p className="mt-1">{t.index.togetherForClean}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
