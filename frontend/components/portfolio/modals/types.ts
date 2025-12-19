// Shared type definitions for portfolio modals

export interface Song {
  song_id?: string;
  title: string;
  singer: string;
  youtube_link?: string;
  date: string;
}

export interface ChoreographyItem {
  song?: Song;
  role?: string[];
  is_highlight: boolean;
  display_order: number;
}

export interface Performance {
  performance_title: string;
  date: string;
  category?: string;
}

export interface PerformanceItem {
  performance_id?: string;
  performance?: Performance;
}

export interface Directing {
  title: string;
  date: string;
}

export interface DirectingItem {
  directing_id?: string;
  directing?: Directing;
}

export interface Workshop {
  class_name: string;
  class_role?: string[];
  country: string;
  class_date: string;
}

export interface Award {
  award_title: string;
  issuing_org: string;
  received_date: string;
}
