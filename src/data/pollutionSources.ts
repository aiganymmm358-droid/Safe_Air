// Pollution sources data for Almaty with categories and harmfulness levels

export type PollutionCategory = 'industrial' | 'power' | 'transport' | 'construction' | 'heating';

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
};

export const categoryIcons: Record<PollutionCategory, string> = {
  industrial: '🏭',
  power: '⚡',
  transport: '🚗',
  construction: '🏗️',
  heating: '🔥',
};

// Almaty pollution sources data
export const pollutionSources: PollutionSource[] = [
  // Power plants (ТЭЦ)
  {
    id: 'tec-1',
    name: 'ТЭЦ-1',
    category: 'power',
    harmLevel: 'critical',
    lat: 43.2350,
    lng: 76.8950,
    description: 'Теплоэлектроцентраль, крупный источник выбросов SO₂ и NOₓ',
    emissions: 'SO₂, NOₓ, PM2.5',
  },
  {
    id: 'tec-2',
    name: 'ТЭЦ-2',
    category: 'power',
    harmLevel: 'critical',
    lat: 43.3120,
    lng: 76.9280,
    description: 'Теплоэлектроцентраль, использует уголь',
    emissions: 'SO₂, NOₓ, PM10, CO',
  },
  {
    id: 'tec-3',
    name: 'ТЭЦ-3',
    category: 'power',
    harmLevel: 'high',
    lat: 43.2680,
    lng: 77.0150,
    description: 'Теплоэлектроцентраль на газе',
    emissions: 'NOₓ, CO₂',
  },

  // Industrial facilities
  {
    id: 'ind-1',
    name: 'Алматинский завод тяжелого машиностроения',
    category: 'industrial',
    harmLevel: 'high',
    lat: 43.2890,
    lng: 76.9420,
    description: 'Металлообработка и производство оборудования',
    emissions: 'PM10, VOC, металлы',
  },
  {
    id: 'ind-2',
    name: 'Химико-фармацевтический завод',
    category: 'industrial',
    harmLevel: 'medium',
    lat: 43.2450,
    lng: 76.9680,
    description: 'Производство фармацевтической продукции',
    emissions: 'VOC, химикаты',
  },
  {
    id: 'ind-3',
    name: 'Асфальтобетонный завод',
    category: 'industrial',
    harmLevel: 'high',
    lat: 43.3350,
    lng: 76.8750,
    description: 'Производство асфальта',
    emissions: 'PM2.5, VOC, битумные пары',
  },
  {
    id: 'ind-4',
    name: 'Цементный завод',
    category: 'industrial',
    harmLevel: 'critical',
    lat: 43.1980,
    lng: 76.8420,
    description: 'Производство цемента и бетона',
    emissions: 'PM10, PM2.5, CO₂',
  },

  // Transport hubs
  {
    id: 'trans-1',
    name: 'Проспект Аль-Фараби (пробки)',
    category: 'transport',
    harmLevel: 'high',
    lat: 43.2180,
    lng: 76.9280,
    description: 'Главная магистраль с интенсивным движением',
    emissions: 'NOₓ, CO, PM2.5',
  },
  {
    id: 'trans-2',
    name: 'Проспект Райымбека',
    category: 'transport',
    harmLevel: 'high',
    lat: 43.2620,
    lng: 76.9450,
    description: 'Загруженная транспортная артерия',
    emissions: 'NOₓ, CO, PM2.5',
  },
  {
    id: 'trans-3',
    name: 'Автовокзал Сайран',
    category: 'transport',
    harmLevel: 'medium',
    lat: 43.2350,
    lng: 76.8980,
    description: 'Автобусный терминал',
    emissions: 'NOₓ, PM10, дизельные выхлопы',
  },
  {
    id: 'trans-4',
    name: 'ЖД Вокзал Алматы-1',
    category: 'transport',
    harmLevel: 'medium',
    lat: 43.2540,
    lng: 76.9150,
    description: 'Железнодорожный узел',
    emissions: 'PM10, дизель',
  },

  // Construction sites
  {
    id: 'const-1',
    name: 'Стройка ЖК "Нурлы Тау"',
    category: 'construction',
    harmLevel: 'medium',
    lat: 43.2280,
    lng: 76.9580,
    description: 'Крупная строительная площадка',
    emissions: 'PM10, пыль, шум',
  },
  {
    id: 'const-2',
    name: 'Реконструкция проспекта Назарбаева',
    category: 'construction',
    harmLevel: 'low',
    lat: 43.2420,
    lng: 76.9450,
    description: 'Дорожные работы',
    emissions: 'PM10, пыль',
  },

  // Heating (private sector)
  {
    id: 'heat-1',
    name: 'Частный сектор Медеу',
    category: 'heating',
    harmLevel: 'high',
    lat: 43.1650,
    lng: 77.0580,
    description: 'Частные дома с угольным отоплением',
    emissions: 'PM2.5, CO, сажа',
  },
  {
    id: 'heat-2',
    name: 'Частный сектор Турксиб',
    category: 'heating',
    harmLevel: 'high',
    lat: 43.3150,
    lng: 76.8920,
    description: 'Район с печным отоплением',
    emissions: 'PM2.5, CO, сажа',
  },
  {
    id: 'heat-3',
    name: 'Микрорайон Шанырак',
    category: 'heating',
    harmLevel: 'critical',
    lat: 43.1850,
    lng: 76.8350,
    description: 'Плотная застройка с угольным отоплением',
    emissions: 'PM2.5, SO₂, CO',
  },
];
