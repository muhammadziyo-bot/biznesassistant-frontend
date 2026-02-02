// Language types and configurations
export type Language = 'uz-latn' | 'uz-cyrl' | 'ru' | 'en';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  'uz-latn': {
    code: 'uz-latn',
    name: 'Uzbek (Latin)',
    nativeName: 'Oʻzbekcha',
    flag: '🇺🇿',
    direction: 'ltr'
  },
  'uz-cyrl': {
    code: 'uz-cyrl',
    name: 'Uzbek (Cyrillic)',
    nativeName: 'Ўзбекча',
    flag: '🇺🇿',
    direction: 'ltr'
  },
  'ru': {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr'
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  }
};

export const DEFAULT_LANGUAGE: Language = 'uz-latn';

let currentLanguage: Language = DEFAULT_LANGUAGE;

// Initialize currentLanguage from localStorage if available
const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('language') as Language;
  if (savedLanguage && LANGUAGES[savedLanguage]) {
    currentLanguage = savedLanguage;
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = LANGUAGES[savedLanguage].direction;
  }
};

// Initialize on module load
initializeLanguage();

// Get current language
export const getCurrentLanguage = (): Language => currentLanguage;

// Set language
export const setLanguage = (language: Language) => {
  if (LANGUAGES[language]) {
    currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Update direction for RTL languages (if needed in future)
    document.documentElement.dir = LANGUAGES[language].direction;
    
    // Dispatch languagechange event to notify components
    window.dispatchEvent(new Event('languagechange'));
  }
};
