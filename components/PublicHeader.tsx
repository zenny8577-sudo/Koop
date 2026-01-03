import React, { useState } from 'react';
import Logo from './Branding/Logo';
import { useLanguage } from '../context/LanguageContext';

const PublicHeader: React.FC = () => {
  const { currentLanguage, switchLanguage } = useLanguage();
  // ... restante do código existente
  
  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* Logo e outros elementos */}
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => switchLanguage('nl')}
              className={`p-2 rounded-full ${currentLanguage === 'nl' ? 'bg-slate-100' : ''}`}
            >
              🇳🇱
            </button>
            <button 
              onClick={() => switchLanguage('en')}
              className={`p-2 rounded-full ${currentLanguage === 'en' ? 'bg-slate-100' : ''}`}
            >
              🇬🇧
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};