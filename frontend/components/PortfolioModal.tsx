'use client';

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
  const renderContent = () => {
    switch (sectionType) {
      case 'highlights':
      case 'media':
        return renderMediaContent(data as MediaItem[]);
      case 'choreographies':
        return renderChoreographyContent(data as ChoreographyItem[]);
      case 'directing':
        return renderDirectingContent(data as DirectingItem[]);
      case 'performances':
        return renderPerformancesContent(data as PerformanceItem[]);
      case 'workshops':
        return renderWorkshopsContent(data as WorkshopItem[]);
      case 'awards':
        return renderAwardsContent(data as AwardItem[]);
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
          <DialogTitle className="text-2xl">{sectionTitle}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
