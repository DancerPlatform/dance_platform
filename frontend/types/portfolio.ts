interface Song {
  song_id?: string;
  title: string;
  singer: string;
  youtube_link?: string;
  date: string;
}

interface Performance {
  performance_id?: string;
  performance_title: string;
  date: string;
  category?: string;
}

interface Directing {
  directing_id?: string;
  title: string;
  date: string;
}

export interface MediaItem {
  media_id?: string;
  youtube_link: string;
  role?: string;
  is_highlight: boolean;
  display_order: number;
  highlight_display_order?: number;
  title: string;
  video_date: Date;
}

export interface ChoreographyItem {
  song?: Song;
  role?: string[];
  is_highlight: boolean;
  display_order: number;
}

export interface PerformanceItem {
  performance?: Performance;
}
export interface Award {
  award_title: string;
  issuing_org: string;
  received_date: string;
}

export interface Workshop {
  class_name: string;
  class_role?: string[];
  country: string;
  class_date: string;
}

export interface DirectingItem {
  directing?: Directing;
}

interface TeamMember {
  artist_id: string;
  name: string;
  photo?: { photo?: string };
}

export interface Team {
  team_id: string;
  team_name: string;
  team_introduction?: string;
  leader?: TeamMember;
  subleader?: TeamMember;
  photo?: string;
}

export interface TeamMembership {
  team?: Team;
}

export interface Visa {
  visa_id?: string;
  country_code: string;
  start_date: string;
  end_date: string;
}

export interface GalleryImage {
  image_id?: string;
  image_url: string;
  caption?: string;
  display_order: number;
}