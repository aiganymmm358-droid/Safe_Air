export const getAQIColor = (aqi: number): string => {
  // NOTE: Hex colors are temporary; we can later map these to theme tokens.
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};

export const getAQILabel = (aqi: number): string => {
  if (aqi <= 50) return "Отлично";
  if (aqi <= 100) return "Умеренно";
  if (aqi <= 150) return "Нездорово для чувствительных";
  if (aqi <= 200) return "Нездорово";
  if (aqi <= 300) return "Очень нездорово";
  return "Опасно";
};
