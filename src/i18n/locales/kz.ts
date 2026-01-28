import type { TranslationKeys } from './en';

export const kz: TranslationKeys = {
  // Common
  common: {
    loading: "Жүктелуде...",
    error: "Қате",
    save: "Сақтау",
    cancel: "Болдырмау",
    delete: "Жою",
    edit: "Өңдеу",
    create: "Құру",
    search: "Іздеу",
    filter: "Сүзгі",
    showMore: "Көбірек көрсету",
    hide: "Жасыру",
    back: "Артқа",
    next: "Келесі",
    submit: "Жіберу",
    confirm: "Растау",
    close: "Жабу",
    yes: "Иә",
    no: "Жоқ",
    or: "немесе",
    and: "және",
    guest: "Қонақ",
    user: "Қолданушы",
    administrator: "Әкімші",
    moderator: "Модератор",
  },

  // App branding
  app: {
    name: "SafeAir Pro",
    tagline: "Қазақстанның таза ауасы",
    breatheFree: "Еркін тыныс ал",
    yourContribution: "Сіздің үлесіңіз",
    prevented: "алдын алынды",
  },

  // Navigation
  nav: {
    aqiMap: "AQI картасы",
    myProgress: "Менің прогресім",
    health: "Денсаулық",
    community: "Қоғамдастық",
    districtBattle: "Аудандар жарысы",
    quickActions: "Жылдам әрекеттер",
    navigation: "Навигация",
  },

  // Header / Layout
  header: {
    welcome: "Қош келдіңіз,",
    notifications: "Хабарландырулар",
    settings: "Параметрлер",
  },

  // Auth
  auth: {
    login: "Кіру",
    register: "Тіркелу",
    logout: "Шығу",
    logoutAll: "Барлық құрылғылардан шығу",
    logoutAllConfirm: "Барлық құрылғылардан шығу керек пе?",
    logoutAllDescription: "Бұл әрекет барлық құрылғылардағы белсенді сеанстарды аяқтайды, соның ішінде ағымдағы. Сізге қайта кіру қажет болады.",
    profile: "Профиль",
    email: "Email",
    password: "Құпия сөз",
    forgotPassword: "Құпия сөзді ұмыттыңыз ба?",
    noAccount: "Аккаунтыңыз жоқ па?",
    hasAccount: "Аккаунтыңыз бар ма?",
    loginToTrack: "Прогресті бақылау үшін кіріңіз",
    loginPrompt: "Жетістіктерді сақтау, сыйақылар алу және басқалармен жарысу үшін тіркеліңіз немесе кіріңіз",
  },

  // Map Page
  map: {
    title: "Ауа сапасы картасы",
    updated: "Жаңартылды",
    stations: "станция",
    loading: "Ауа сапасы деректері жүктелуде...",
    noData: "Деректер жоқ",
    yourLocation: "Сіздің орналасқан жеріңіз",
    aqiNow: "Қазіргі AQI",
  },

  // Health Page
  health: {
    title: "Денсаулық және кеңестер",
    personalizedTips: "Сіздің денсаулығыңыз үшін жеке кеңестер",
    personalizedFor: "үшін жеке кеңестер",
    temperature: "Температура",
    humidity: "Ылғалдылық",
    bestTimeForWalk: "Серуенге ең жақсы уақыт",
    anyTime: "Кез келген уақыт",
    morning: "Таң (6-9)",
    earlyMorning: "Ерте таң",
    notRecommended: "Ұсынылмайды",
    todayConditions: "Бүгінгі жағдайлар",
    uvIndex: "UV индексі",
    uvLow: "Төмен",
    uvMedium: "Орташа",
    uvHigh: "Жоғары",
    uvVeryHigh: "Өте жоғары",
    wind: "Жел",
    airQuality: "Ауа сапасы",
    protectionMethods: "Қорғану әдістері",
    maskN95: "N95/FFP2 маскасы",
    maskDescription: "PM2.5 бөлшектерінің 95% сүзеді",
    airPurifier: "Ауа тазартқыш",
    airPurifierDescription: "Үй үшін HEPA сүзгі",
    housePlants: "Бөлме өсімдіктері",
    housePlantsDescription: "Хлорофитум, спатифиллум",
    moderatePollution: "Орташа ауа ластануы",
    moderateAdvice: "Сезімтал топтарға көшеде белсенділікті азайту ұсынылады",
    unhealthyAir: "Ауа сапасы қанағаттанарлықсыз",
    unhealthyAdvice: "Көшеде болу уақытын шектеуді және маска кіюді ұсынамыз",
  },

  // Community Page
  community: {
    title: "Қоғамдастық",
    together: "Таза ауа үшін бірге",
    createPost: "Пост жасау",
    activeMembers: "Белсенді мүшелер",
    treesPlanted: "Отырғызылған ағаштар",
    reportsThisWeek: "Осы аптадағы репорттар",
    co2Prevented: "CO₂ алдын алынды",
    topContributors: "Аптаның үздік қатысушылары",
    you: "Сіз",
    activeChallenges: "Белсенді челленджтер",
    days: "күн",
    participants: "қатысушы",
    discussions: "Талқылаулар",
    generalChat: "Жалпы чат",
    industrialEmissions: "Өнеркәсіптік шығарындылар",
    vehicles: "Автокөлік",
    messages: "хабарлама",
    weekWithoutCar: "Көліксіз апта",
    plant5Trees: "5 ағаш отырғыз",
  },

  // Progress Page
  progress: {
    title: "Менің прогресім",
    trackAchievements: "Жетістіктеріңізді бақылаңыз және дамыңыз",
    daysInRow: "күн қатарынан",
    day: "күн",
    myAchievements: "Менің жетістіктерім",
    recentActivity: "Соңғы белсенділік",
    completeTasksForAchievements: "Жетістіктер алу үшін тапсырмаларды орындаңыз!",
    startTasksToTrack: "Белсенділікті бақылау үшін тапсырмаларды орындауды бастаңыз",
    totalXP: "Барлық XP",
    totalCoins: "Барлық монеталар",
    achievements: "Жетістіктер",
    level: "Деңгей",
    ecoDefender: "Эко-Қорғаушы",
    yourProgress: "Сіздің прогресіңіз",
  },

  // Districts Page
  districts: {
    title: "Аудандар жарысы",
    competeForTitle: "Ең эко-аудан атағы үшін жарысыңыз",
    untilEnd: "Аяғына дейін",
    days: "күн",
    season: "Маусым",
    winterCleanness: "Қысқы тазалық",
    mainPrize: "Бас жүлде: Жеңімпаз аудан тұрғындарына 50,000 Eco-Coins",
    participates: "Қатысады",
    districtsCount: "аудан",
    yourDistrict: "Сіздің аудан",
    position: "Орын",
    totalScore: "Жалпы ұпай",
    yourContribution: "Сіздің үлесіңіз",
    treesPlanted: "Отырғызылған ағаштар",
    reportsSent: "Жіберілген репорттар",
    submitActivity: "Белсенділік жіберу",
    leaveBattle: "Жарыстан шығу",
    joinUs: "Қосылыңыз!",
    selectYourDistrict: "Аудандарыңызды таңдап, ол үшін ұпай жинауды бастаңыз",
    selectDistrict: "Ауданды таңдау",
    loginToJoin: "Қатысу үшін кіріңіз",
    howToEarn: "Ұпай қалай жинауға болады",
    plantTree: "Ағаш отырғызу",
    areaCleanup: "Аумақты тазалау",
    sendReport: "Репорт жіберу",
    recycling: "Қайта өңдеу",
    carFreeDay: "Көліксіз күн",
    takeEcoLesson: "Эко-сабақ өту",
    yourActivities: "Сіздің белсенділіктеріңіз",
    previousWinners: "Бұрынғы жеңімпаздар",
    fall: "Күз",
    summer: "Жаз",
    spring: "Көктем",
    points: "ұпай",
  },

  // Actions Page
  actions: {
    title: "Жылдам әрекеттер",
    contributeToCleanAir: "Қаланың таза ауасына үлес қосыңыз",
    report: "Хабарлау",
    aboutViolation: "Бұзушылық туралы",
    route: "Маршрут",
    safePath: "Қауіпсіз жол",
    education: "Білім",
    ecoLessons: "Эко-сабақтар",
    plant: "Отырғызу",
    signUp: "Жазылу",
    arScanner: "AR Сканер",
    airAnalysis: "Ауа талдауы",
    mapAction: "Карта",
    allSources: "Барлық көздер",
    
    // Report section
    reportViolation: "Бұзушылық туралы хабарлау",
    helpIdentifySources: "Ластану көздерін анықтауға көмектесіңіз",
    violationTypes: "Бұзушылық түрлері",
    industrialEmissions: "Өнеркәсіптік шығарындылар",
    smokingVehicle: "Түтін шығаратын көлік",
    burningTrash: "Қоқыс жағу",
    constructionDust: "Құрылыс шаңы",
    createReport: "Репорт жасау",
    
    // Safe route
    safeRoute: "Қауіпсіз маршрут",
    findPathMinPollution: "Ең аз ластанумен жол табыңыз",
    algorithmConsiders: "Алгоритм ауа сапасының ағымдағы деректерін ескереді және саябақ аймақтары арқылы маршрут ұсынады.",
    buildRoute: "Маршрут құру",
    
    // Eco education
    ecoEducation: "Эко-білім",
    learnMoreAboutAir: "Ауа сапасы туралы көбірек біліңіз",
    whatIsPM25: "PM2.5 дегеніміз не?",
    pollutionSources: "Ластану көздері",
    howToProtect: "Өзіңізді қалай қорғауға болады",
    startLearning: "Оқуды бастау",
    
    // Tree planting
    plantTree: "Ағаш отырғызу",
    signUpForAction: "Жақын акцияға жазылыңыз",
    greenCityAction: "«Жасыл қала» акциясы",
    participantsSignedUp: "қатысушы жазылды",
    signUpForEvent: "Акцияға жазылу",
    
    // Emergency contacts
    emergencyContacts: "Шұғыл байланыстар",
    ecologicalInspection: "Экологиялық инспекция",
    emergencyServices: "ҚР ТЖМ",
    mayorHotline: "Әкімдіктің ыстық желісі",
  },

  // Quick Action Dialogs
  dialogs: {
    // Safe Route
    safeRouteTitle: "Қауіпсіз маршрут",
    safeRouteDescription: "Ең аз ауа ластану деңгейімен жол табыңыз",
    from: "Қайдан",
    to: "Қайда",
    addressOrCoords: "Мекенжай немесе координаталар",
    destinationAddress: "Баратын мекенжай",
    currentLocationSet: "Ағымдағы орналасқан жер орнатылды",
    specifyStartPoint: "Бастапқы нүктені көрсетіңіз",
    specifyEndPoint: "Соңғы нүктені көрсетіңіз",
    calculatingRoute: "Маршрут есептелуде...",
    buildRoute: "Маршрут құру",
    recommendedRoute: "Ұсынылған маршрут",
    cleanAir: "Таза ауа",
    moderatePollution: "Орташа ластану",
    highPollution: "Жоғары ластану",
    routeThrough: "Маршрут арқылы",
    routeDisclaimer: "Маршрут ауа сапасының ағымдағы деректері негізінде есептелген. Жағдайлар өзгеруі мүмкін.",
    
    // Tree Planting
    plantTreeTitle: "Ағаш отырғызу",
    plantTreeDescription: "Қаланы көгалдандыру акцияларына жазылыңыз",
    spotsAvailable: "орын бос",
    noSpotsLeft: "Орын жоқ",
    spotsRemaining: "орын қалды",
    signedUp: "Сіз бұл акцияға жазылдыңыз",
    registering: "Жазылу...",
    tipAfterEvent: "Кеңес: Акцияға қатысқаннан кейін толық XP сыйақысын алу және басқаларды шабыттандыру үшін фотоесепті қоғамдастыққа жіберуді ұмытпаңыз!",
    
    // Report Violation
    reportTitle: "Бұзушылық туралы хабарлау",
    reportDescription: "Ластану көздерін анықтауға көмектесіңіз",
    violationType: "Бұзушылық түрі",
    selectType: "Түрді таңдаңыз",
    addPhoto: "Фото қосу (міндетті емес)",
    photoEvidence: "Фото дәлел",
    takePhoto: "Фото түсіру",
    description: "Сипаттама",
    describeViolation: "Не көргеніңізді сипаттаңыз",
    location: "Орналасқан жері",
    useCurrentLocation: "Ағымдағы орналасқан жерді пайдалану",
    detectingLocation: "Орналасқан жер анықталуда...",
    locationDetected: "Орналасқан жер анықталды",
    sending: "Жіберілуде...",
    sendReport: "Репорт жіберу",
    
    // AR Scanner
    arScannerTitle: "AR Ауа сканері",
    arScannerDescription: "Ауа сапасын талдау үшін камераны айналаға бағыттаңыз",
    analyzing: "Сурет талдануда...",
    takePhotoToAnalyze: "Айналаңыздың фотосын түсіріңіз",
    analysisComplete: "Талдау аяқталды",
    
    // Eco Lessons
    ecoLessonsTitle: "Эко-сабақтар",
    ecoLessonsDescription: "Ауа сапасы және өзіңізді қалай қорғау туралы біліңіз",
    completed: "Аяқталды",
    startLesson: "Сабақты бастау",
    completeLesson: "Сабақты аяқтау",
    lessonCompleted: "Сабақ аяқталды!",
  },

  // Gamification
  gamification: {
    level: "Деңгей",
    xp: "XP",
    coins: "Монеталар",
    streak: "Серия",
    badge: "Белгі",
    reward: "Сыйақы",
    challenge: "Челлендж",
    achievement: "Жетістік",
    leaderboard: "Рейтинг",
  },

  // Daily Tasks
  tasks: {
    dailyTasks: "Күнделікті тапсырмалар",
    addTask: "Тапсырма қосу",
    noTasks: "Бүгінге тапсырма жоқ",
    taskCompleted: "Тапсырма орындалды!",
    completed: "орындалды",
    available: "Қолжетімді тапсырмалар",
    yourTasks: "Бүгінге тапсырмаларыңыз",
  },

  // Toast Messages
  toast: {
    success: "Сәтті",
    error: "Қате",
    warning: "Ескерту",
    info: "Ақпарат",
    saved: "Сәтті сақталды",
    deleted: "Сәтті жойылды",
    loginRequired: "Кіруіңізді сұраймыз",
    reportSent: "Репорт сәтті жіберілді",
    signedUpForEvent: "Сіз акцияға жазылдыңыз!",
    errorSigningUp: "Жазылу сәтсіз аяқталды",
    signOutSuccess: "Сіз сәтті шықтыңыз",
    signOutError: "Шығу кезінде қате",
    postCreated: "Пост жасалды",
    postDeleted: "Пост жойылды",
    postReported: "Пост модерацияға жіберілді",
  },

  // AQI Levels
  aqi: {
    good: "Жақсы",
    moderate: "Орташа",
    unhealthy: "Сезімтал топтар үшін зиянды",
    unhealthyAll: "Барлығы үшін зиянды",
    veryUnhealthy: "Өте зиянды",
    hazardous: "Қауіпті",
  },

  // Time
  time: {
    justNow: "Жаңа ғана",
    minutesAgo: "минут бұрын",
    hoursAgo: "сағат бұрын",
    daysAgo: "күн бұрын",
    today: "Бүгін",
    yesterday: "Кеше",
  },

  // Social Feed
  feed: {
    newPost: "Жаңа пост",
    like: "Ұнату",
    comment: "Пікір",
    share: "Бөлісу",
    report: "Шағымдану",
    delete: "Жою",
    edit: "Өңдеу",
    verified: "Расталған",
    pinned: "Бекітілген",
  },

  // District Battle Component
  districtBattle: {
    ranking: "Рейтинг",
    points: "ұпай",
    members: "мүше",
    rank: "Орын",
  },

  // Location Widget
  location: {
    detectingLocation: "Орналасқан жер анықталуда...",
    locationError: "Орналасқан жер қатесі",
    enableLocation: "Геолокацияны қосу",
  },
};
