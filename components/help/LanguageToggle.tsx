'use client';

import { useState } from 'react';

interface LanguageToggleProps {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export default function LanguageToggle({ language, setLanguage }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm ${language === 'en' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        EN
      </span>
      <button
        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        className="relative rounded-full w-14 h-7 bg-blue-500 dark:bg-blue-600 transition duration-200 ease-linear"
        aria-label="Toggle language"
      >
        <span
          className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center ${
            language === 'hi' ? 'transform translate-x-7' : ''
          }`}
        >
          <span className="text-xs font-bold">
            {language === 'en' ? 'हिं' : 'EN'}
          </span>
        </span>
      </button>
      <span className={`text-sm ${language === 'hi' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        HI
      </span>
    </div>
  );
}