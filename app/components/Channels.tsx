'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Channel } from '../utils/m3uParser';
import Hls from 'hls.js';

interface ChannelsProps {
  channels: Channel[];
  selectedCategory: string;
  searchQuery?: string;
}

const CHANNELS_PER_PAGE = 50; // Load 50 channels at a time

const Channels: React.FC<ChannelsProps> = ({ channels, selectedCategory, searchQuery = '' }) => {
  const { t, dir } = useLanguage();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [playingChannelId, setPlayingChannelId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedChannels, setDisplayedChannels] = useState<Channel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter by category
  let filteredChannels = selectedCategory === 'All' 
    ? channels 
    : channels.filter(channel => channel.group === selectedCategory);
  
  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredChannels = filteredChannels.filter(channel => 
      channel.name.toLowerCase().includes(query) ||
      channel.group.toLowerCase().includes(query)
    );
  }

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedChannels(filteredChannels.slice(0, CHANNELS_PER_PAGE));
  }, [selectedCategory, searchQuery]);

  // Load more channels when scrolling to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreChannels();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [currentPage, filteredChannels, isLoadingMore]);

  const loadMoreChannels = useCallback(() => {
    const totalPages = Math.ceil(filteredChannels.length / CHANNELS_PER_PAGE);
    
    if (currentPage < totalPages) {
      setIsLoadingMore(true);
      
      // Simulate network delay for smooth UX
      setTimeout(() => {
        const nextPage = currentPage + 1;
        const startIndex = 0;
        const endIndex = nextPage * CHANNELS_PER_PAGE;
        setDisplayedChannels(filteredChannels.slice(startIndex, endIndex));
        setCurrentPage(nextPage);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [currentPage, filteredChannels]);

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setPlayingChannelId(channel.id);
    setVideoError(false);
    setIsLoading(true);
  };

  const handleClosePlayer = () => {
    // Clean up HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Stop video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    
    setSelectedChannel(null);
    setPlayingChannelId(null);
    setVideoError(false);
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && selectedChannel) {
      const video = videoRef.current;
      const streamUrl = selectedChannel.url;

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Check if the stream is HLS
      if (streamUrl.includes('.m3u8') || streamUrl.includes('HLSPlaylist')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });
          
          hlsRef.current = hls;
          
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            video.play().catch(err => {
              console.error('Error playing video:', err);
            });
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              setVideoError(true);
              setIsLoading(false);
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari native HLS support
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            video.play().catch(err => {
              console.error('Error playing video:', err);
            });
          });
        } else {
          setVideoError(true);
          setIsLoading(false);
        }
      } else {
        // For non-HLS streams
        video.src = streamUrl;
        setIsLoading(false);
        video.play().catch(err => {
          console.error('Error playing video:', err);
          setVideoError(true);
        });
      }
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel]);

  const totalChannels = filteredChannels.length;
  const showingChannels = displayedChannels.length;
  const hasMore = showingChannels < totalChannels;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#010e1e] via-gray-900 to-[#010e1e]">
      {/* Player Section */}
      {selectedChannel && (
        <div ref={playerContainerRef} className="bg-black p-4 border-b border-gray-800 relative">
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#f2151c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Loading stream...</p>
                </div>
              </div>
            )}
            
            {!videoError ? (
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                onError={() => {
                  setVideoError(true);
                  setIsLoading(false);
                }}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-400 text-sm mb-2">Unable to load stream</p>
                  <p className="text-gray-500 text-xs">{selectedChannel.name}</p>
                  <button
                    onClick={() => {
                      setVideoError(false);
                      setIsLoading(true);
                      handleChannelClick(selectedChannel);
                    }}
                    className="mt-4 px-4 py-2 bg-[#f2151c] text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {/* Custom Controls Overlay */}
            <div className="absolute top-0 right-0 p-4 flex gap-2 z-20">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors"
                title="Fullscreen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={handleClosePlayer}
                className="p-2 bg-[#f2151c] hover:bg-red-700 rounded-lg text-white transition-colors"
                title="Close Player"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Channel Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-bold text-lg">{selectedChannel.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[#f2151c] px-2 py-1 rounded text-xs font-bold animate-pulse">
                      {t('player.live')}
                    </span>
                    <span className="text-xs text-gray-300">{selectedChannel.group}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channels Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white" dir={dir}>
            {t('channels.title')} ({showingChannels} / {totalChannels})
          </h2>
          {hasMore && (
            <span className="text-sm text-gray-400">
              Scroll for more...
            </span>
          )}
        </div>

        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p>{t('channels.noChannels')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedChannels.map((channel, index) => (
                <div
                  key={`${channel.id}-${index}`}
                  onClick={() => handleChannelClick(channel)}
                  className={`
                    group cursor-pointer transform transition-all duration-300 hover:scale-105
                    ${playingChannelId === channel.id ? 'ring-2 ring-[#f2151c] ring-offset-2 ring-offset-[#010e1e]' : ''}
                  `}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-700/50 border border-gray-700">
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-contain p-4"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/app_logo.png';
                        }}
                      />
                      {playingChannelId === channel.id && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[#f2151c]/80 to-transparent flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-md rounded-full p-3 animate-pulse">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm truncate" dir={dir}>
                        {channel.name}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1 truncate">{channel.group}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-3 border-[#f2151c] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400">Loading more channels...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMoreChannels}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Load More Channels
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Channels;