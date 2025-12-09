'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Play, Users } from 'lucide-react';
import YouTubeThumbnail from './YoutubeThumbnail';

export type PortfolioItemType = 'highlight' | 'choreography' | 'media' | 'directing';

// Union type for all possible portfolio item data
export type PortfolioItemData =
  | HighlightItemData
  | ChoreographyItemData
  | MediaItemData
  | DirectingItemData;

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
      default:
        return null;
    }
  };

  const renderHighlightDetail = (data: HighlightItemData) => {
    return (
      <div className="space-y-6">
        {/* YouTube Video Embed */}
        {data.youtube_link && (
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <YouTubeThumbnail url={data.youtube_link} title={data.title} />
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Title</h3>
            <p className="text-lg font-bold">{data.title}</p>
          </div>

          {data.role && data.role.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Role</h3>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p className="text-base">{data.role.join(', ')}</p>
              </div>
            </div>
          )}

          {data.video_date && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Date</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-base">
                  {new Date(data.video_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* YouTube Link */}
          {data.youtube_link && (
            <div className="pt-4">
              <a
                href={data.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-400 text-black font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                <Play className="h-4 w-4" />
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
      <div className="space-y-6">
        {/* YouTube Video Embed */}
        {data.song.youtube_link && (
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <YouTubeThumbnail
              url={data.song.youtube_link}
              title={`${data.song.singer} - ${data.song.title}`}
            />
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Song</h3>
            <p className="text-lg font-bold">{data.song.title}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Artist</h3>
            <p className="text-base">{data.song.singer}</p>
          </div>

          {data.role && data.role.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Role</h3>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p className="text-base">{data.role.join(', ')}</p>
              </div>
            </div>
          )}

          {data.song.date && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Date</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-base">
                  {new Date(data.song.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* YouTube Link */}
          {data.song.youtube_link && (
            <div className="pt-4">
              <a
                href={data.song.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-400 text-black font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                <Play className="h-4 w-4" />
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
      <div className="space-y-6">
        {/* YouTube Video Embed */}
        {data.youtube_link && (
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <YouTubeThumbnail url={data.youtube_link} title={data.title} />
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Title</h3>
            <p className="text-lg font-bold">{data.title}</p>
          </div>

          {data.role && data.role.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Role</h3>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p className="text-base">{data.role.join(', ')}</p>
              </div>
            </div>
          )}

          {data.video_date && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Date</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-base">
                  {new Date(data.video_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* YouTube Link */}
          {data.youtube_link && (
            <div className="pt-4">
              <a
                href={data.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-400 text-black font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                <Play className="h-4 w-4" />
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
      <div className="space-y-6">
        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Title</h3>
            <p className="text-lg font-bold">{data.title}</p>
          </div>

          {data.date && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Date</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-base">
                  {new Date(data.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {item.type === 'choreography' ? 'Choreography Details' :
             item.type === 'media' ? 'Media Details' :
             item.type === 'directing' ? 'Directing Details' :
             'Highlight Details'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
