import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

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

export const t = (key: string, options?: any) => i18next.t(key, options);

export const changeLanguage = (lng: string) => {
  i18next.changeLanguage(lng);
  localStorage.setItem('arti-ai-detector-language', lng);
};

export const getCurrentLanguage = () => i18next.language;

export const getSupportedLanguages = () => ['en', 'fr'];
