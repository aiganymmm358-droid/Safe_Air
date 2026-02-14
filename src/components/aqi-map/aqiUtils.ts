import { useLanguage } from '@/contexts/LanguageContext';

export const getAQIColor = (aqi: number): string => {
  // NOTE: Hex colors are temporary; we can later map these to theme tokens.
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};

export const getAQILabel = (aqi: number, language: 'en' | 'ru' | 'kz' = 'ru'): string => {
  const labels = {
    en: {
      excellent: "Excellent",
      moderate: "Moderate",
      sensitiveUnhealthy: "Unhealthy for Sensitive Groups",
      unhealthy: "Unhealthy",
      veryUnhealthy: "Very Unhealthy",
      hazardous: "Hazardous",
    },
    ru: {
      excellent: "Отлично",
      moderate: "Умеренно",
      sensitiveUnhealthy: "Нездорово для чувствительных",
      unhealthy: "Нездорово",
      veryUnhealthy: "Очень нездорово",
      hazardous: "Опасно",
    },
    kz: {
      excellent: "Өте жақсы",
      moderate: "Орташа",
      sensitiveUnhealthy: "Сезімталдар үшін зиянды",
      unhealthy: "Зиянды",
      veryUnhealthy: "Өте зиянды",
      hazardous: "Қауіпті",
    },
  };

  const l = labels[language];

  if (aqi <= 50) return l.excellent;
  if (aqi <= 100) return l.moderate;
  if (aqi <= 150) return l.sensitiveUnhealthy;
  if (aqi <= 200) return l.unhealthy;
  if (aqi <= 300) return l.veryUnhealthy;
  return l.hazardous;
};
