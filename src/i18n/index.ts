import { en } from './locales/en';
import { ru } from './locales/ru';
import { kz } from './locales/kz';

export type Language = 'en' | 'ru' | 'kz';

export const languages: Record<Language, { name: string; code: string }> = {
  en: { name: 'English', code: 'EN' },
  ru: { name: 'Русский', code: 'RU' },
  kz: { name: 'Қазақша', code: 'KZ' },
};

export const translations = {
  en,
  ru,
  kz,
} as const;

export type TranslationKeys = typeof en;

export { en, ru, kz };
