'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import Header from './components/Header';
import Categories from './components/Categories';
import Channels from './components/Channels';
import { parseM3U, getCategories, Channel } from './utils/m3uParser';

export default function Home() {
  const { dir } = useLanguage();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    // Splash screen progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60); // 3000ms / 50 steps = 60ms per step

    // Hide splash screen after 3 seconds
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(splashTimeout);
    };
  }, []);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetch('/channels.m3u');
        const text = await response.text();
        const parsedChannels = parseM3U(text);
        const parsedCategories = getCategories(parsedChannels);
        
        setChannels(parsedChannels);
        setCategories(parsedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error loading channels:', error);
        setLoading(false);
      }
    };

    // Only load channels after splash screen
    if (!showSplash) {
      loadChannels();
    }
  }, [showSplash]);

  // Splash Screen
  if (showSplash) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#010e1e]">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <img 
            src="/app_logo.png" 
            alt="Panda TV" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8"
          />
          
          {/* Progress Bar Container */}
          <div className="w-64 md:w-96 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#f2151c] transition-all duration-100 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Loading Text */}
          <p className="text-white/60 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f2151c]" dir={dir}>
      {/* Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-[#f2151c] rounded-lg text-white shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Sidebar - Categories */}
        <aside 
          className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 fixed lg:relative z-40 w-64 lg:w-80 h-full
            transition-transform duration-300 ease-in-out
            border-r border-gray-800 shadow-2xl lg:shadow-none
          `}
        >
          <Categories
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={(category) => {
              setSelectedCategory(category);
              setIsMobileMenuOpen(false);
            }}
          />
        </aside>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content - Channels */}
        <main className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-[#010e1e]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading channels...</p>
              </div>
            </div>
          ) : (
            <Channels channels={channels} selectedCategory={selectedCategory} />
          )}
        </main>
      </div>
    </div>
  );
}