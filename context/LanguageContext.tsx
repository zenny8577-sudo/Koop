import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  currentLanguage: Language;
  switchLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  nl: {
    welcome: 'Welkom',
    // ... outras traduções
  },
  en: {
    welcome: 'Welcome',
    // ... outras traduções
  }
};

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('nl');

  const switchLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string) => {
    return translations[currentLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};