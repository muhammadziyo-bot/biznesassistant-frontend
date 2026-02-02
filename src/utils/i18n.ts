import { Language, LANGUAGES, DEFAULT_LANGUAGE } from '../types/language';

// Translation storage
const translations: Record<string, any> = {};

// Current language state
let currentLanguage: Language = DEFAULT_LANGUAGE;

// Loading state
let isLoading = true;

// Initialize translations
let initializationPromise: Promise<void> | null = null;

export const initializeTranslations = async () => {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      isLoading = true;
      
      // Load translation files
      const uzLatn = await import('../locales/uz-latn.json');
      const uzCyrl = await import('../locales/uz-cyrl.json');
      const ru = await import('../locales/ru.json');
      const en = await import('../locales/en.json');

      translations['uz-latn'] = uzLatn.default;
      translations['uz-cyrl'] = uzCyrl.default;
      translations['ru'] = ru.default;
      translations['en'] = en.default;

      console.log('Translations loaded for all languages');

      // Load saved language from localStorage
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && LANGUAGES[savedLanguage]) {
        currentLanguage = savedLanguage;
      }
      console.log('Current language set to:', currentLanguage);
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      isLoading = false;
    }
  })();
  
  return initializationPromise;
};

// Get current language
export const getCurrentLanguage = (): Language => currentLanguage;

// Set language
export const setLanguage = (language: Language) => {
  if (LANGUAGES[language]) {
    console.log('Setting language to:', language);
    currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Update direction for RTL languages (if needed in future)
    document.documentElement.dir = LANGUAGES[language].direction;
    
    console.log('Language set successfully, currentLanguage:', currentLanguage);
  }
};

// Translation function
export const t = (key: string, fallback?: string): string => {
  // Return key if still loading
  if (isLoading) {
    return fallback || key;
  }
  
  const keys = key.split('.');
  let translation: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      translation = undefined;
      break;
    }
  }
  
  if (typeof translation === 'string') {
    return translation;
  }
  
  // Fallback to English if current language doesn't have the translation
  if (currentLanguage !== 'en') {
    let englishTranslation: any = translations['en'];
    for (const k of keys) {
      if (englishTranslation && typeof englishTranslation === 'object' && k in englishTranslation) {
        englishTranslation = englishTranslation[k];
      } else {
        englishTranslation = undefined;
        break;
      }
    }
    if (typeof englishTranslation === 'string') {
      return englishTranslation;
    }
  }
  
  return fallback || key;
};
