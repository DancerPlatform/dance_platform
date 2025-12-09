'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ArtistCard } from './artist-card';
import SocialSection from './portfolio/SocialSection';
import { PortfolioModal, PortfolioSectionType, PortfolioData } from './PortfolioModal';
import YouTubeThumbnail from './YoutubeThumbnail';
import { Award, ChoreographyItem, DirectingItem, MediaItem, PerformanceItem, Workshop } from '@/types/portfolio';
import { SectionHeaders } from './SectionHeaders';

interface ArtistInfo {
  artist_id: string;
  name: string;
  email: string;
  phone: string;
  birth: string | null;
}

interface PortfolioInfo {
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
}

interface GroupMember {
  artist_id: string;
  is_leader: boolean;
  joined_date: string | null;
  artist: ArtistInfo;
  portfolio: PortfolioInfo;
}

export interface GroupPortfolio {
  group_id: string;
  group_name: string;
  group_name_eng?: string;
  introduction?: string;
  photo?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  created_at?: string;
  members: GroupMember[];
  // Team portfolio data (from team_ tables)
  workshops?: Workshop[];
  awards?: Award[];
  choreography?: ChoreographyItem[];
  media?: MediaItem[];
  performances?: PerformanceItem[];
  directing?: DirectingItem[];
}

type SortOrder = 'display_order' | 'date';

export function GroupPortfolioClient({ group }: { group: GroupPortfolio }) {
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

  // Sort order state for each section
  const [sortOrders, setSortOrders] = useState<Record<string, SortOrder>>({
    highlights: 'display_order',
    choreographies: 'display_order',
    media: 'display_order',
    directing: 'display_order',
    performances: 'display_order',
    workshops: 'display_order',
  });

  const toggleSortOrder = (section: string) => {
    setSortOrders(prev => ({
      ...prev,
      [section]: prev[section] === 'display_order' ? 'date' : 'display_order'
    }));
  };

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

  // Use team portfolio data directly from the API response
  const mergedPortfolio = useMemo(() => {
    return {
      choreography: group.choreography || [],
      media: group.media || [],
      performances: group.performances || [],
      directing: group.directing || [],
      workshops: group.workshops || [],
      awards: group.awards || [],
    };
  }, [group.choreography, group.media, group.performances, group.directing, group.workshops, group.awards]);

  // Sorting helper functions (same as ArtistPortfolioClient)
  const sortChoreographyByDate = (items: { song: { title: string; singer: string; youtube_link: string | null; date: string | null }; role: string[]; is_highlight: boolean; display_order: number }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.song?.date ? new Date(a.song.date).getTime() : 0;
      const dateB = b.song?.date ? new Date(b.song.date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const sortMediaByDate = (items: { youtube_link: string; role: string[]; is_highlight: boolean; display_order: number; title: string; video_date: string | null }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.video_date ? new Date(a.video_date).getTime() : 0;
      const dateB = b.video_date ? new Date(b.video_date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const sortDirectingByDate = (items: { title: string; date: string | null }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const sortPerformancesByDate = (items: { performance_title: string; date: string | null; category: string | null }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const sortWorkshopsByDate = (items: { class_name: string; class_role: string[]; country: string | null; class_date: string | null }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.class_date ? new Date(a.class_date).getTime() : 0;
      const dateB = b.class_date ? new Date(b.class_date).getTime() : 0;
      return dateB - dateA;
    });
  };

  // Transform data for modal (same as ArtistPortfolioClient)
  const getChoreographyData = () => {
    const data = mergedPortfolio.choreography.map(item => ({
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

    if (sortOrders.choreographies === 'date') {
      return sortChoreographyByDate(data);
    }
    return data.sort((a, b) => a.display_order - b.display_order);
  };

  const getMediaData = () => {
    const data = mergedPortfolio.media.map(item => ({
      youtube_link: item.youtube_link,
      role: item.role ? [item.role] : [],
      is_highlight: item.is_highlight,
      display_order: item.display_order,
      title: item.title,
      video_date: item.video_date ? new Date(item.video_date).toISOString() : null,
    }));

    if (sortOrders.media === 'date') {
      return sortMediaByDate(data);
    }
    return data.sort((a, b) => a.display_order - b.display_order);
  };

  const getHighlightsData = () => {
    const choreoHighlights = mergedPortfolio.choreography
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.song?.youtube_link || '',
        role: item.role || [],
        is_highlight: true,
        display_order: item.display_order,
        title: item.song ? `${item.song.singer} - ${item.song.title}` : 'Untitled',
        video_date: item.song?.date || null,
      }));

    const mediaHighlights = mergedPortfolio.media
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.youtube_link,
        role: item.role ? [item.role] : [],
        is_highlight: item.is_highlight,
        display_order: item.display_order,
        title: item.title,
        video_date: item.video_date ? new Date(item.video_date).toISOString() : null,
      }));

    const combined = [...choreoHighlights, ...mediaHighlights];

    if (sortOrders.highlights === 'date') {
      return sortMediaByDate(combined);
    }
    return combined.sort((a, b) => a.display_order - b.display_order);
  };

  const getDirectingData = () => {
    const data = mergedPortfolio.directing
      .filter(item => item.directing)
      .map(item => ({
        title: item.directing!.title,
        date: item.directing!.date,
      }));

    if (sortOrders.directing === 'date') {
      return sortDirectingByDate(data);
    }
    return data;
  };

  const getPerformancesData = () => {
    const data = mergedPortfolio.performances
      .filter(item => item.performance)
      .map(item => ({
        performance_title: item.performance!.performance_title,
        date: item.performance!.date,
        category: item.performance!.category || null,
      }));

    if (sortOrders.performances === 'date') {
      return sortPerformancesByDate(data);
    }
    return data;
  };

  const getWorkshopsData = () => {
    const data = mergedPortfolio.workshops.map(workshop => ({
      class_name: workshop.class_name,
      class_role: workshop.class_role || [],
      country: workshop.country,
      class_date: workshop.class_date,
    }));

    if (sortOrders.workshops === 'date') {
      return sortWorkshopsByDate(data);
    }
    return data;
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        {group.photo && (
          <>
            <Image
              src={group.photo}
              alt={group.group_name}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute bottom-0 inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
          </>
        )}

        {/* Group Info Section */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2">{group.group_name}</h1>
          {group.group_name_eng && (
            <p className="text-xl text-gray-300">{group.group_name_eng}</p>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Introduction */}
        {group.introduction && (
          <section>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {group.introduction}
            </p>
          </section>
        )}

        {/* Social Links */}
        <SocialSection
          instagram={group.instagram}
          twitter={group.twitter}
          youtube={group.youtube}
        />

        {/* Highlights */}
        {(getHighlightsData().length > 0) && (
          <section>
            <SectionHeaders
              title="Highlights"
              sortOrder={sortOrders.highlights}
              onToggleSort={() => toggleSortOrder('highlights')}
            />
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {getHighlightsData().slice(0, 4).map((item, index) => (
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
            {getHighlightsData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('highlights', 'Highlights', getHighlightsData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Choreographies */}
        {mergedPortfolio.choreography && mergedPortfolio.choreography.length > 0 && (
          <section>
            <SectionHeaders
              title="Choreographies"
              sortOrder={sortOrders.choreographies}
              onToggleSort={() => toggleSortOrder('choreographies')}
            />
            <div className="space-y-4">
              {getChoreographyData().slice(0, 4).map((item, index) => (
                <a
                  key={index}
                  href={item.song.youtube_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group items-center"
                >
                  <div className="w-36 h-20 shrink-0 rounded-sm overflow-hidden">
                    {item.song.youtube_link && (
                      <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-green-400 transition-colors">
                      {item.song.singer} - {item.song.title}
                    </h3>
                    <p className="text-sm text-gray-400">{item.role.join(', ')}</p>
                    {item.song.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.song.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
            {getChoreographyData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('choreographies', 'Choreographies', getChoreographyData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Media */}
        {mergedPortfolio.media && mergedPortfolio.media.length > 0 && (
          <section>
            <SectionHeaders
              title="Media"
              sortOrder={sortOrders.media}
              onToggleSort={() => toggleSortOrder('media')}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMediaData().slice(0, 4).map((item, index) => (
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
                    {item.role.join(', ')}
                    {item.video_date && (
                      <span> · {new Date(item.video_date).getFullYear()}.{String(new Date(item.video_date).getMonth() + 1).padStart(2, '0')}</span>
                    )}
                  </p>
                </a>
              ))}
            </div>
            {getMediaData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('media', 'Media', getMediaData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Directing */}
        {mergedPortfolio.directing && mergedPortfolio.directing.length > 0 && (
          <section>
            <SectionHeaders
              title="Directing"
              sortOrder={sortOrders.directing}
              onToggleSort={() => toggleSortOrder('directing')}
            />
            <div className="space-y-3">
              {getDirectingData().slice(0, 4).map((item, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.date && (
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(item.date).getFullYear()}.{String(new Date(item.date).getMonth() + 1).padStart(2, '0')}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {getDirectingData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('directing', 'Directing', getDirectingData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Performances */}
        {mergedPortfolio.performances && mergedPortfolio.performances.length > 0 && (
          <section>
            <SectionHeaders
              title="Performances"
              sortOrder={sortOrders.performances}
              onToggleSort={() => toggleSortOrder('performances')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPerformancesData().slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">{item.performance_title}</h3>
                  {item.date && (
                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  )}
                  {item.category && (
                    <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                  )}
                </div>
              ))}
            </div>
            {getPerformancesData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('performances', 'Performances', getPerformancesData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Classes/Workshops */}
        {mergedPortfolio.workshops && mergedPortfolio.workshops.length > 0 && (
          <section>
            <SectionHeaders
              title="Classes"
              sortOrder={sortOrders.workshops}
              onToggleSort={() => toggleSortOrder('workshops')}
            />
            <div className="space-y-3">
              {getWorkshopsData().slice(0, 4).map((workshop, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold">{workshop.class_name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {workshop.class_role.join(', ')} • {workshop.country}
                  </p>
                  {workshop.class_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(workshop.class_date).getFullYear()}.{String(new Date(workshop.class_date).getMonth() + 1).padStart(2, '0')}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {getWorkshopsData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('workshops', 'Classes & Workshops', getWorkshopsData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Members Section */}
        {group.members && group.members.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Members</h2>
              <p className="text-gray-400 text-sm mt-2">
                {group.members.length} member{group.members.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {group.members.map((member) => (
                <ArtistCard
                  key={member.artist_id}
                  artistId={member.artist_id}
                  nameEN={`${member.portfolio.artist_name_eng}`}
                  nameKR={member.portfolio.artist_name}
                  imageUrl={member.portfolio.photo as string}
                />
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
