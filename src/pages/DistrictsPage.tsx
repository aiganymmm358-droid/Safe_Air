import { useState } from 'react';
import { DistrictBattle } from "@/components/DistrictBattle";
import { JoinDistrictDialog } from "@/components/JoinDistrictDialog";
import { SubmitActivityDialog } from "@/components/SubmitActivityDialog";
import { UserActivitiesList } from "@/components/UserActivitiesList";
import { useDistrictBattle } from "@/hooks/useDistrictBattle";
import { Swords, Map, Trophy, Calendar, TrendingUp, Plus, LogOut, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";

const DistrictsPage = () => {
  const { isAuthenticated } = useAuthContext();
  const {
    districts,
    userParticipation,
    userActivities,
    isLoading,
    isJoining,
    isSubmitting,
    joinDistrict,
    leaveDistrict,
    submitActivity
  } = useDistrictBattle();

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const userDistrict = userParticipation?.district;
  const userDistrictRank = districts.find(d => d.id === userParticipation?.district_id)?.current_rank;

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
            <p className="text-2xl font-bold">{districts.length} районов</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Battle Panel */}
        <div className="lg:col-span-2">
          <DistrictBattle 
            districts={districts} 
            userDistrictId={userParticipation?.district_id}
            isLoading={isLoading}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your District Stats / Join Panel */}
          {userParticipation && userDistrict ? (
            <div className="glass-card rounded-2xl p-6 border-2 border-primary/30">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Map className="w-5 h-5 text-primary" />
                Ваш район: {userDistrict.name}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Позиция</span>
                  <span className="font-bold text-xl text-primary">
                    #{userDistrictRank} {userDistrictRank === 1 && '🏆'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Общий балл</span>
                  <span className="font-bold">{userDistrict.total_score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ваш вклад</span>
                  <span className="font-bold text-accent">+{userParticipation.total_contribution}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Деревьев посажено</span>
                  <span className="font-bold">{userDistrict.trees_planted} 🌳</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Репортов отправлено</span>
                  <span className="font-bold">{userDistrict.reports_sent} 📢</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => setSubmitDialogOpen(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить активность
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive"
                  onClick={leaveDistrict}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Покинуть битву
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 border-2 border-dashed border-primary/30">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Map className="w-5 h-5 text-primary" />
                Присоединяйтесь!
              </h3>
              <p className="text-muted-foreground mb-4">
                Выберите свой район и начните зарабатывать очки для него
              </p>
              <Button 
                className="w-full" 
                onClick={() => setJoinDialogOpen(true)}
                disabled={!isAuthenticated}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isAuthenticated ? 'Выбрать район' : 'Войдите для участия'}
              </Button>
            </div>
          )}

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
                <span className="text-lg">🧹</span>
                <div className="flex-1">
                  <p className="text-sm">Уборка территории</p>
                </div>
                <span className="font-bold text-aqi-good">+75</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📢</span>
                <div className="flex-1">
                  <p className="text-sm">Отправить репорт</p>
                </div>
                <span className="font-bold text-aqi-good">+50</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">♻️</span>
                <div className="flex-1">
                  <p className="text-sm">Сдача вторсырья</p>
                </div>
                <span className="font-bold text-aqi-good">+30</span>
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

          {/* User Activities */}
          {userParticipation && userActivities.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-accent" />
                Ваши активности
              </h3>
              <UserActivitiesList activities={userActivities} />
            </div>
          )}

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

      {/* Dialogs */}
      <JoinDistrictDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        districts={districts}
        onJoin={joinDistrict}
        isJoining={isJoining}
      />

      <SubmitActivityDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSubmit={submitActivity}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DistrictsPage;
