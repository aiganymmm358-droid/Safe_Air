// Pollution sources data for Kazakhstan with categories and harmfulness levels

export type PollutionCategory = 'industrial' | 'power' | 'transport' | 'construction' | 'heating' | 'oil_gas' | 'mining';

export type HarmLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PollutionSource {
  id: string;
  name: string;
  category: PollutionCategory;
  harmLevel: HarmLevel;
  lat: number;
  lng: number;
  description: string;
  emissions?: string;
  city?: string;
}

// Color mapping for harm levels (matches AQI color scheme semantically)
export const harmLevelColors: Record<HarmLevel, string> = {
  low: 'hsl(152, 80%, 45%)',       // Green - minimal impact
  medium: 'hsl(48, 95%, 50%)',     // Yellow - moderate impact
  high: 'hsl(28, 95%, 55%)',       // Orange - significant impact
  critical: 'hsl(12, 85%, 55%)',   // Red - severe impact
};

export const harmLevelLabels: Record<HarmLevel, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

export const categoryLabels: Record<PollutionCategory, string> = {
  industrial: 'Промышленность',
  power: 'Энергетика',
  transport: 'Транспорт',
  construction: 'Строительство',
  heating: 'Отопление',
  oil_gas: 'Нефтегаз',
  mining: 'Горнодобыча',
};

export const categoryIcons: Record<PollutionCategory, string> = {
  industrial: '🏭',
  power: '⚡',
  transport: '🚗',
  construction: '🏗️',
  heating: '🔥',
  oil_gas: '🛢️',
  mining: '⛏️',
};

// Kazakhstan pollution sources data
export const pollutionSources: PollutionSource[] = [
  // ==================== АЛМАТЫ ====================
  // Power plants (ТЭЦ)
  {
    id: 'almaty-tec-1',
    name: 'ТЭЦ-1',
    category: 'power',
    harmLevel: 'critical',
    lat: 43.2350,
    lng: 76.8950,
    description: 'Теплоэлектроцентраль, крупный источник выбросов SO₂ и NOₓ',
    emissions: 'SO₂, NOₓ, PM2.5',
    city: 'Алматы',
  },
  {
    id: 'almaty-tec-2',
    name: 'ТЭЦ-2',
    category: 'power',
    harmLevel: 'critical',
    lat: 43.3120,
    lng: 76.9280,
    description: 'Теплоэлектроцентраль, использует уголь',
    emissions: 'SO₂, NOₓ, PM10, CO',
    city: 'Алматы',
  },
  {
    id: 'almaty-tec-3',
    name: 'ТЭЦ-3',
    category: 'power',
    harmLevel: 'high',
    lat: 43.2680,
    lng: 77.0150,
    description: 'Теплоэлектроцентраль на газе',
    emissions: 'NOₓ, CO₂',
    city: 'Алматы',
  },
  // Industrial facilities
  {
    id: 'almaty-ind-1',
    name: 'Алматинский завод тяжелого машиностроения',
    category: 'industrial',
    harmLevel: 'high',
    lat: 43.2890,
    lng: 76.9420,
    description: 'Металлообработка и производство оборудования',
    emissions: 'PM10, VOC, металлы',
    city: 'Алматы',
  },
  {
    id: 'almaty-ind-2',
    name: 'Химико-фармацевтический завод',
    category: 'industrial',
    harmLevel: 'medium',
    lat: 43.2450,
    lng: 76.9680,
    description: 'Производство фармацевтической продукции',
    emissions: 'VOC, химикаты',
    city: 'Алматы',
  },
  {
    id: 'almaty-ind-3',
    name: 'Асфальтобетонный завод',
    category: 'industrial',
    harmLevel: 'high',
    lat: 43.3350,
    lng: 76.8750,
    description: 'Производство асфальта',
    emissions: 'PM2.5, VOC, битумные пары',
    city: 'Алматы',
  },
  {
    id: 'almaty-ind-4',
    name: 'Цементный завод',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 43.1980,
    lng: 76.8420,
    description: 'Производство цемента и бетона',
    emissions: 'PM10, PM2.5, CO₂',
    city: 'Алматы',
  },
  // Transport hubs
  {
    id: 'almaty-trans-1',
    name: 'Проспект Аль-Фараби (пробки)',
    category: 'transport',
    harmLevel: 'high',
    lat: 43.2180,
    lng: 76.9280,
    description: 'Главная магистраль с интенсивным движением',
    emissions: 'NOₓ, CO, PM2.5',
    city: 'Алматы',
  },
  {
    id: 'almaty-trans-2',
    name: 'Проспект Райымбека',
    category: 'transport',
    harmLevel: 'high',
    lat: 43.2620,
    lng: 76.9450,
    description: 'Загруженная транспортная артерия',
    emissions: 'NOₓ, CO, PM2.5',
    city: 'Алматы',
  },
  {
    id: 'almaty-trans-3',
    name: 'Автовокзал Сайран',
    category: 'transport',
    harmLevel: 'medium',
    lat: 43.2350,
    lng: 76.8980,
    description: 'Автобусный терминал',
    emissions: 'NOₓ, PM10, дизельные выхлопы',
    city: 'Алматы',
  },
  // Heating (private sector)
  {
    id: 'almaty-heat-1',
    name: 'Частный сектор Медеу',
    category: 'heating',
    harmLevel: 'high',
    lat: 43.1650,
    lng: 77.0580,
    description: 'Частные дома с угольным отоплением',
    emissions: 'PM2.5, CO, сажа',
    city: 'Алматы',
  },
  {
    id: 'almaty-heat-2',
    name: 'Частный сектор Турксиб',
    category: 'heating',
    harmLevel: 'high',
    lat: 43.3150,
    lng: 76.8920,
    description: 'Район с печным отоплением',
    emissions: 'PM2.5, CO, сажа',
    city: 'Алматы',
  },
  {
    id: 'almaty-heat-3',
    name: 'Микрорайон Шанырак',
    category: 'heating',
    harmLevel: 'critical',
    lat: 43.1850,
    lng: 76.8350,
    description: 'Плотная застройка с угольным отоплением',
    emissions: 'PM2.5, SO₂, CO',
    city: 'Алматы',
  },

  // ==================== АСТАНА (НУР-СУЛТАН) ====================
  {
    id: 'astana-tec-1',
    name: 'ТЭЦ-1 Астана',
    category: 'power',
    harmLevel: 'critical',
    lat: 51.1280,
    lng: 71.4320,
    description: 'Крупнейшая угольная ТЭЦ столицы',
    emissions: 'SO₂, NOₓ, PM10, CO',
    city: 'Астана',
  },
  {
    id: 'astana-tec-2',
    name: 'ТЭЦ-2 Астана',
    category: 'power',
    harmLevel: 'critical',
    lat: 51.1650,
    lng: 71.4780,
    description: 'Теплоэлектроцентраль на угле',
    emissions: 'SO₂, NOₓ, PM2.5',
    city: 'Астана',
  },
  {
    id: 'astana-tec-3',
    name: 'ТЭЦ-3 Астана',
    category: 'power',
    harmLevel: 'high',
    lat: 51.0920,
    lng: 71.5120,
    description: 'Новая ТЭЦ с современными фильтрами',
    emissions: 'NOₓ, CO₂',
    city: 'Астана',
  },
  {
    id: 'astana-trans-1',
    name: 'Проспект Туран',
    category: 'transport',
    harmLevel: 'medium',
    lat: 51.0890,
    lng: 71.4180,
    description: 'Центральная магистраль с интенсивным движением',
    emissions: 'NOₓ, CO, PM2.5',
    city: 'Астана',
  },
  {
    id: 'astana-const-1',
    name: 'Стройка EXPO-район',
    category: 'construction',
    harmLevel: 'medium',
    lat: 51.0920,
    lng: 71.4050,
    description: 'Масштабное строительство',
    emissions: 'PM10, пыль',
    city: 'Астана',
  },

  // ==================== КАРАГАНДА ====================
  {
    id: 'karaganda-tec',
    name: 'ТЭЦ-3 Караганда',
    category: 'power',
    harmLevel: 'critical',
    lat: 49.8350,
    lng: 73.1020,
    description: 'Крупнейшая угольная ТЭЦ региона',
    emissions: 'SO₂, NOₓ, PM10, зола',
    city: 'Караганда',
  },
  {
    id: 'karaganda-arselor',
    name: 'ArcelorMittal Темиртау',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 50.0650,
    lng: 72.9480,
    description: 'Крупнейший металлургический комбинат Казахстана',
    emissions: 'SO₂, NOₓ, PM10, тяжелые металлы, CO',
    city: 'Темиртау',
  },
  {
    id: 'karaganda-coal-1',
    name: 'Шахта Костенко',
    category: 'mining',
    harmLevel: 'high',
    lat: 49.7820,
    lng: 73.0950,
    description: 'Угольная шахта',
    emissions: 'Угольная пыль, метан',
    city: 'Караганда',
  },
  {
    id: 'karaganda-coal-2',
    name: 'Разрез Борлы',
    category: 'mining',
    harmLevel: 'high',
    lat: 49.6580,
    lng: 73.2150,
    description: 'Открытый угольный разрез',
    emissions: 'PM10, угольная пыль',
    city: 'Караганда',
  },

  // ==================== ПАВЛОДАР ====================
  {
    id: 'pavlodar-alum',
    name: 'Павлодарский алюминиевый завод',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 52.2850,
    lng: 76.9680,
    description: 'Производство глинозема и алюминия',
    emissions: 'Фтор, SO₂, красный шлам',
    city: 'Павлодар',
  },
  {
    id: 'pavlodar-oil',
    name: 'Павлодарский НПЗ',
    category: 'oil_gas',
    harmLevel: 'critical',
    lat: 52.3120,
    lng: 76.9350,
    description: 'Нефтеперерабатывающий завод',
    emissions: 'VOC, H₂S, SO₂, бензол',
    city: 'Павлодар',
  },
  {
    id: 'pavlodar-tec',
    name: 'Павлодарская ТЭЦ-1',
    category: 'power',
    harmLevel: 'high',
    lat: 52.2680,
    lng: 76.9520,
    description: 'Теплоэлектроцентраль на угле',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Павлодар',
  },
  {
    id: 'pavlodar-chemical',
    name: 'Химический завод',
    category: 'industrial',
    harmLevel: 'high',
    lat: 52.2950,
    lng: 76.9780,
    description: 'Производство химической продукции',
    emissions: 'Хлор, аммиак, VOC',
    city: 'Павлодар',
  },

  // ==================== УСТЬ-КАМЕНОГОРСК ====================
  {
    id: 'ust-kam-titanium',
    name: 'Усть-Каменогорский титано-магниевый комбинат',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 49.9580,
    lng: 82.6120,
    description: 'Производство титана и магния',
    emissions: 'Хлор, диоксины, тяжелые металлы',
    city: 'Усть-Каменогорск',
  },
  {
    id: 'ust-kam-lead',
    name: 'Свинцово-цинковый комбинат Казцинк',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 49.9450,
    lng: 82.5980,
    description: 'Производство свинца и цинка',
    emissions: 'Свинец, цинк, кадмий, SO₂',
    city: 'Усть-Каменогорск',
  },
  {
    id: 'ust-kam-tec',
    name: 'ТЭЦ Усть-Каменогорск',
    category: 'power',
    harmLevel: 'high',
    lat: 49.9680,
    lng: 82.6350,
    description: 'Угольная теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Усть-Каменогорск',
  },
  {
    id: 'ust-kam-condenser',
    name: 'Конденсаторный завод',
    category: 'industrial',
    harmLevel: 'high',
    lat: 49.9520,
    lng: 82.6280,
    description: 'Электротехническое производство',
    emissions: 'Тяжелые металлы, VOC',
    city: 'Усть-Каменогорск',
  },

  // ==================== ШЫМКЕНТ ====================
  {
    id: 'shymkent-oil',
    name: 'Шымкентский НПЗ (PetroKazakhstan)',
    category: 'oil_gas',
    harmLevel: 'critical',
    lat: 42.3280,
    lng: 69.5650,
    description: 'Нефтеперерабатывающий завод',
    emissions: 'VOC, H₂S, SO₂, бензол',
    city: 'Шымкент',
  },
  {
    id: 'shymkent-tec',
    name: 'ТЭЦ-3 Шымкент',
    category: 'power',
    harmLevel: 'high',
    lat: 42.3450,
    lng: 69.5820,
    description: 'Теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Шымкент',
  },
  {
    id: 'shymkent-lead',
    name: 'Свинцовый завод (ЮКО)',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 42.3150,
    lng: 69.5480,
    description: 'Производство свинца',
    emissions: 'Свинец, SO₂, тяжелые металлы',
    city: 'Шымкент',
  },
  {
    id: 'shymkent-phosphor',
    name: 'Фосфорный завод',
    category: 'industrial',
    harmLevel: 'high',
    lat: 42.3380,
    lng: 69.5380,
    description: 'Производство фосфора и удобрений',
    emissions: 'Фосфор, фтор, SO₂',
    city: 'Шымкент',
  },

  // ==================== АТЫРАУ ====================
  {
    id: 'atyrau-oil',
    name: 'Атырауский НПЗ',
    category: 'oil_gas',
    harmLevel: 'critical',
    lat: 47.1180,
    lng: 51.9150,
    description: 'Крупнейший НПЗ Западного Казахстана',
    emissions: 'VOC, H₂S, SO₂, бензол, толуол',
    city: 'Атырау',
  },
  {
    id: 'atyrau-tengiz',
    name: 'Тенгизшевройл (TCO)',
    category: 'oil_gas',
    harmLevel: 'critical',
    lat: 46.1550,
    lng: 53.4350,
    description: 'Крупнейшее нефтегазовое месторождение',
    emissions: 'H₂S, SO₂, VOC, CO₂',
    city: 'Тенгиз',
  },
  {
    id: 'atyrau-kashagan',
    name: 'Месторождение Кашаган',
    category: 'oil_gas',
    harmLevel: 'critical',
    lat: 46.2380,
    lng: 51.4920,
    description: 'Крупнейшее морское месторождение',
    emissions: 'H₂S, SO₂, меркаптаны',
    city: 'Атырау',
  },
  {
    id: 'atyrau-tec',
    name: 'ТЭЦ Атырау',
    category: 'power',
    harmLevel: 'high',
    lat: 47.0950,
    lng: 51.8780,
    description: 'Теплоэлектроцентраль на газе',
    emissions: 'NOₓ, CO₂',
    city: 'Атырау',
  },

  // ==================== АКТАУ ====================
  {
    id: 'aktau-mangystau',
    name: 'Мангистаумунайгаз',
    category: 'oil_gas',
    harmLevel: 'high',
    lat: 43.6520,
    lng: 51.1580,
    description: 'Нефтедобыча и переработка',
    emissions: 'VOC, H₂S, попутный газ',
    city: 'Актау',
  },
  {
    id: 'aktau-atomic',
    name: 'МАЭК (бывший АЭС)',
    category: 'power',
    harmLevel: 'medium',
    lat: 43.6280,
    lng: 51.2050,
    description: 'Мангистауский атомно-энергетический комбинат',
    emissions: 'Низкоактивные отходы',
    city: 'Актау',
  },
  {
    id: 'aktau-karachaganak',
    name: 'Карачаганак',
    category: 'oil_gas',
    harmLevel: 'critical',
    lat: 50.0780,
    lng: 51.8520,
    description: 'Крупное газоконденсатное месторождение',
    emissions: 'H₂S, SO₂, VOC',
    city: 'Аксай',
  },

  // ==================== АКТОБЕ ====================
  {
    id: 'aktobe-chrome',
    name: 'Донской ГОК',
    category: 'mining',
    harmLevel: 'critical',
    lat: 50.2580,
    lng: 58.0120,
    description: 'Добыча хромовой руды',
    emissions: 'Хром, PM10, шестивалентный хром',
    city: 'Хромтау',
  },
  {
    id: 'aktobe-ferroalloy',
    name: 'Актюбинский завод ферросплавов',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 50.2780,
    lng: 57.2350,
    description: 'Производство ферросплавов',
    emissions: 'Хром, марганец, PM10',
    city: 'Актобе',
  },
  {
    id: 'aktobe-tec',
    name: 'ТЭЦ Актобе',
    category: 'power',
    harmLevel: 'high',
    lat: 50.2850,
    lng: 57.1680,
    description: 'Теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Актобе',
  },

  // ==================== СЕМЕЙ ====================
  {
    id: 'semey-tec',
    name: 'ТЭЦ Семей',
    category: 'power',
    harmLevel: 'high',
    lat: 50.4280,
    lng: 80.2650,
    description: 'Угольная теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Семей',
  },
  {
    id: 'semey-leather',
    name: 'Кожевенный завод',
    category: 'industrial',
    harmLevel: 'medium',
    lat: 50.4150,
    lng: 80.2380,
    description: 'Переработка кожи',
    emissions: 'H₂S, хром, органика',
    city: 'Семей',
  },
  {
    id: 'semey-polygon',
    name: 'Семипалатинский ядерный полигон (закрыт)',
    category: 'industrial',
    harmLevel: 'high',
    lat: 50.4420,
    lng: 79.0580,
    description: 'Закрытый полигон, остаточное загрязнение',
    emissions: 'Радионуклиды',
    city: 'Семей',
  },

  // ==================== КОСТАНАЙ ====================
  {
    id: 'kostanay-ssgpo',
    name: 'ССГПО (Соколовско-Сарбайское ГПО)',
    category: 'mining',
    harmLevel: 'critical',
    lat: 52.8550,
    lng: 63.4280,
    description: 'Крупнейший горно-обогатительный комбинат',
    emissions: 'PM10, железная пыль',
    city: 'Рудный',
  },
  {
    id: 'kostanay-tec',
    name: 'ТЭЦ Костанай',
    category: 'power',
    harmLevel: 'high',
    lat: 53.2150,
    lng: 63.6280,
    description: 'Угольная теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Костанай',
  },

  // ==================== ЖЕЗКАЗГАН ====================
  {
    id: 'zhezkazgan-copper',
    name: 'Жезказганский медеплавильный завод',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 47.7850,
    lng: 67.7120,
    description: 'Выплавка меди',
    emissions: 'SO₂, медь, мышьяк, свинец',
    city: 'Жезказган',
  },
  {
    id: 'zhezkazgan-mining',
    name: 'Казахмыс (рудники)',
    category: 'mining',
    harmLevel: 'high',
    lat: 47.7580,
    lng: 67.6850,
    description: 'Добыча медной руды',
    emissions: 'PM10, тяжелые металлы',
    city: 'Жезказган',
  },

  // ==================== БАЛХАШ ====================
  {
    id: 'balkhash-copper',
    name: 'Балхашский медеплавильный завод',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 46.8450,
    lng: 74.9520,
    description: 'Крупный медеплавильный завод',
    emissions: 'SO₂, медь, мышьяк, PM10',
    city: 'Балхаш',
  },
  {
    id: 'balkhash-tec',
    name: 'Балхашская ТЭЦ',
    category: 'power',
    harmLevel: 'high',
    lat: 46.8280,
    lng: 74.9780,
    description: 'Теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Балхаш',
  },

  // ==================== ТАРАЗ ====================
  {
    id: 'taraz-phosphor',
    name: 'Таразский химический завод',
    category: 'industrial',
    harmLevel: 'high',
    lat: 42.9050,
    lng: 71.3680,
    description: 'Производство фосфорных удобрений',
    emissions: 'Фосфор, фтор, SO₂',
    city: 'Тараз',
  },
  {
    id: 'taraz-tec',
    name: 'ТЭЦ Тараз',
    category: 'power',
    harmLevel: 'high',
    lat: 42.8880,
    lng: 71.3520,
    description: 'Теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Тараз',
  },

  // ==================== ПЕТРОПАВЛОВСК ====================
  {
    id: 'petropavlovsk-tec',
    name: 'ТЭЦ-2 Петропавловск',
    category: 'power',
    harmLevel: 'high',
    lat: 54.8750,
    lng: 69.1520,
    description: 'Угольная теплоэлектроцентраль',
    emissions: 'SO₂, NOₓ, PM10',
    city: 'Петропавловск',
  },

  // ==================== КЫЗЫЛОРДА ====================
  {
    id: 'kyzylorda-oil',
    name: 'ПетроКазахстан Кумколь',
    category: 'oil_gas',
    harmLevel: 'high',
    lat: 44.8580,
    lng: 64.0250,
    description: 'Нефтедобыча',
    emissions: 'VOC, H₂S, попутный газ',
    city: 'Кызылорда',
  },
  {
    id: 'kyzylorda-tec',
    name: 'ТЭЦ Кызылорда',
    category: 'power',
    harmLevel: 'medium',
    lat: 44.8450,
    lng: 65.5020,
    description: 'Теплоэлектроцентраль на газе',
    emissions: 'NOₓ, CO₂',
    city: 'Кызылорда',
  },

  // ==================== ЭКИБАСТУЗ ====================
  {
    id: 'ekibastuz-gres-1',
    name: 'ГРЭС-1 Экибастуз',
    category: 'power',
    harmLevel: 'critical',
    lat: 51.6780,
    lng: 75.3250,
    description: 'Крупнейшая угольная электростанция Казахстана',
    emissions: 'SO₂, NOₓ, PM10, зола',
    city: 'Экибастуз',
  },
  {
    id: 'ekibastuz-gres-2',
    name: 'ГРЭС-2 Экибастуз',
    category: 'power',
    harmLevel: 'critical',
    lat: 51.7120,
    lng: 75.4580,
    description: 'Крупная угольная электростанция',
    emissions: 'SO₂, NOₓ, PM10, зола',
    city: 'Экибастуз',
  },
  {
    id: 'ekibastuz-razrez',
    name: 'Разрез Богатырь',
    category: 'mining',
    harmLevel: 'high',
    lat: 51.7580,
    lng: 75.5120,
    description: 'Крупнейший угольный разрез мира',
    emissions: 'PM10, угольная пыль',
    city: 'Экибастуз',
  },

  // ==================== РИДДЕР ====================
  {
    id: 'ridder-polymetall',
    name: 'Казцинк Риддер',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 50.3450,
    lng: 83.5120,
    description: 'Полиметаллический комбинат',
    emissions: 'Свинец, цинк, кадмий, SO₂',
    city: 'Риддер',
  },

  // ==================== ЗЫРЯНОВСК ====================
  {
    id: 'zyryanovsk-lead',
    name: 'Зыряновский ГОК',
    category: 'mining',
    harmLevel: 'high',
    lat: 49.7420,
    lng: 84.2580,
    description: 'Добыча полиметаллических руд',
    emissions: 'PM10, тяжелые металлы',
    city: 'Алтай',
  },

  // ==================== СТЕПНОГОРСК ====================
  {
    id: 'stepnogorsk-uranium',
    name: 'Степногорский горно-химический комбинат',
    category: 'industrial',
    harmLevel: 'high',
    lat: 52.3520,
    lng: 71.8850,
    description: 'Бывшее урановое производство',
    emissions: 'Радионуклиды, химикаты',
    city: 'Степногорск',
  },
];

// Helper function to get sources by city
export const getSourcesByCity = (city: string): PollutionSource[] => {
  return pollutionSources.filter(source => source.city === city);
};

// Helper function to get all unique cities
export const getAllCities = (): string[] => {
  const cities = new Set(pollutionSources.map(source => source.city).filter(Boolean) as string[]);
  return Array.from(cities).sort();
};

// Helper function to get sources by category
export const getSourcesByCategory = (category: PollutionCategory): PollutionSource[] => {
  return pollutionSources.filter(source => source.category === category);
};

// Helper function to get critical sources
export const getCriticalSources = (): PollutionSource[] => {
  return pollutionSources.filter(source => source.harmLevel === 'critical');
};
