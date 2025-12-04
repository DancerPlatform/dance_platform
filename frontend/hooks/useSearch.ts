import useSWR from 'swr';

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

export type SearchResult = ArtistResult | CrewResult;

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const fetcher = async (url: string): Promise<SearchResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
};

interface UseSearchOptions {
  type: string;
  keyword: string;
  limit?: number;
  offset?: number;
}

export function useSearch({ type, keyword, limit = 10, offset = 0 }: UseSearchOptions) {
  // Create a unique key for SWR caching
  // Always fetch - API supports empty keywords and returns all results
  // This allows the search page to show initial results when tabs are switched
  const key = `/api/search?type=${type}&keyword=${encodeURIComponent(keyword)}&limit=${limit}&offset=${offset}`;

  const { data, error, isLoading, mutate } = useSWR<SearchResponse>(
    key,
    fetcher,
    {
      // SWR configuration for optimal caching
      revalidateOnFocus: false, // Don't refetch when window regains focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      keepPreviousData: true, // Keep previous data while loading new data
      shouldRetryOnError: false, // Don't retry on error to avoid spamming
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate, // Expose mutate for manual cache invalidation if needed
  };
}
