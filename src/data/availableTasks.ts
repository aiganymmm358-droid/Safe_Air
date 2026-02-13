// Каталог всех доступных заданий
export interface AvailableTask {
  task_id: string;
  task_name: string;
  task_description: string;
  xp_reward: number;
  coin_reward: number;
  category: 'daily' | 'eco' | 'social' | 'learning' | 'health';
  icon: string;
  verification_type: 'manual' | 'auto_map' | 'auto_health' | 'auto_share' | 'auto_community';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const AVAILABLE_TASKS: AvailableTask[] = [
  // Daily tasks (basic)
  {
    task_id: 'check_aqi',
    task_name: 'Проверить качество воздуха',
    task_description: 'Откройте карту и проверьте текущий AQI в вашем районе',
    xp_reward: 10,
    coin_reward: 5,
    category: 'daily',
    icon: '🌍',
    verification_type: 'auto_map',
    difficulty: 'easy',
  },
  {
    task_id: 'view_recommendations',
    task_name: 'Прочитать рекомендации',
    task_description: 'Посетите страницу здоровья и просмотрите рекомендации',
    xp_reward: 15,
    coin_reward: 8,
    category: 'health',
    icon: '💊',
    verification_type: 'auto_health',
    difficulty: 'easy',
  },
  {
    task_id: 'share_data',
    task_name: 'Поделиться данными',
    task_description: 'Расскажите друзьям о качестве воздуха',
    xp_reward: 25,
    coin_reward: 15,
    category: 'social',
    icon: '📤',
    verification_type: 'auto_share',
    difficulty: 'medium',
  },
  
  // Eco tasks
  {
    task_id: 'use_public_transport',
    task_name: 'Использовать общественный транспорт',
    task_description: 'Воспользуйтесь автобусом или метро вместо автомобиля',
    xp_reward: 30,
    coin_reward: 20,
    category: 'eco',
    icon: '🚌',
    verification_type: 'manual',
    difficulty: 'medium',
  },
  {
    task_id: 'walk_instead_drive',
    task_name: 'Пройтись пешком',
    task_description: 'Пройдите минимум 2 км пешком вместо поездки на машине',
    xp_reward: 35,
    coin_reward: 25,
    category: 'eco',
    icon: '🚶',
    verification_type: 'manual',
    difficulty: 'medium',
  },
  {
    task_id: 'reduce_energy',
    task_name: 'Экономить электричество',
    task_description: 'Выключите ненужное освещение и приборы на 2 часа',
    xp_reward: 20,
    coin_reward: 12,
    category: 'eco',
    icon: '💡',
    verification_type: 'manual',
    difficulty: 'easy',
  },
  {
    task_id: 'plant_care',
    task_name: 'Ухаживать за растениями',
    task_description: 'Полейте домашние растения или посадите новое',
    xp_reward: 25,
    coin_reward: 15,
    category: 'eco',
    icon: '🌱',
    verification_type: 'manual',
    difficulty: 'easy',
  },
  
  // Social tasks
  {
    task_id: 'invite_friend',
    task_name: 'Пригласить друга',
    task_description: 'Пригласите друга присоединиться к SafeAir Pro',
    xp_reward: 50,
    coin_reward: 30,
    category: 'social',
    icon: '👥',
    verification_type: 'manual',
    difficulty: 'medium',
  },
  {
    task_id: 'report_pollution',
    task_name: 'Сообщить о загрязнении',
    task_description: 'Сообщите о замеченном источнике загрязнения воздуха',
    xp_reward: 50,
    coin_reward: 35,
    category: 'social',
    icon: '📢',
    verification_type: 'manual',
    difficulty: 'hard',
  },
  {
    task_id: 'community_discussion',
    task_name: 'Участвовать в обсуждении',
    task_description: 'Примите участие в обсуждении в сообществе',
    xp_reward: 20,
    coin_reward: 10,
    category: 'social',
    icon: '💬',
    verification_type: 'auto_community',
    difficulty: 'easy',
  },
  
  // Learning tasks
  {
    task_id: 'learn_pm25',
    task_name: 'Узнать о PM2.5',
    task_description: 'Изучите, что такое частицы PM2.5 и как они влияют на здоровье',
    xp_reward: 20,
    coin_reward: 10,
    category: 'learning',
    icon: '📖',
    verification_type: 'manual',
    difficulty: 'easy',
  },
  {
    task_id: 'learn_sources',
    task_name: 'Изучить источники загрязнения',
    task_description: 'Узнайте об основных источниках загрязнения воздуха в городе',
    xp_reward: 25,
    coin_reward: 15,
    category: 'learning',
    icon: '🏭',
    verification_type: 'manual',
    difficulty: 'medium',
  },
  {
    task_id: 'learn_protection',
    task_name: 'Методы защиты',
    task_description: 'Изучите способы защиты от загрязнённого воздуха',
    xp_reward: 30,
    coin_reward: 18,
    category: 'learning',
    icon: '🛡️',
    verification_type: 'manual',
    difficulty: 'medium',
  },
  
  // Health tasks
  {
    task_id: 'ventilate_home',
    task_name: 'Проветрить помещение',
    task_description: 'Проветрите дом когда AQI в норме (< 50)',
    xp_reward: 15,
    coin_reward: 8,
    category: 'health',
    icon: '🪟',
    verification_type: 'manual',
    difficulty: 'easy',
  },
  {
    task_id: 'wear_mask',
    task_name: 'Носить маску',
    task_description: 'Используйте защитную маску при высоком AQI',
    xp_reward: 20,
    coin_reward: 12,
    category: 'health',
    icon: '😷',
    verification_type: 'manual',
    difficulty: 'easy',
  },
  {
    task_id: 'morning_exercise',
    task_name: 'Утренняя зарядка',
    task_description: 'Выполните зарядку в чистое время суток',
    xp_reward: 25,
    coin_reward: 15,
    category: 'health',
    icon: '🏃',
    verification_type: 'manual',
    difficulty: 'medium',
  },
];

export const TASK_CATEGORIES = {
  daily: { name: 'Ежедневные', icon: '📅', color: 'bg-primary' },
  eco: { name: 'Эко-действия', icon: '🌿', color: 'bg-aqi-good' },
  social: { name: 'Социальные', icon: '👥', color: 'bg-secondary' },
  learning: { name: 'Обучение', icon: '📚', color: 'bg-accent' },
  health: { name: 'Здоровье', icon: '❤️', color: 'bg-destructive' },
};

export const DIFFICULTY_LABELS = {
  easy: { name: 'Легко', color: 'text-aqi-good' },
  medium: { name: 'Средне', color: 'text-accent' },
  hard: { name: 'Сложно', color: 'text-destructive' },
};
