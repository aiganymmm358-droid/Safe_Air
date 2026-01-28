import type { TranslationKeys } from './en';

export const ru: TranslationKeys = {
  // Common
  common: {
    loading: "Загрузка...",
    error: "Ошибка",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Редактировать",
    create: "Создать",
    search: "Поиск",
    filter: "Фильтр",
    showMore: "Показать ещё",
    hide: "Скрыть",
    back: "Назад",
    next: "Далее",
    submit: "Отправить",
    confirm: "Подтвердить",
    close: "Закрыть",
    yes: "Да",
    no: "Нет",
    or: "или",
    and: "и",
    guest: "Гость",
    user: "Пользователь",
    administrator: "Администратор",
    moderator: "Модератор",
  },

  // App branding
  app: {
    name: "SafeAir Pro",
    tagline: "Чистый воздух Казахстана",
    breatheFree: "Дыши свободно",
    yourContribution: "Ваш вклад",
    prevented: "предотвращено",
  },

  // Navigation
  nav: {
    aqiMap: "Карта AQI",
    myProgress: "Мой прогресс",
    health: "Здоровье",
    community: "Сообщество",
    districtBattle: "Битва районов",
    quickActions: "Быстрые действия",
    navigation: "Навигация",
  },

  // Header / Layout
  header: {
    welcome: "Добро пожаловать,",
    notifications: "Уведомления",
    settings: "Настройки",
  },

  // Auth
  auth: {
    login: "Войти",
    register: "Регистрация",
    logout: "Выйти",
    logoutAll: "Выйти со всех устройств",
    logoutAllConfirm: "Выйти со всех устройств?",
    logoutAllDescription: "Это действие завершит все активные сессии на всех устройствах, включая текущее. Вам потребуется войти заново.",
    profile: "Профиль",
    email: "Email",
    password: "Пароль",
    forgotPassword: "Забыли пароль?",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    loginToTrack: "Войдите для отслеживания прогресса",
    loginPrompt: "Зарегистрируйтесь или войдите, чтобы сохранять достижения, получать награды и соревноваться с другими",
  },

  // Map Page
  map: {
    title: "Карта качества воздуха",
    updated: "Обновлено",
    stations: "станций",
    loading: "Загрузка данных о качестве воздуха...",
    noData: "Нет данных",
    yourLocation: "Ваше местоположение",
    aqiNow: "AQI сейчас",
  },

  // Health Page
  health: {
    title: "Здоровье и рекомендации",
    personalizedTips: "Персонализированные советы для вашего здоровья",
    personalizedFor: "Персонализированные советы для",
    temperature: "Температура",
    humidity: "Влажность",
    bestTimeForWalk: "Лучшее время для прогулки",
    anyTime: "Любое время",
    morning: "Утро (6-9)",
    earlyMorning: "Раннее утро",
    notRecommended: "Не рекомендуется",
    todayConditions: "Условия сегодня",
    uvIndex: "UV-индекс",
    uvLow: "Низкий",
    uvMedium: "Средний",
    uvHigh: "Высокий",
    uvVeryHigh: "Очень высокий",
    wind: "Ветер",
    airQuality: "Качество воздуха",
    protectionMethods: "Способы защиты",
    maskN95: "Маска N95/FFP2",
    maskDescription: "Фильтрует 95% частиц PM2.5",
    airPurifier: "Очиститель воздуха",
    airPurifierDescription: "HEPA-фильтр для дома",
    housePlants: "Комнатные растения",
    housePlantsDescription: "Хлорофитум, спатифиллум",
    moderatePollution: "Умеренное загрязнение воздуха",
    moderateAdvice: "Чувствительным группам рекомендуется сократить активность на улице",
    unhealthyAir: "Качество воздуха неудовлетворительное",
    unhealthyAdvice: "Рекомендуем ограничить пребывание на улице и использовать маску",
  },

  // Community Page
  community: {
    title: "Сообщество",
    together: "Вместе за чистый воздух",
    createPost: "Создать пост",
    activeMembers: "Активных участников",
    treesPlanted: "Деревьев посажено",
    reportsThisWeek: "Репортов за неделю",
    co2Prevented: "CO₂ предотвращено",
    topContributors: "Топ участников недели",
    you: "Вы",
    activeChallenges: "Активные челленджи",
    days: "дней",
    participants: "участников",
    discussions: "Обсуждения",
    generalChat: "Общий чат",
    industrialEmissions: "Промышленные выбросы",
    vehicles: "Автотранспорт",
    messages: "сообщений",
    weekWithoutCar: "Неделя без авто",
    plant5Trees: "Посади 5 деревьев",
  },

  // Progress Page
  progress: {
    title: "Мой прогресс",
    trackAchievements: "Отслеживайте свои достижения и развивайтесь",
    daysInRow: "дней подряд",
    day: "день",
    myAchievements: "Мои достижения",
    recentActivity: "Недавняя активность",
    completeTasksForAchievements: "Выполняйте задания, чтобы получить достижения!",
    startTasksToTrack: "Начните выполнять задания для отслеживания активности",
    totalXP: "Всего XP",
    totalCoins: "Всего монет",
    achievements: "Достижений",
    level: "Уровень",
    ecoDefender: "Эко-Защитник",
    yourProgress: "Ваш прогресс",
  },

  // Districts Page
  districts: {
    title: "Битва районов",
    competeForTitle: "Соревнуйтесь за звание самого эко-района",
    untilEnd: "До конца",
    days: "дней",
    season: "Сезон",
    winterCleanness: "Зимняя чистота",
    mainPrize: "Главный приз: 50,000 Eco-Coins для всех жителей района-победителя",
    participates: "Участвует",
    districtsCount: "районов",
    yourDistrict: "Ваш район",
    position: "Позиция",
    totalScore: "Общий балл",
    yourContribution: "Ваш вклад",
    treesPlanted: "Деревьев посажено",
    reportsSent: "Репортов отправлено",
    submitActivity: "Отправить активность",
    leaveBattle: "Покинуть битву",
    joinUs: "Присоединяйтесь!",
    selectYourDistrict: "Выберите свой район и начните зарабатывать очки для него",
    selectDistrict: "Выбрать район",
    loginToJoin: "Войдите для участия",
    howToEarn: "Как заработать очки",
    plantTree: "Посадить дерево",
    areaCleanup: "Уборка территории",
    sendReport: "Отправить репорт",
    recycling: "Сдача вторсырья",
    carFreeDay: "День без авто",
    takeEcoLesson: "Пройти эко-урок",
    yourActivities: "Ваши активности",
    previousWinners: "Прошлые победители",
    fall: "Осень",
    summer: "Лето",
    spring: "Весна",
    points: "очков",
  },

  // Actions Page
  actions: {
    title: "Быстрые действия",
    contributeToCleanAir: "Внесите свой вклад в чистый воздух города",
    report: "Сообщить",
    aboutViolation: "О нарушении",
    route: "Маршрут",
    safePath: "Безопасный путь",
    education: "Обучение",
    ecoLessons: "Эко-уроки",
    plant: "Посадить",
    signUp: "Записаться",
    arScanner: "AR Сканер",
    airAnalysis: "Анализ воздуха",
    mapAction: "Карта",
    allSources: "Все источники",
    
    // Report section
    reportViolation: "Сообщить о нарушении",
    helpIdentifySources: "Помогите выявить источники загрязнения",
    violationTypes: "Типы нарушений",
    industrialEmissions: "Промышленные выбросы",
    smokingVehicle: "Дымящий транспорт",
    burningTrash: "Сжигание мусора",
    constructionDust: "Строительная пыль",
    createReport: "Создать репорт",
    
    // Safe route
    safeRoute: "Безопасный маршрут",
    findPathMinPollution: "Найдите путь с минимальным загрязнением",
    algorithmConsiders: "Алгоритм учитывает текущие данные о качестве воздуха и предлагает маршрут через парковые зоны.",
    buildRoute: "Построить маршрут",
    
    // Eco education
    ecoEducation: "Эко-обучение",
    learnMoreAboutAir: "Узнайте больше о качестве воздуха",
    whatIsPM25: "Что такое PM2.5?",
    pollutionSources: "Источники загрязнения",
    howToProtect: "Как защитить себя",
    startLearning: "Начать обучение",
    
    // Tree planting
    plantTree: "Посадить дерево",
    signUpForAction: "Запишитесь на ближайшую акцию",
    greenCityAction: "Акция «Зелёный город»",
    participantsSignedUp: "участника записались",
    signUpForEvent: "Записаться на акцию",
    
    // Emergency contacts
    emergencyContacts: "Экстренные контакты",
    ecologicalInspection: "Экологическая инспекция",
    emergencyServices: "МЧС Казахстан",
    mayorHotline: "Горячая линия Акимата",
  },

  // Quick Action Dialogs
  dialogs: {
    // Safe Route
    safeRouteTitle: "Безопасный маршрут",
    safeRouteDescription: "Найдите путь с минимальным уровнем загрязнения воздуха",
    from: "Откуда",
    to: "Куда",
    addressOrCoords: "Адрес или координаты",
    destinationAddress: "Адрес назначения",
    currentLocationSet: "Текущее местоположение установлено",
    specifyStartPoint: "Укажите начальную точку",
    specifyEndPoint: "Укажите конечную точку",
    calculatingRoute: "Расчет маршрута...",
    buildRoute: "Построить маршрут",
    recommendedRoute: "Рекомендуемый маршрут",
    cleanAir: "Чистый воздух",
    moderatePollution: "Умеренное загрязнение",
    highPollution: "Высокое загрязнение",
    routeThrough: "Маршрут через",
    routeDisclaimer: "Маршрут рассчитан на основе текущих данных о качестве воздуха. Условия могут измениться.",
    
    // Tree Planting
    plantTreeTitle: "Посадить дерево",
    plantTreeDescription: "Запишитесь на ближайшие акции по озеленению города",
    spotsAvailable: "мест свободно",
    noSpotsLeft: "Мест нет",
    spotsRemaining: "мест осталось",
    signedUp: "Вы записаны на эту акцию",
    registering: "Запись...",
    tipAfterEvent: "Совет: После участия в акции не забудьте отправить фотоотчёт в сообщество, чтобы получить полную награду XP и вдохновить других!",
    
    // Report Violation
    reportTitle: "Сообщить о нарушении",
    reportDescription: "Помогите нам выявить источники загрязнения",
    violationType: "Тип нарушения",
    selectType: "Выберите тип",
    addPhoto: "Добавить фото (опционально)",
    photoEvidence: "Фото доказательство",
    takePhoto: "Сделать фото",
    description: "Описание",
    describeViolation: "Опишите, что вы видите",
    location: "Местоположение",
    useCurrentLocation: "Использовать текущее местоположение",
    detectingLocation: "Определение местоположения...",
    locationDetected: "Местоположение определено",
    sending: "Отправка...",
    sendReport: "Отправить репорт",
    
    // AR Scanner
    arScannerTitle: "AR Сканер воздуха",
    arScannerDescription: "Наведите камеру на окружение для анализа качества воздуха",
    analyzing: "Анализ изображения...",
    takePhotoToAnalyze: "Сделайте фото вашего окружения",
    analysisComplete: "Анализ завершён",
    
    // Eco Lessons
    ecoLessonsTitle: "Эко-уроки",
    ecoLessonsDescription: "Узнайте о качестве воздуха и как защитить себя",
    completed: "Пройден",
    startLesson: "Начать урок",
    completeLesson: "Завершить урок",
    lessonCompleted: "Урок завершён!",
  },

  // Gamification
  gamification: {
    level: "Уровень",
    xp: "XP",
    coins: "Монеты",
    streak: "Серия",
    badge: "Значок",
    reward: "Награда",
    challenge: "Челлендж",
    achievement: "Достижение",
    leaderboard: "Рейтинг",
  },

  // Daily Tasks
  tasks: {
    dailyTasks: "Ежедневные задания",
    addTask: "Добавить задание",
    noTasks: "Нет заданий на сегодня",
    taskCompleted: "Задание выполнено!",
    completed: "выполнено",
    available: "Доступные задания",
    yourTasks: "Ваши задания на сегодня",
  },

  // Toast Messages
  toast: {
    success: "Успешно",
    error: "Ошибка",
    warning: "Предупреждение",
    info: "Информация",
    saved: "Сохранено успешно",
    deleted: "Удалено успешно",
    loginRequired: "Пожалуйста, войдите",
    reportSent: "Репорт отправлен успешно",
    signedUpForEvent: "Вы записаны на акцию!",
    errorSigningUp: "Не удалось записаться",
    signOutSuccess: "Вы успешно вышли",
    signOutError: "Ошибка при выходе",
    postCreated: "Пост создан",
    postDeleted: "Пост удалён",
    postReported: "Пост отправлен на модерацию",
  },

  // AQI Levels
  aqi: {
    good: "Хороший",
    moderate: "Умеренный",
    unhealthy: "Вреден для чувствительных групп",
    unhealthyAll: "Вреден для всех",
    veryUnhealthy: "Очень вреден",
    hazardous: "Опасный",
  },

  // Time
  time: {
    justNow: "Только что",
    minutesAgo: "минут назад",
    hoursAgo: "часов назад",
    daysAgo: "дней назад",
    today: "Сегодня",
    yesterday: "Вчера",
  },

  // Social Feed
  feed: {
    newPost: "Новый пост",
    like: "Нравится",
    comment: "Комментарий",
    share: "Поделиться",
    report: "Пожаловаться",
    delete: "Удалить",
    edit: "Редактировать",
    verified: "Подтверждён",
    pinned: "Закреплён",
  },

  // District Battle Component
  districtBattle: {
    ranking: "Рейтинг",
    points: "очков",
    members: "участников",
    rank: "Место",
  },

  // Location Widget
  location: {
    detectingLocation: "Определение местоположения...",
    locationError: "Ошибка местоположения",
    enableLocation: "Включить геолокацию",
  },
};
