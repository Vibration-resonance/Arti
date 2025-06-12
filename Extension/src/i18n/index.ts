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

// Initialize language: chrome.storage > localStorage > browser > default
const getDefaultLang = async (): Promise<string> => {
  // D'abord essayer chrome.storage si disponible
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      const result = await chrome.storage.local.get('settings');
      if (result.settings?.language) {
        console.log('[i18n:getDefaultLang] Using chrome.storage language:', result.settings.language);
        return result.settings.language;
      }
    } catch (error) {
      console.warn('[i18n:getDefaultLang] Chrome storage error:', error);
    }
  }
  
  // Fallback sur localStorage
  const saved = localStorage.getItem('arti-ai-detector-language');
  if (saved && (saved === 'en' || saved === 'fr')) {
    console.log('[i18n:getDefaultLang] Using localStorage language:', saved);
    return saved;
  }
  
  // Fallback sur la langue du navigateur
  const nav = navigator.language?.toLowerCase() || navigator.languages?.[0]?.toLowerCase() || '';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('en')) return 'en';
  return 'en'; // Défaut à 'en' au lieu de 'fr'
};

// Initialize with async function
let currentLang = 'en'; // Valeur par défaut temporaire
getDefaultLang().then(lang => {
  currentLang = lang;
  i18next.changeLanguage(lang);
});

export async function ensureI18nReady() {
  // Attend que la langue soit détectée et changée
  if (!currentLang) {
    currentLang = await getDefaultLang();
    await i18next.changeLanguage(currentLang);
  }
}

export function t(key: string, params?: Record<string, any>): string {
  // 1. Cherche dans messages.json (format Chrome)
  const dict = messages[currentLang];
  let entry = dict && dict[key];
  let str = entry && entry.message ? entry.message : undefined;

  // 2. Si non trouvé, cherche dans locales/*.json (i18next)
  if (!str) {
    str = i18next.t(key);
    if (!str || str === key) {
      str = key; // fallback clé brute
    }
  }

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

export const changeLanguage = async (lng: string) => {
  i18next.changeLanguage(lng);
  localStorage.setItem('arti-ai-detector-language', lng);
  currentLang = lng;
  
  // Synchroniser avec chrome.storage si disponible
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || {};
      settings.language = lng;
      await chrome.storage.local.set({ settings });
      console.log('[i18n:changeLanguage] Synced language to chrome.storage:', lng);
    } catch (error) {
      console.warn('[i18n:changeLanguage] Chrome storage sync error:', error);
    }
  }
};

export const getCurrentLanguage = () => currentLang;

export const getSupportedLanguages = () => ['en', 'fr'];
