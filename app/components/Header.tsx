'use client';

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'ku', name: 'کوردی' },
  ];

  return (
    <header className="bg-gradient-to-r from-[#f2151c] via-gray-900 to-[#f2151c] text-white border-b border-[#f2151c]/20 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/app_logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t('app.title')}
            </h1>
          </div>

          {/* Center Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-md rounded-xl text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f2151c]/50 focus:border-[#f2151c] transition-all"
                dir={dir}
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ar' | 'ku')}
                className="appearance-none bg-gray-800 text-white px-3 md:px-14 py-2 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f2151c]/50 pr-8 border border-gray-700"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-gray-900">
                    {lang.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-3 w-4 h-4 text-white pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-md rounded-xl text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f2151c]/50 focus:border-[#f2151c] transition-all"
                dir={dir}
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;