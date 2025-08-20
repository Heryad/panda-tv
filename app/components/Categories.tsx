'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoriesProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const { t, dir } = useLanguage();

  const getCategoryTranslation = (category: string): string => {
    // Create a safe key by removing special characters and spaces
    const safeKey = category.toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, ''); // Remove spaces
    
    const categoryKey = `categories.${safeKey}`;
    const translation = t(categoryKey);
    
    // If no translation found, return the original category name
    if (translation === categoryKey) {
      return category;
    }
    
    return translation;
  };

  return (
    <div className="bg-gradient-to-b from-[#010e1e] to-gray-900 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {t('categories.title')}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          {/* All Channels Category */}
          <button
            onClick={() => onCategorySelect('All')}
            className={`
              w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200
              ${selectedCategory === 'All'
                ? 'bg-[#f2151c] text-white shadow-lg shadow-[#f2151c]/30'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700'
              }
            `}
            dir={dir}
          >
            <span className="font-medium">{t('categories.all')}</span>
            {selectedCategory === 'All' && (
              <span className="ml-auto">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>

          {/* Other Categories */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 text-left
                ${selectedCategory === category
                  ? 'bg-[#f2151c] text-white shadow-lg shadow-[#f2151c]/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700'
                }
              `}
              dir={dir}
            >
              <span className="font-medium flex-1 truncate">{category}</span>
              {selectedCategory === category && (
                <span className="ml-auto flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-800 bg-[#010e1e]/50 backdrop-blur-sm">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{categories.length + 1} {t('categories.title')}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#f2151c] rounded-full animate-pulse"></span>
            {t('player.live')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Categories;