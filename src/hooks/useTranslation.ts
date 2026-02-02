import { useState, useEffect } from 'react';
import { t as translateFunction, getCurrentLanguage } from '../utils/i18n';

interface UseTranslationReturn {
  t: (key: string, fallback?: string) => string;
  currentLanguage: string;
  isReady: boolean;
}

export const useTranslation = (): UseTranslationReturn => {
  const [, forceUpdate] = useState({});
  const [isReady, setIsReady] = useState(false);

  const t = (key: string, fallback?: string): string => {
    const result = translateFunction(key, fallback);
    return result;
  };

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  // Check if translations are ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500); // Give i18n time to initialize

    return () => clearTimeout(timer);
  }, []);

  const currentLanguage = getCurrentLanguage();

  return { t, currentLanguage, isReady };
};
