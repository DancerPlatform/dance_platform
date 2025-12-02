'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { PortfolioModal, PortfolioSectionType, PortfolioData } from './PortfolioModal';
import YouTubeThumbnail from './YoutubeThumbnail';
import { Award, ChoreographyItem, DirectingItem, MediaItem, PerformanceItem, TeamMembership, Workshop } from '@/types/portfolio';

export interface ArtistPortfolio {
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

export function ArtistPortfolioClient({ portfolio }: { portfolio: ArtistPortfolio }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    sectionType: PortfolioSectionType | null;
    sectionTitle: string;
    data: PortfolioData;
  }>({
    isOpen: false,
    sectionType: null,
    sectionTitle: '',
    data: [],
  });

//   const highlights = portfolio.choreography?.filter(item => item.is_highlight).map((item) => ({
//   youtube_link: `${item.song?.youtube_link}`,
//   title: `${item.song?.singer} - ${item.song?.title}`,
//   role: `${item.role}`,
//   date: `${item.song?.date}`
// })) || [];

//   const highlightMedia = portfolio.media?.filter(item => item.is_highlight).map((item) => ({
//     youtube_link: `${item.youtube_link}`,
//     title: item.title,
//     role: `${item.role}`,
//     date: `${item.video_date}`
//   })) || [];
//   const joinedHighlights = [...highlights, ...highlightMedia];

  const openModal = (
    sectionType: PortfolioSectionType,
    sectionTitle: string,
    data: PortfolioData
  ) => {
    setModalState({
      isOpen: true,
      sectionType,
      sectionTitle,
      data,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      sectionType: null,
      sectionTitle: '',
      data: [],
    });
  };

  // Transform data for modal
  const getChoreographyData = () => {
    return portfolio.choreography.map(item => ({
      song: {
        title: item.song?.title || '',
        singer: item.song?.singer || '',
        youtube_link: item.song?.youtube_link || null,
        date: item.song?.date || null,
      },
      role: item.role || [],
      is_highlight: item.is_highlight,
      display_order: item.display_order,
    }));
  };

  const getMediaData = () => {
    return portfolio.media.map(item => ({
      youtube_link: item.youtube_link,
      role: item.role ? [item.role] : [],
      is_highlight: item.is_highlight,
      display_order: item.display_order,
      title: item.title,
      video_date: item.video_date ? new Date(item.video_date).toISOString() : null,
    }));
  };

  const getHighlightsData = () => {
    // Combine both choreography highlights (as media items) and media highlights
    const choreoHighlights = portfolio.choreography
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.song?.youtube_link || '',
        role: item.role || [],
        is_highlight: true,
        display_order: item.display_order,
        title: item.song ? `${item.song.singer} - ${item.song.title}` : 'Untitled',
        video_date: item.song?.date || null,
      }));

    const mediaHighlights = portfolio.media
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.youtube_link,
        role: item.role ? [item.role] : [],
        is_highlight: item.is_highlight,
        display_order: item.display_order,
        title: item.title,
        video_date: item.video_date ? new Date(item.video_date).toISOString() : null,
      }));

    // Combine and sort by display_order
    return [...choreoHighlights, ...mediaHighlights].sort((a, b) => a.display_order - b.display_order);
  };

  const getDirectingData = () => {
    return portfolio.directing
      .filter(item => item.directing)
      .map(item => ({
        title: item.directing!.title,
        date: item.directing!.date,
      }));
  };

  const getPerformancesData = () => {
    return portfolio.performances
      .filter(item => item.performance)
      .map(item => ({
        performance_title: item.performance!.performance_title,
        date: item.performance!.date,
        category: item.performance!.category || null,
      }));
  };

  const getWorkshopsData = () => {
    return portfolio.workshops.map(workshop => ({
      class_name: workshop.class_name,
      class_role: workshop.class_role || [],
      country: workshop.country,
      class_date: workshop.class_date,
    }));
  };

  const getAwardsData = () => {
    return portfolio.awards.map(award => ({
      award_title: award.award_title,
      issuing_org: award.issuing_org,
      received_date: award.received_date,
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
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
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
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
        {(getHighlightsData().length > 0) && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Highlights</h2>
              <button
                onClick={() => openModal('highlights', 'Highlights', getHighlightsData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {getHighlightsData().slice(0, 5).map((item, index) => (
                  <a
                    key={index}
                    href={item.youtube_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-[320px] shrink-0"
                  >
                    <div className="overflow-hidden rounded-xl bg-zinc-900">
                      {item.youtube_link && (
                        <YouTubeThumbnail url={item.youtube_link} title={item.title} />
                      )}
                    </div>
                    <div className="mt-3 px-1">
                      <h3 className="text-base font-bold leading-tight text-white group-hover:text-green-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {item.role}
                        {item.video_date && ` · ${new Date(item.video_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace('/', '.')}`}
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
              <button
                onClick={() => openModal('choreographies', 'Choreographies', getChoreographyData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {portfolio.choreography.slice(0, 5).map((item, index) => (
                <a
                  key={index}
                  href={item.song?.youtube_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group items-center"
                >
                  <div className="w-36 h-20 shrink-0 rounded-sm overflow-hidden">
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
              <button
                onClick={() => openModal('media', 'Media', getMediaData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...portfolio.media].sort((a, b) => a.display_order - b.display_order).slice(0, 8).map((item, index) => (
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
                  <p className="text-sm text-white mt-1 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {item.role}
                    {item.video_date && (
                      <span> · {new Date(item.video_date).getFullYear()}.{String(new Date(item.video_date).getMonth() + 1).padStart(2, '0')}</span>
                    )}
                  </p>
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
              <button
                onClick={() => openModal('directing', 'Directing', getDirectingData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {portfolio.directing.slice(0, 5).map((item, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold">{item.directing?.title}</h3>
                  {item.directing?.date && (
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(item.directing.date).getFullYear()}.{String(new Date(item.directing.date).getMonth() + 1).padStart(2, '0')}
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
              <button
                onClick={() => openModal('performances', 'Performances', getPerformancesData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.performances.slice(0, 4).map((item, index) => (
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
              <button
                onClick={() => openModal('workshops', 'Classes & Workshops', getWorkshopsData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {portfolio.workshops.slice(0, 5).map((workshop, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold">{workshop.class_name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {workshop.class_role?.join(', ')} • {workshop.country}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(workshop.class_date).getFullYear()}.{String(new Date(workshop.class_date).getMonth() + 1).padStart(2, '0')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal */}
      {modalState.sectionType && (
        <PortfolioModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          sectionType={modalState.sectionType}
          sectionTitle={modalState.sectionTitle}
          data={modalState.data}
        />
      )}
    </>
  );
}
