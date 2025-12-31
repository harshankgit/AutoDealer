'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageToggle from './LanguageToggle';

interface HelpHeaderProps {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  title?: string;
  description?: string;
}

export default function HelpHeader({ language, setLanguage, title, description }: HelpHeaderProps) {
  // Translation helper function
  const t = (en: string, hi: string) => language === 'en' ? en : hi;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
      <div className="text-center sm:text-left mb-4 sm:mb-0">
        <h1 className="text-3xl font-bold mb-2">
          {title || t('Welcome to CarSelling Platform Help Center', 'कारसेलिंग प्लेटफॉर्म हेल्प सेंटर में आपका स्वागत है')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          {description || 
            (language === 'en'
              ? 'Find answers to common questions and learn how to make the most of our platform. Select a topic from the categories below to get started.'
              : 'सामान्य प्रश्नों के उत्तर ढूढें और हमारे प्लेटफॉर्म का सर्वोत्तम उपयोग करना सीखें। शुरू करने के लिए नीचे दी गई श्रेणियों में से एक विषय चुनें।')}
        </p>
      </div>
      <LanguageToggle language={language} setLanguage={setLanguage} />
    </div>
  );
}