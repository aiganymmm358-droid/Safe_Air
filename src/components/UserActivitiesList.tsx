import { Clock, CheckCircle, XCircle, TreeDeciduous, Bike, BookOpen, Recycle, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

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

const activityLabels: Record<string, string> = {
  tree_planted: 'Посадка дерева',
  report_sent: 'Репорт о нарушении',
  car_free_day: 'День без авто',
  eco_lesson: 'Эко-урок',
  cleanup: 'Уборка территории',
  recycling: 'Сдача вторсырья',
};

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'На проверке',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  verified: {
    icon: CheckCircle,
    label: 'Подтверждено',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  rejected: {
    icon: XCircle,
    label: 'Отклонено',
    color: 'text-red-500',
    bg: 'bg-red-500/10'
  }
};

export function UserActivitiesList({ activities }: UserActivitiesListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>У вас пока нет активностей</p>
        <p className="text-sm mt-1">Отправьте первую активность для участия в битве!</p>
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
                  Причина: {activity.rejection_reason}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: ru
                  })}
                </span>
                {activity.photo_url && <span>📷 Фото</span>}
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
              <p className="text-xs text-muted-foreground">очков</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
