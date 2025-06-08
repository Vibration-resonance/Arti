import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import fr from '../../public/_locales/fr/messages.json';
import en from '../../public/_locales/en/messages.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

const messages: Record<string, Record<string, { message: string }>> = {
  fr: fr as Record<string, { message: string }>,
  en: en as Record<string, { message: string }>,
};

// Initialize language: localStorage > browser > default
const getDefaultLang = () => {
  const saved = localStorage.getItem('arti-ai-detector-language');
  if (saved && (saved === 'en' || saved === 'fr')) return saved;
  const nav = navigator.language?.toLowerCase() || navigator.languages?.[0]?.toLowerCase() || '';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('en')) return 'en';
  return 'fr';
};
let currentLang = getDefaultLang();

export function t(key: string, params?: Record<string, any>): string {
  const dict = messages[currentLang];
  let entry = dict && dict[key];
  let str = entry && entry.message ? entry.message : key;

  // Remplace les paramètres {count}, etc.
  if (params) {
    Object.keys(params).forEach((k) => {
      str = str.replace(new RegExp(`{${k}}`, 'g'), params[k]);
    });
  }
  return str;
}

i18next
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'arti-ai-detector-language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;

export const changeLanguage = (lng: string) => {
  i18next.changeLanguage(lng);
  localStorage.setItem('arti-ai-detector-language', lng);
  currentLang = lng;
};

export const getCurrentLanguage = () => currentLang;

export const getSupportedLanguages = () => ['en', 'fr'];
