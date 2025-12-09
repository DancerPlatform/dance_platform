import YouTubeThumbnail from "../YoutubeThumbnail";


// Choreography Item Card
interface ChoreographyCardProps {
  song: {
    singer: string;
    title: string;
    date?: string | null;
  };
  role: string[];
  youtubeLink: string;
}

export function ChoreographyCard({ song, role, youtubeLink }: ChoreographyCardProps) {
  const formattedDate = song.date
    ? new Date(song.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null;

  return (
    <a
      href={youtubeLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group items-center"
    >
      <div className="w-36 h-20 shrink-0 rounded-sm overflow-hidden bg-gray-800">
        <YouTubeThumbnail url={youtubeLink} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate group-hover:text-green-400 transition-colors">
          {song.singer} - {song.title}
        </h3>
        <p className="text-sm text-gray-400 truncate">{role.join(', ')}</p>
        {formattedDate && (
          <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
        )}
      </div>
    </a>
  );
}

// Media Grid Item Card
interface MediaCardProps {
  title: string;
  role: string[];
  youtubeLink: string;
  videoDate?: string | null;
}

export function MediaCard({ title, role, youtubeLink, videoDate }: MediaCardProps) {
  const formattedDate = videoDate
    ? new Date(videoDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null;

  return (
    <a
      href={youtubeLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block"
    >
      <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
        <YouTubeThumbnail url={youtubeLink} />
      </div>
      <p className="text-sm text-white mt-1 truncate group-hover:text-green-400 transition-colors">
        {title}
      </p>
      <p className="text-xs text-gray-400 truncate">
        {role.join(', ')}
        {formattedDate && ` · ${formattedDate}`}
      </p>
    </a>
  );
}

// Text-Only Card (for Directing, Workshops, Awards)
interface TextCardProps {
  title: string;
  date?: string | null;
  dateLabel?: string;
}

export function TextCard({ title, date, dateLabel }: TextCardProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null;

  return (
    <div className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <h3 className="font-semibold">{title}</h3>
      {formattedDate && (
        <p className="text-sm text-gray-400 mt-1">
          {dateLabel && `${dateLabel}: `}
          {formattedDate}
        </p>
      )}
    </div>
  );
}

// Highlight Card (can be either choreography or media)
interface HighlightCardProps {
  item: {
    type: 'choreography' | 'media';
    song?: {
      singer: string;
      title: string;
      date?: string | null;
    };
    title?: string;
    role: string[];
    youtube_link: string;
    video_date?: string | null;
  };
}

export function HighlightCard({ item }: HighlightCardProps) {
  if (item.type === 'choreography' && item.song) {
    return (
      <ChoreographyCard
        song={item.song}
        role={item.role}
        youtubeLink={item.youtube_link}
      />
    );
  }

  if (item.type === 'media') {
    return (
      <MediaCard
        title={item.title || ''}
        role={item.role}
        youtubeLink={item.youtube_link}
        videoDate={item.video_date}
      />
    );
  }

  return null;
}
