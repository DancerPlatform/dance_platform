export interface Artist {
  artist_id: string;
  artist_name: string;
  artist_name_eng: string;
  introduction: string | null;
  photo: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
}

export interface ArtistsResponse {
  artists: Artist[];
  count: number;
}
