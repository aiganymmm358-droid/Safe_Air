import { Clock, CheckCircle, XCircle, TreeDeciduous, Bike, BookOpen, Recycle, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface Activity {
  id: string;
  activity_type: string;
  description: string | null;
  photo_url: string | null;
  points_awarded: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

interface UserActivitiesListProps {
  activities: Activity[];
}

const activityIcons: Record<string, any> = {
  tree_planted: TreeDeciduous,
  report_sent: AlertTriangle,
  car_free_day: Bike,
  eco_lesson: BookOpen,
  cleanup: Trash2,
  recycling: Recycle,
};

export function UserActivitiesList({ activities }: UserActivitiesListProps) {
  const { t, language } = useLanguage();

  const activityLabels: Record<string, string> = {
    tree_planted: t.districts.plantTree,
    report_sent: t.districts.sendReport,
    car_free_day: t.districts.carFreeDay,
    eco_lesson: t.districts.takeEcoLesson,
    cleanup: t.districts.areaCleanup,
    recycling: t.districts.recycling,
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      label: language === 'en' ? 'Pending' : language === 'kz' ? 'Күтуде' : 'На проверке',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    verified: {
      icon: CheckCircle,
      label: language === 'en' ? 'Verified' : language === 'kz' ? 'Расталды' : 'Подтверждено',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    rejected: {
      icon: XCircle,
      label: language === 'en' ? 'Rejected' : language === 'kz' ? 'Қабылданбады' : 'Отклонено',
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    }
  };

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'kz': return kk;
      default: return ru;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{language === 'en' ? 'You have no activities yet' : language === 'kz' ? 'Сізде әлі белсенділік жоқ' : 'У вас пока нет активностей'}</p>
        <p className="text-sm mt-1">{language === 'en' ? 'Submit your first activity to join the battle!' : language === 'kz' ? 'Жарысқа қатысу үшін алғашқы белсенділікті жіберіңіз!' : 'Отправьте первую активность для участия в битве!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.activity_type] || AlertTriangle;
        const status = statusConfig[activity.verification_status];
        const StatusIcon = status.icon;

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            {/* Activity icon */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {activityLabels[activity.activity_type] || activity.activity_type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              {activity.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {activity.description}
                </p>
              )}

              {activity.rejection_reason && (
                <p className="text-sm text-red-500 mt-1">
                  {language === 'en' ? 'Reason' : language === 'kz' ? 'Себебі' : 'Причина'}: {activity.rejection_reason}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: getDateLocale()
                  })}
                </span>
                {activity.photo_url && <span>📷 {language === 'en' ? 'Photo' : language === 'kz' ? 'Фото' : 'Фото'}</span>}
              </div>
            </div>

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <p className={`font-bold ${
                activity.verification_status === 'verified' 
                  ? 'text-aqi-good' 
                  : 'text-muted-foreground'
              }`}>
                {activity.verification_status === 'verified' ? '+' : ''}
                {activity.points_awarded}
              </p>
              <p className="text-xs text-muted-foreground">{t.districtBattle.points}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
