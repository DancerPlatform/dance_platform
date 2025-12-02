'use client'
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ArtistCard } from "@/components/artist-card";
import { GroupCard } from "@/components/group-card";

interface ArtistResult {
  artist_id: string;
  artist_name: string;
  artist_name_eng: string;
  introduction: string | null;
  photo: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
}

interface CrewResult {
  group_id: string;
  group_name: string;
  introduction: string;
  photo: string | null;
  member_count: number;
  leader: {
    artist_name: string;
    photo: string | null;
  } | null;
}

type SearchResult = ArtistResult | CrewResult;

interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function SearchPage() {
  const [searchWord, setSearchWord] = useState('');
  const [activeTab, setActiveTab] = useState('dancer');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  const performSearch = useCallback(async (keyword: string, type: string, currentOffset: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?type=${type}&keyword=${encodeURIComponent(keyword)}&limit=${limit}&offset=${currentOffset}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.results);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const handleSearch = () => {
    setOffset(0);
    performSearch(searchWord, activeTab, 0);
  };

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    performSearch(searchWord, activeTab, newOffset);
  };

  useEffect(() => {
    setOffset(0);
    performSearch(searchWord, activeTab, 0);
  }, [activeTab, searchWord, performSearch]);

  return (
    <div>
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 py-4 px-4 border-white/20">
          <Link href="/main">
            <ArrowLeft className="size-6"/>
          </Link>
          <Input
            placeholder="키워드를 입력하세요"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-10 bg-zinc-800 border-none rounded-sm px-4 text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button onClick={handleSearch}>
            <Search className="size-6" />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-2">
        <TabsList className="w-full grid grid-cols-3 bg-zinc-900 border-white/20 rounded-sm p-1">
          <TabsTrigger
            value="dancer"
            onClick={() => {console.log(activeTab)}}
            className="data-[state=active]:bg-white/20 rounded-sm"
          >
            댄서
          </TabsTrigger>
          <TabsTrigger
            value="crew"
            className="data-[state=active]:bg-white/20 rounded-sm"
          >
            크루
          </TabsTrigger>
          <TabsTrigger
            value="career"
            className="data-[state=active]:bg-white/20 rounded-sm"
          >
            경력
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dancer" className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-zinc-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((result) => {
                  const artist = result as ArtistResult;
                  return (
                    <ArtistCard
                      key={artist.artist_id}
                      artistId={artist.artist_id}
                      nameEN={artist.artist_name_eng}
                      nameKR={artist.artist_name}
                      imageUrl={artist.photo}
                    />
                  );
                })}
              </div>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-2 text-center text-zinc-400 hover:text-white transition-colors"
                >
                  더 보기
                </button>
              )}
              <p className="text-center text-sm text-zinc-500">
                총 {total}개의 결과
              </p>
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-8">
              검색 결과가 없습니다
            </p>
          )}
        </TabsContent>

        <TabsContent value="crew" className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-zinc-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((result) => {
                  const crew = result as CrewResult;
                  return (
                    <GroupCard
                      key={crew.group_id}
                      groupId={crew.group_id}
                      nameKR={crew.group_name}
                      imageUrl={crew.photo}
                      memberCount={crew.member_count}
                    />
                  );
                })}
              </div>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-2 text-center text-zinc-400 hover:text-white transition-colors"
                >
                  더 보기
                </button>
              )}
              <p className="text-center text-sm text-zinc-500">
                총 {total}개의 결과
              </p>
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-8">
              검색 결과가 없습니다
            </p>
          )}
        </TabsContent>

        <TabsContent value="career" className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-zinc-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((result) => {
                  const artist = result as ArtistResult;
                  return (
                    <ArtistCard
                      key={artist.artist_id}
                      artistId={artist.artist_id}
                      nameEN={artist.artist_name_eng}
                      nameKR={artist.artist_name}
                      imageUrl={artist.photo}
                    />
                  );
                })}
              </div>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-2 text-center text-zinc-400 hover:text-white transition-colors"
                >
                  더 보기
                </button>
              )}
              <p className="text-center text-sm text-zinc-500">
                총 {total}개의 결과
              </p>
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-8">
              검색 결과가 없습니다
            </p>
          )}
        </TabsContent>
      </Tabs>

    </div>
  )
}