'use client'
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ArtistCard } from "@/components/artist-card";
import { GroupCard } from "@/components/group-card";
import { useSearch } from "@/hooks/useSearch";

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

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('dancer');
  const [offset, setOffset] = useState(0);
  const limit = 10;

  // Use SWR hook for caching and optimized fetching
  const { data, isLoading, isError } = useSearch({
    type: activeTab,
    keyword: searchKeyword,
    limit,
    offset,
  });

  const handleSearch = () => {
    setOffset(0);
    setSearchKeyword(searchInput);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setOffset(0);
  };

  const handleLoadMore = () => {
    setOffset(offset + limit);
  };

  const searchResults = data?.results || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-10 bg-zinc-800 border-none rounded-sm px-4 text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button onClick={handleSearch}>
            <Search className="size-6" />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full px-2">
        <TabsList className="w-full grid grid-cols-3 bg-zinc-900 border-white/20 rounded-sm p-1">
          <TabsTrigger
            value="dancer"
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