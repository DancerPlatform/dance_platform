'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, MapPin, Play, Trophy, Users } from 'lucide-react';

export type PortfolioSectionType =
  | 'highlights'
  | 'choreographies'
  | 'media'
  | 'directing'
  | 'performances'
  | 'workshops'
  | 'awards';

type SortOrder = 'display_order' | 'date';

export interface Song {
  title: string;
  singer: string;
  youtube_link: string | null;
  date: string | null;
}

export interface MediaItem {
  youtube_link: string;
  role: string[];
  is_highlight: boolean;
  display_order: number;
  title: string | null;
  video_date: string | null;
}

export interface ChoreographyItem {
  song: Song;
  role: string[];
  is_highlight: boolean;
  display_order: number;
}

export interface DirectingItem {
  title: string;
  date: string | null;
}

export interface PerformanceItem {
  performance_title: string;
  date: string | null;
  category: string | null;
}

export interface WorkshopItem {
  class_name: string;
  class_role: string[];
  country: string | null;
  class_date: string | null;
}

export interface AwardItem {
  award_title: string;
  issuing_org: string | null;
  received_date: string | null;
}

export type PortfolioData =
  | MediaItem[]
  | ChoreographyItem[]
  | DirectingItem[]
  | PerformanceItem[]
  | WorkshopItem[]
  | AwardItem[];

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: PortfolioSectionType;
  sectionTitle: string;
  data: PortfolioData;
}

export function PortfolioModal({
  isOpen,
  onClose,
  sectionType,
  sectionTitle,
  data,
}: PortfolioModalProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('display_order');

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'display_order' ? 'date' : 'display_order');
  };

  // Sorting functions
  const sortByDate = (items: any[]) => {
    return [...items].sort((a, b) => {
      let dateA = 0;
      let dateB = 0;

      // Handle different date field names
      if ('video_date' in a && a.video_date) {
        dateA = new Date(a.video_date).getTime();
      } else if ('date' in a && a.date) {
        dateA = new Date(a.date).getTime();
      } else if ('class_date' in a && a.class_date) {
        dateA = new Date(a.class_date).getTime();
      } else if ('song' in a && a.song?.date) {
        dateA = new Date(a.song.date).getTime();
      } else if ('received_date' in a && a.received_date) {
        dateA = new Date(a.received_date).getTime();
      }

      if ('video_date' in b && b.video_date) {
        dateB = new Date(b.video_date).getTime();
      } else if ('date' in b && b.date) {
        dateB = new Date(b.date).getTime();
      } else if ('class_date' in b && b.class_date) {
        dateB = new Date(b.class_date).getTime();
      } else if ('song' in b && b.song?.date) {
        dateB = new Date(b.song.date).getTime();
      } else if ('received_date' in b && b.received_date) {
        dateB = new Date(b.received_date).getTime();
      }

      return dateB - dateA; // Most recent first
    });
  };

  const sortByDisplayOrder = (items: any[]) => {
    return [...items].sort((a, b) => {
      const orderA = a.display_order ?? Infinity;
      const orderB = b.display_order ?? Infinity;
      return orderA - orderB;
    });
  };

  const getSortedData = () => {
    if (sortOrder === 'date') {
      return sortByDate(data as any[]);
    }
    return sortByDisplayOrder(data as any[]);
  };

  const renderContent = () => {
    const sortedData = getSortedData();

    switch (sectionType) {
      case 'highlights':
      case 'media':
        return renderMediaContent(sortedData as MediaItem[]);
      case 'choreographies':
        return renderChoreographyContent(sortedData as ChoreographyItem[]);
      case 'directing':
        return renderDirectingContent(sortedData as DirectingItem[]);
      case 'performances':
        return renderPerformancesContent(sortedData as PerformanceItem[]);
      case 'workshops':
        return renderWorkshopsContent(sortedData as WorkshopItem[]);
      case 'awards':
        return renderAwardsContent(sortedData as AwardItem[]);
      default:
        return null;
    }
  };

  const renderMediaContent = (items: MediaItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No media items found.</p>;
    }

    return (
      <div className="">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 border-b hover:bg-muted/50 transition-colors flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {item.youtube_link && (
                  <a
                    href={item.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    <Play className="h-4 w-4" />
                  </a>
                )}
                <h3 className="font-semibold text-sm">{item.title || 'Untitled'}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{item.role.join(', ')}</span>
                </div>
                {item.video_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(item.video_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderChoreographyContent = (items: ChoreographyItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No choreography items found.</p>;
    }

    return (
      <div className="">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-black rounded-t-lg text-sm font-semibold">
          <div className="col-span-4">Song</div>
          <div className="col-span-3">Artist</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Date</div>
        </div>
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b hover:bg-muted/50 transition-colors"
          >
            <div className="col-span-4 flex items-center gap-2">
              {item.song.youtube_link && (
                <a
                  href={item.song.youtube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  <Play className="h-4 w-4" />
                </a>
              )}
              <span className="text-sm">{item.song.title}</span>
            </div>
            <div className="col-span-3 text-sm text-muted-foreground">
              {item.song.singer}
            </div>
            <div className="col-span-3 text-sm">
              {item.role.join(', ')}
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
              {item.song.date ? new Date(item.song.date).toLocaleDateString() : '-'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDirectingContent = (items: DirectingItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No directing items found.</p>;
    }

    return (
      <div className="">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 border-b hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            {item.date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPerformancesContent = (items: PerformanceItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No performances found.</p>;
    }

    return (
      <div className="">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 border-b hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-semibold text-sm mb-1">{item.performance_title}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              )}
              {item.category && (
                <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded-full">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkshopsContent = (items: WorkshopItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No workshops found.</p>;
    }

    return (
      <div className="">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 border-b hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-semibold text-sm mb-1">{item.class_name}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{item.class_role.join(', ')}</span>
              </div>
              {item.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{item.country}</span>
                </div>
              )}
              {item.class_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.class_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAwardsContent = (items: AwardItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No awards found.</p>;
    }

    return (
      <div className="">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 border-b hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <h3 className="font-semibold text-sm">{item.award_title}</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.issuing_org && <span>Issued by: {item.issuing_org}</span>}
              {item.received_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.received_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">{sectionTitle}</DialogTitle>
            <div className="flex gap-2">
              <button
                onClick={toggleSortOrder}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  sortOrder === 'display_order'
                    ? 'bg-green-400 text-black font-semibold'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Order
              </button>
              <button
                onClick={toggleSortOrder}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  sortOrder === 'date'
                    ? 'bg-green-400 text-black font-semibold'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Date
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
