import Image from 'next/image';
import { Instagram, Twitter, Youtube, Mail, Phone, Globe } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';

interface Song {
  title: string;
  singer: string;
  youtube_link?: string;
  date: string;
}

interface Performance {
  performance_title: string;
  date: string;
  category?: string;
}

interface Directing {
  title: string;
  date: string;
}

interface MediaItem {
  youtube_link: string;
  category?: string[];
  is_highlight: boolean;
  display_order: number;
  highlight_display_order?: number;
}

interface ChoreographyItem {
  song?: Song;
  role?: string[];
  is_highlight: boolean;
  display_order: number;
}

interface PerformanceItem {
  performance?: Performance;
}

interface Award {
  award_title: string;
  issuing_org: string;
  received_date: string;
}

interface Workshop {
  class_name: string;
  class_role?: string[];
  country: string;
  class_date: string;
}

interface DirectingItem {
  directing?: Directing;
}

interface TeamMember {
  artist_id: string;
  name: string;
  photo?: { photo?: string };
}

interface Team {
  team_id: string;
  team_name: string;
  team_introduction?: string;
  leader?: TeamMember;
  subleader?: TeamMember;
}

interface TeamMembership {
  team?: Team;
}

interface ArtistPortfolio {
  artist_id: string;
  artist_name: string;
  artist_name_eng?: string;
  introduction?: string;
  photo?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  workshops: Workshop[];
  awards: Award[];
  choreography: ChoreographyItem[];
  media: MediaItem[];
  performances: PerformanceItem[];
  directing: DirectingItem[];
  teams: TeamMembership[];
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function YouTubeThumbnail({ url, title }: { url: string; title?: string }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <Image
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title || 'Video thumbnail'}
        width={320}
        height={150}
        className="object-cover"
      />
      {/* <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
        </div>
      </div> */}
    </div>
  );
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artist: string }>;
}) {
  const { artist: artistId } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Artist not found</h1>
          <p className="text-gray-400">Could not load portfolio for artist ID: {artistId}</p>
          <Link href="main" className='bg-white text-black p-3'>
          Back To Home
          </Link>
        </div>
      </div>
    );
  }

  const portfolio: ArtistPortfolio = await response.json();
  const highlights = portfolio.choreography?.filter(item => item.is_highlight) || [];
  const highlightMedia = portfolio.media?.filter(item => item.is_highlight) || [];
  console.log(portfolio);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <Header />
        {portfolio.photo && (
          <>
            <Image
              src={portfolio.photo}
              alt={portfolio.artist_name}
              fill
              className="object-cover object-top blur-sm"
              priority
            />
            <div className="absolute bottom-0 inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
          </>
        )}

        {/* Artist Info Section */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center">
          {portfolio.photo && (
            <div className="w-32 h-32 rounded-full overflow-hidden border border-white shadow-2xl mb-4">
              <Image
                src={portfolio.photo}
                alt={portfolio.artist_name}
                width={128}
                height={128}
                className="object-cover object-top w-full h-full"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2">{portfolio.artist_name}</h1>
          {portfolio.artist_name_eng && (
            <p className="text-xl text-gray-300">{portfolio.artist_name_eng}</p>
          )}
        </div>

      </div>

      {/* Team Info */}
      {portfolio.teams && portfolio.teams.length > 0 && (
        <div className="">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="flex -space-x-2">
              {portfolio.teams.map((membership, idx) => (
                <div key={idx} className="w-10 h-10 rounded-full border-2 border-black overflow-hidden">
                  {membership.team?.leader?.photo?.photo && (
                    <Image
                      src={membership.team.leader.photo.photo}
                      alt={membership.team.leader.name || 'Team member'}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">
              {portfolio.teams[0]?.team?.team_name}
            </span>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-16">

        {/* Social Links */}
        <section>
          <div className="flex gap-6 justify-center">
            {portfolio.instagram && (
              <a
                href={portfolio.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            )}
            {portfolio.twitter && (
              <a
                href={portfolio.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
            )}
            {portfolio.youtube && (
              <a
                href={portfolio.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </a>
            )}
          </div>
        </section>

        {/* Introduction */}
        {portfolio.introduction && (
          <section>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {portfolio.introduction}
            </p>
          </section>
        )}

        {/* Highlights */}
        {(highlights.length > 0 || highlightMedia.length > 0) && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Highlights</h2>
              <button className="text-green-400 text-sm hover:underline">View All →</button>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {highlights.map((item, index) => (
                  <a
                    key={index}
                    href={item.song?.youtube_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-[320px] flex-shrink-0"
                  >
                    {/* Thumbnail */}
                    <div className="overflow-hidden rounded-2xl bg-zinc-900">
                      {item.song?.youtube_link && (
                        <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
                      )}
                    </div>

                    {/* Content - Below the thumbnail */}
                    <div className="mt-3 px-1">
                      <h3 className="text-base font-bold leading-tight text-white group-hover:text-green-400 transition-colors">
                        {item.song?.singer} - {item.song?.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {item.role?.join(', ')}
                        {item.song?.date && ` · ${new Date(item.song.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace('/', '.')}`}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Choreographies */}
        {portfolio.choreography && portfolio.choreography.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Choreographies</h2>
              <button className="text-green-400 text-sm hover:underline">View All →</button>
            </div>
            <div className="space-y-4">
              {portfolio.choreography.map((item, index) => (
                <a
                  key={index}
                  href={item.song?.youtube_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group items-center"
                >
                  <div className="w-36 h-20 shrink-0">
                    {item.song?.youtube_link && (
                      <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-green-400 transition-colors">
                      {item.song?.singer} - {item.song?.title}
                    </h3>
                    <p className="text-sm text-gray-400">{item.role?.join(', ')}</p>
                    {item.song?.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.song.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {item.is_highlight && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-2xl">★</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Media */}
        {portfolio.media && portfolio.media.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Media</h2>
              <button className="text-green-400 text-sm hover:underline">View All →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolio.media.map((item, index) => (
                <a
                  key={index}
                  href={item.youtube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <YouTubeThumbnail url={item.youtube_link} />
                  </div>
                  {item.category && item.category.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2 truncate">{item.category.join(', ')}</p>
                  )}
                  {item.is_highlight && (
                    <div className="absolute top-2 right-2">
                      <span className="text-yellow-400 text-xl">★</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Directing */}
        {portfolio.directing && portfolio.directing.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Directing</h2>
              <button className="text-green-400 text-sm hover:underline">View All →</button>
            </div>
            <div className="space-y-3">
              {portfolio.directing.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <h3 className="font-semibold">{item.directing?.title}</h3>
                  {item.directing?.date && (
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(item.directing.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Performances */}
        {portfolio.performances && portfolio.performances.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Performances</h2>
              <button className="text-green-400 text-sm hover:underline">View All →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.performances.map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">{item.performance?.performance_title}</h3>
                  {item.performance?.date && (
                    <p className="text-sm text-gray-400">
                      {new Date(item.performance.date).toLocaleDateString()}
                    </p>
                  )}
                  {item.performance?.category && (
                    <p className="text-xs text-gray-500 mt-1">{item.performance.category}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Classes/Workshops */}
        {portfolio.workshops && portfolio.workshops.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Classes</h2>
              <button className="text-green-400 text-sm hover:underline">View All →</button>
            </div>
            <div className="space-y-3">
              {portfolio.workshops.map((workshop, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <h3 className="font-semibold">{workshop.class_name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {workshop.class_role?.join(', ')} • {workshop.country}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(workshop.class_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Information */}
        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-6">Contact</h2>
          <div className="space-y-3 text-gray-400">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <a href="mailto:contact@example.com" className="hover:text-white transition-colors">
                contact@example.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>+82-10-0000-0000</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" />
              <a href="#" className="hover:text-white transition-colors">
                www.example.com
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>© {new Date().getFullYear()} {portfolio.artist_name}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
