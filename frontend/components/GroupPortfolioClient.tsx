'use client';

import { useMemo, useState } from 'react';
import { ArtistCard } from './artist-card';
import SocialSection from './portfolio/SocialSection';
import { PortfolioModal } from './PortfolioModal';
import { PortfolioItemDetailModal, PortfolioItemData } from './PortfolioItemDetailModal';
import YouTubeThumbnail from './YoutubeThumbnail';
import { Award, ChoreographyItem, DirectingItem, MediaItem, PerformanceItem, Workshop } from '@/types/portfolio';
import { PortfolioHeroSection } from './portfolio/PortfolioHeroSection';
import { PortfolioSection } from './portfolio/PortfolioSection';
import { ChoreographyCard, MediaCard, TextCard } from './portfolio/PortfolioCards';
import { usePortfolioSort } from '@/hooks/usePortfolioSort';
import { usePortfolioModal } from '@/hooks/usePortfolioModal';
import { SectionHeaders } from './SectionHeaders';
import Link from 'next/link';
import { User } from 'lucide-react';
import Image from 'next/image';

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

export function GroupPortfolioClient({ group }: { group: GroupPortfolio }) {
  const { sortOrders, toggleSortOrder } = usePortfolioSort();
  const { modalState, openModal, closeModal } = usePortfolioModal();
  const [selectedItem, setSelectedItem] = useState<PortfolioItemData | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const openItemModal = (item: PortfolioItemData) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setSelectedItem(null);
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

  // Sorting helper functions
  const sortChoreographyByDate = (items: typeof mergedPortfolio.choreography) => {
    return [...items].sort((a, b) => {
      const dateA = a.song?.date ? new Date(a.song.date).getTime() : 0;
      const dateB = b.song?.date ? new Date(b.song.date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const sortMediaByDate = (items: typeof mergedPortfolio.media) => {
    return [...items].sort((a, b) => {
      const dateA = a.video_date ? new Date(a.video_date).getTime() : 0;
      const dateB = b.video_date ? new Date(b.video_date).getTime() : 0;
      return dateB - dateA;
    });
  };

  // Transform data for display
  const getChoreographyData = () => {
    const data = mergedPortfolio.choreography;
    if (sortOrders.choreographies === 'date') {
      return sortChoreographyByDate(data);
    }
    return [...data].sort((a, b) => a.display_order - b.display_order);
  };

  const getMediaData = () => {
    const data = mergedPortfolio.media;
    if (sortOrders.media === 'date') {
      return sortMediaByDate(data);
    }
    return [...data].sort((a, b) => a.display_order - b.display_order);
  };

  const getHighlightsData = () => {
    const choreoHighlights = mergedPortfolio.choreography
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.song?.youtube_link || '',
        role: item.role || [],
        display_order: item.display_order,
        title: item.song ? `${item.song.singer} - ${item.song.title}` : 'Untitled',
        video_date: item.song?.date || null,
      }));

    const mediaHighlights = mergedPortfolio.media
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.youtube_link,
        role: item.role ? [item.role] : [],
        display_order: item.display_order,
        title: item.title,
        video_date: item.video_date || null,
      }));

    const combined = [...choreoHighlights, ...mediaHighlights];
    if (sortOrders.highlights === 'date') {
      return sortMediaByDate(combined as any);
    }
    return combined.sort((a, b) => a.display_order - b.display_order);
  };

  const getDirectingData = () => {
    return mergedPortfolio.directing
      .filter(item => item.directing)
      .map(item => item.directing!);
  };

  const getPerformancesData = () => {
    return mergedPortfolio.performances
      .filter(item => item.performance)
      .map(item => item.performance!);
  };

  const getWorkshopsData = () => {
    return mergedPortfolio.workshops;
  };

  return (
    <>
      <PortfolioHeroSection
        photoUrl={group.photo}
        name={group.group_name}
        nameEng={group.group_name_eng}
        heightClass="h-[400px]"
      />

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
        {/* Members Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Members</h2>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="flex gap-4 sm:gap-6 min-w-max">
              {group.members && group.members.map((member, index) => (
                <Link
                  key={index}
                  href={`/${member.artist_id}`}
                  className="flex flex-col items-center group"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-green-400 transition-colors shrink-0">
                    {member.portfolio?.photo ? (
                      <Image
                        src={member.portfolio.photo}
                        alt={member.artist.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm sm:text-base font-medium text-white group-hover:text-green-400 transition-colors text-center">
                    {member.portfolio?.artist_name || member.artist?.name || member.artist_id}
                  </p>
                  {member.is_leader && (
                    <span className="mt-1 text-xs text-blue-400">Leader</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

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
                  <button
                    key={index}
                    onClick={() => openItemModal({
                      type: 'highlight',
                      title: item.title,
                      youtube_link: item.youtube_link || '',
                      role: Array.isArray(item.role) ? item.role.filter((r): r is string => r !== undefined) : [item.role].filter((r): r is string => r !== undefined),
                      video_date: item.video_date ? (typeof item.video_date === 'string' ? item.video_date : item.video_date.toISOString()) : null,
                    })}
                    className="group w-[320px] shrink-0 text-left"
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
                  </button>
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
          <PortfolioSection
            title="Choreographies"
            sortOrder={sortOrders.choreographies}
            onToggleSort={() => toggleSortOrder('choreographies')}
            isEmpty={false}
          >
            <div className="space-y-4">
              {getChoreographyData().slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  onClick={() => openItemModal({
                    type: 'choreography',
                    song: {
                      title: item.song?.title || '',
                      singer: item.song?.singer || '',
                      youtube_link: item.song?.youtube_link || null,
                      date: item.song?.date || null,
                    },
                    role: item.role || [],
                  })}
                  className="cursor-pointer"
                >
                  <ChoreographyCard
                    song={{
                      singer: item.song?.singer || '',
                      title: item.song?.title || '',
                      date: item.song?.date || null,
                    }}
                    role={item.role || []}
                    youtubeLink={item.song?.youtube_link || '#'}
                  />
                </div>
              ))}
            </div>
            {getChoreographyData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('choreographies', 'Choreographies', getChoreographyData() as any)}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </PortfolioSection>
        )}

        {/* Media */}
        {mergedPortfolio.media && mergedPortfolio.media.length > 0 && (
          <PortfolioSection
            title="Media"
            sortOrder={sortOrders.media}
            onToggleSort={() => toggleSortOrder('media')}
            isEmpty={false}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMediaData().slice(0, 4).map((item, index) => (
                <MediaCard
                  key={index}
                  title={item.title}
                  role={item.role ? [item.role] : []}
                  youtubeLink={item.youtube_link}
                  videoDate={item.video_date ? (typeof item.video_date === 'string' ? item.video_date : item.video_date.toISOString()) : null}
                />
              ))}
            </div>
            {getMediaData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('media', 'Media', getMediaData() as any)}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </PortfolioSection>
        )}

        {/* Directing */}
        {mergedPortfolio.directing && mergedPortfolio.directing.length > 0 && (
          <PortfolioSection
            title="Directing"
            sortOrder={sortOrders.directing}
            onToggleSort={() => toggleSortOrder('directing')}
            isEmpty={false}
          >
            <div className="space-y-3">
              {getDirectingData().slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  onClick={() => openItemModal({
                    type: 'directing',
                    title: item.title,
                    date: item.date,
                  })}
                  className="cursor-pointer"
                >
                  <TextCard
                    title={item.title}
                    date={item.date}
                  />
                </div>
              ))}
            </div>
            {getDirectingData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('directing', 'Directing', getDirectingData() as any)}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            )}
          </PortfolioSection>
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
                    {workshop.class_role?.join(', ')} • {workshop.country}
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

      {/* Item Detail Modal */}
      <PortfolioItemDetailModal
        isOpen={isItemModalOpen}
        onClose={closeItemModal}
        item={selectedItem}
      />
    </>
  );
}
