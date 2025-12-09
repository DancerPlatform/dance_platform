'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Play, Users, MapPin, Trophy } from 'lucide-react';
import YouTubeThumbnail from './YoutubeThumbnail';

export type PortfolioItemType = 'highlight' | 'choreography' | 'media' | 'directing' | 'workshop' | 'award';

// Union type for all possible portfolio item data
export type PortfolioItemData =
  | HighlightItemData
  | ChoreographyItemData
  | MediaItemData
  | DirectingItemData
  | WorkshopItemData
  | AwardItemData;

interface HighlightItemData {
  type: 'highlight';
  title: string;
  youtube_link: string;
  role: string[];
  video_date?: string | null;
}

interface ChoreographyItemData {
  type: 'choreography';
  song: {
    title: string;
    singer: string;
    youtube_link: string | null;
    date: string | null;
  };
  role: string[];
}

interface MediaItemData {
  type: 'media';
  title: string;
  youtube_link: string;
  role: string[];
  video_date?: string | null;
}

interface DirectingItemData {
  type: 'directing';
  title: string;
  date: string | null;
}

interface WorkshopItemData {
  type: 'workshop';
  class_name: string;
  class_role: string[];
  country: string | null;
  class_date: string | null;
}

interface AwardItemData {
  type: 'award';
  award_title: string;
  issuing_org: string | null;
  received_date: string | null;
}

interface PortfolioItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PortfolioItemData | null;
}

export function PortfolioItemDetailModal({
  isOpen,
  onClose,
  item,
}: PortfolioItemDetailModalProps) {
  if (!item) return null;

  const renderContent = () => {
    switch (item.type) {
      case 'highlight':
        return renderHighlightDetail(item);
      case 'choreography':
        return renderChoreographyDetail(item);
      case 'media':
        return renderMediaDetail(item);
      case 'directing':
        return renderDirectingDetail(item);
      case 'workshop':
        return renderWorkshopDetail(item);
      case 'award':
        return renderAwardDetail(item);
      default:
        return null;
    }
  };

  const renderHighlightDetail = (data: HighlightItemData) => {
    return (
      <div className="space-y-3">
        {/* YouTube Video Embed */}
        {data.youtube_link && (
          <div className="aspect-video bg-gray-900 rounded-md overflow-hidden max-w-md mx-auto">
            <YouTubeThumbnail url={data.youtube_link} title={data.title} />
          </div>
        )}

        {/* Details */}
        <div className="space-y-2">
          <div>
            <p className="text-base sm:text-lg font-bold">{data.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
            {data.role && data.role.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{data.role.join(', ')}</span>
              </div>
            )}

            {data.video_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {new Date(data.video_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* YouTube Link */}
          {data.youtube_link && (
            <div className="pt-2">
              <a
                href={data.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-green-400 text-black text-sm font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChoreographyDetail = (data: ChoreographyItemData) => {
    return (
      <div className="space-y-3">
        {/* YouTube Video Embed */}
        {data.song.youtube_link && (
          <div className="aspect-video bg-gray-900 rounded-md overflow-hidden max-w-md mx-auto">
            <YouTubeThumbnail
              url={data.song.youtube_link}
              title={`${data.song.singer} - ${data.song.title}`}
            />
          </div>
        )}

        {/* Details */}
        <div className="space-y-2">
          <div>
            <p className="text-base sm:text-lg font-bold">{data.song.title}</p>
            <p className="text-sm text-gray-400 mt-0.5">{data.song.singer}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
            {data.role && data.role.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{data.role.join(', ')}</span>
              </div>
            )}

            {data.song.date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {new Date(data.song.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* YouTube Link */}
          {data.song.youtube_link && (
            <div className="pt-2">
              <a
                href={data.song.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-green-400 text-black text-sm font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMediaDetail = (data: MediaItemData) => {
    return (
      <div className="space-y-3">
        {/* YouTube Video Embed */}
        {data.youtube_link && (
          <div className="aspect-video bg-gray-900 rounded-md overflow-hidden max-w-md mx-auto">
            <YouTubeThumbnail url={data.youtube_link} title={data.title} />
          </div>
        )}

        {/* Details */}
        <div className="space-y-2">
          <div>
            <p className="text-base sm:text-lg font-bold">{data.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
            {data.role && data.role.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{data.role.join(', ')}</span>
              </div>
            )}

            {data.video_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {new Date(data.video_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* YouTube Link */}
          {data.youtube_link && (
            <div className="pt-2">
              <a
                href={data.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-green-400 text-black text-sm font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDirectingDetail = (data: DirectingItemData) => {
    return (
      <div className="space-y-3">
        {/* Details */}
        <div className="space-y-2">
          <div>
            <p className="text-base sm:text-lg font-bold">{data.title}</p>
          </div>

          {data.date && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {new Date(data.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkshopDetail = (data: WorkshopItemData) => {
    return (
      <div className="space-y-3">
        {/* Details */}
        <div className="space-y-2">
          <div>
            <p className="text-base sm:text-lg font-bold">{data.class_name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
            {data.class_role && data.class_role.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{data.class_role.join(', ')}</span>
              </div>
            )}

            {data.country && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{data.country}</span>
              </div>
            )}

            {data.class_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {new Date(data.class_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAwardDetail = (data: AwardItemData) => {
    return (
      <div className="space-y-3">
        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-base sm:text-lg font-bold">{data.award_title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
            {data.issuing_org && (
              <div>
                <span className="text-gray-500">Issued by:</span> {data.issuing_org}
              </div>
            )}

            {data.received_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {new Date(data.received_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 bg-black/20 backdrop-blur-xl border border-white/10">
        <DialogHeader className="pb-2">
          <DialogTitle hidden className="text-lg sm:text-xl">
            {item.type === 'choreography' ? 'Choreography' :
             item.type === 'media' ? 'Media' :
             item.type === 'directing' ? 'Directing' :
             item.type === 'workshop' ? 'Class' :
             item.type === 'award' ? 'Award' :
             'Highlight'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
