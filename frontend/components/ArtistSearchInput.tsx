'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import Image from 'next/image';

interface Artist {
  artist_id: string;
  artist_name: string;
  artist_name_eng?: string;
  photo?: string;
}

interface ArtistSearchInputProps {
  placeholder?: string;
  onSelect: (artist: Artist) => void;
  className?: string;
}

export function ArtistSearchInput({
  placeholder = '아티스트 이름으로 검색...',
  onSelect,
  className = '',
}: ArtistSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
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
        `/api/artists?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.artists || []);
    } catch (error) {
      console.error('Artist search error:', error);
      alert('아티스트 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    onSelect(artist);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    setSelectedArtist(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={className}>
      {!selectedArtist ? (
        <div ref={searchRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-zinc-800 border-zinc-700 pr-8"
                placeholder={placeholder}
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
                  {searchResults.map((artist) => (
                    <button
                      key={artist.artist_id}
                      type="button"
                      onClick={() => handleArtistSelect(artist)}
                      className="w-full px-3 py-2 hover:bg-zinc-800 text-left flex gap-3 items-center transition-colors"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-zinc-800 rounded-full overflow-hidden">
                        {artist.photo ? (
                          <Image
                            src={artist.photo}
                            alt={artist.artist_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xl font-bold">
                            {artist.artist_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {artist.artist_name}
                        </h4>
                        {artist.artist_name_eng && (
                          <p className="text-xs text-zinc-400 truncate">
                            {artist.artist_name_eng}
                          </p>
                        )}
                        <p className="text-xs text-green-500">@{artist.artist_id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Selected artist display
        <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-md flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0 bg-zinc-700 rounded-full overflow-hidden">
            {selectedArtist.photo ? (
              <Image
                src={selectedArtist.photo}
                alt={selectedArtist.artist_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xl font-bold">
                {selectedArtist.artist_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">
              {selectedArtist.artist_name}
            </h4>
            {selectedArtist.artist_name_eng && (
              <p className="text-xs text-zinc-400 truncate">
                {selectedArtist.artist_name_eng}
              </p>
            )}
            <p className="text-xs text-green-500">@{selectedArtist.artist_id}</p>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
