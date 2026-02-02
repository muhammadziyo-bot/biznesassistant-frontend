import React, { useState, useEffect } from 'react';
import { Language, LANGUAGES, getCurrentLanguage, setLanguage } from '../types/language';
import { initializeTranslations } from '../utils/i18n';

const LanguageSwitcher: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize translations on component mount and update current language
    initializeTranslations().then(() => {
      setCurrentLang(getCurrentLanguage());
    });
  }, []);

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setCurrentLang(language);
    setIsOpen(false);
    // Force page reload to ensure all components re-render with new language
    window.location.reload();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <span className="text-lg">{LANGUAGES[currentLang].flag}</span>
        <span className="hidden sm:inline">{LANGUAGES[currentLang].nativeName}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown */}
      <div className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="py-1">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                currentLang === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
              {currentLang === lang.code && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
