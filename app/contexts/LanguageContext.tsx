'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar' | 'ku';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations = {
  en: {
    'app.title': 'Panda TV',
    'header.language': 'Language',
    'header.search': 'Search channels...',
    'categories.title': 'Categories',
    'categories.all': 'All Channels',
    'categories.sports': 'Sports',
    'categories.news': 'News',
    'categories.movies': 'Movies',
    'categories.kids': 'Kids',
    'categories.documentary': 'Documentary',
    'categories.music': 'Music',
    'categories.entertainment': 'Entertainment',
    'categories.local': 'Local',
    'categories.kurdishسۆرانی': 'Kurdish سۆرانی',
    'categories.kurdish': 'Kurdish',
    'categories.arabic': 'Arabic',
    'categories.english': 'English',
    'categories.turkish': 'Turkish',
    'categories.persian': 'Persian',
    'categories.other': 'Other',
    'channels.title': 'Channels',
    'channels.nowPlaying': 'Now Playing',
    'channels.noChannels': 'No channels available',
    'channels.loading': 'Loading channels...',
    'player.live': 'LIVE',
    'player.quality': 'Quality',
    'player.volume': 'Volume',
  },
  ar: {
    'app.title': 'باندا تي في',
    'header.language': 'اللغة',
    'header.search': 'البحث عن القنوات...',
    'categories.title': 'الفئات',
    'categories.all': 'جميع القنوات',
    'categories.sports': 'رياضة',
    'categories.news': 'أخبار',
    'categories.movies': 'أفلام',
    'categories.kids': 'أطفال',
    'categories.documentary': 'وثائقي',
    'categories.music': 'موسيقى',
    'categories.entertainment': 'ترفيه',
    'categories.local': 'محلي',
    'categories.kurdishسۆرانی': 'كردي سۆرانی',
    'categories.kurdish': 'كردي',
    'categories.arabic': 'عربي',
    'categories.english': 'إنجليزي',
    'categories.turkish': 'تركي',
    'categories.persian': 'فارسي',
    'categories.other': 'أخرى',
    'channels.title': 'القنوات',
    'channels.nowPlaying': 'يعرض الآن',
    'channels.noChannels': 'لا توجد قنوات متاحة',
    'channels.loading': 'جاري تحميل القنوات...',
    'player.live': 'مباشر',
    'player.quality': 'الجودة',
    'player.volume': 'الصوت',
  },
  ku: {
    'app.title': 'پاندا تی ڤی',
    'header.language': 'زمان',
    'header.search': 'گەڕان بەدوای کەناڵەکان...',
    'categories.title': 'پۆلەکان',
    'categories.all': 'هەموو کەناڵەکان',
    'categories.sports': 'وەرزش',
    'categories.news': 'هەواڵ',
    'categories.movies': 'فیلم',
    'categories.kids': 'منداڵان',
    'categories.documentary': 'بەڵگەنامە',
    'categories.music': 'موزیک',
    'categories.entertainment': 'کات بەسەربردن',
    'categories.local': 'ناوخۆیی',
    'categories.kurdishسۆرانی': 'کوردی سۆرانی',
    'categories.kurdish': 'کوردی',
    'categories.arabic': 'عەرەبی',
    'categories.english': 'ئینگلیزی',
    'categories.turkish': 'تورکی',
    'categories.persian': 'فارسی',
    'categories.other': 'تر',
    'channels.title': 'کەناڵەکان',
    'channels.nowPlaying': 'ئێستا پەخش دەکرێت',
    'channels.noChannels': 'هیچ کەناڵێک بەردەست نییە',
    'channels.loading': 'کەناڵەکان بار دەکرێن...',
    'player.live': 'ڕاستەوخۆ',
    'player.quality': 'کوالیتی',
    'player.volume': 'دەنگ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const dir = language === 'ar' || language === 'ku' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
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
