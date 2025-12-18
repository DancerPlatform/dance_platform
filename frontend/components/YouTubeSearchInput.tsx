'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import Image from 'next/image';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

interface YouTubeSearchInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  className?: string;
}

export function YouTubeSearchInput({
  label = 'YouTube 링크',
  placeholder = 'https://www.youtube.com/watch?v=... 또는 검색',
  value,
  onChange,
  required = false,
  className = '',
}: YouTubeSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isManualInput, setIsManualInput] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.videos || []);
    } catch (error) {
      console.error('YouTube search error:', error);
      alert('YouTube 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    onChange(video.url);
    setShowResults(false);
    setSearchQuery('');
    setIsManualInput(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isManualInput) {
        handleSearch();
      }
    }
  };

  const toggleSearchMode = () => {
    setIsManualInput(!isManualInput);
    if (!isManualInput) {
      // Switching to manual input mode
      setShowResults(false);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor="youtube-input">
          {label} {required && '*'}
        </Label>
        <button
          type="button"
          onClick={toggleSearchMode}
          className="text-xs text-green-500 hover:text-green-200 transition-colors"
        >
          {isManualInput ? '검색으로 전환' : '직접 입력으로 전환'}
        </button>
      </div>

      {isManualInput ? (
        // Manual URL input mode
        <Input
          id="youtube-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-zinc-800 border-zinc-700"
          placeholder={placeholder}
        />
      ) : (
        // Search mode
        <div ref={searchRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="youtube-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-zinc-800 border-zinc-700 pr-8"
                placeholder="영상 제목, 가수명 등으로 검색..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-zinc-700 hover:bg-zinc-600"
            >
              <Search size={16} />
            </Button>
          </div>

          {/* Selected video display */}
          {value && (
            <div className="mt-2 p-2 bg-zinc-800 border border-zinc-700 rounded-md flex items-center justify-between">
              <span className="text-sm text-zinc-300 truncate">{value}</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-zinc-400 hover:text-white ml-2"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Search results dropdown */}
          {showResults && (
            <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-zinc-400">검색 중...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-zinc-400">
                  검색 결과가 없습니다
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => handleVideoSelect(video)}
                      className="w-full px-3 py-2 hover:bg-zinc-800 text-left flex gap-3 items-start transition-colors"
                    >
                      <div className="relative w-24 h-16 flex-shrink-0 bg-zinc-800 rounded overflow-hidden">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-zinc-400">{video.channelTitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
