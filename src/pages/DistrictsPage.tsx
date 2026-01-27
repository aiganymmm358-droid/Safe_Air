import { DistrictBattle } from "@/components/DistrictBattle";
import { Swords, Map, Trophy, Calendar, TrendingUp } from "lucide-react";

const DistrictsPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Swords className="w-8 h-8 text-accent" />
            Битва районов
          </h1>
          <p className="text-muted-foreground mt-1">Соревнуйтесь за звание самого эко-района</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-xl">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">До конца: 18 дней</span>
        </div>
      </div>

      {/* Current Season Banner */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold">🏆 Сезон «Зимняя чистота»</h2>
            <p className="text-muted-foreground mt-1">Главный приз: 50,000 Eco-Coins для всех жителей района-победителя</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Участвует</p>
            <p className="text-2xl font-bold">8 районов</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Battle Panel */}
        <div className="lg:col-span-2">
          <DistrictBattle />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your District Stats */}
          <div className="glass-card rounded-2xl p-6 border-2 border-primary/30">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-primary" />
              Ваш район: Бостандыкский
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Позиция</span>
                <span className="font-bold text-xl text-primary">#1 🏆</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Общий балл</span>
                <span className="font-bold">12,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ваш вклад</span>
                <span className="font-bold text-accent">+650</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Деревьев посажено</span>
                <span className="font-bold">234 🌳</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Репортов отправлено</span>
                <span className="font-bold">89 📢</span>
              </div>
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Как заработать очки
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🌳</span>
                <div className="flex-1">
                  <p className="text-sm">Посадить дерево</p>
                </div>
                <span className="font-bold text-aqi-good">+100</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📢</span>
                <div className="flex-1">
                  <p className="text-sm">Отправить репорт</p>
                </div>
                <span className="font-bold text-aqi-good">+50</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🚴</span>
                <div className="flex-1">
                  <p className="text-sm">День без авто</p>
                </div>
                <span className="font-bold text-aqi-good">+25</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📚</span>
                <div className="flex-1">
                  <p className="text-sm">Пройти эко-урок</p>
                </div>
                <span className="font-bold text-aqi-good">+20</span>
              </div>
            </div>
          </div>

          {/* Previous Winners */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-accent" />
              Прошлые победители
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg">
                <span className="text-lg">🥇</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Медеуский</p>
                  <p className="text-xs text-muted-foreground">Осень 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <span className="text-lg">🥇</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Бостандыкский</p>
                  <p className="text-xs text-muted-foreground">Лето 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <span className="text-lg">🥇</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Алмалинский</p>
                  <p className="text-xs text-muted-foreground">Весна 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictsPage;
