'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ArtistPortfolioClient.css';
import { PortfolioModal } from './PortfolioModal';
import { PortfolioItemDetailModal, PortfolioItemData } from './PortfolioItemDetailModal';
import YouTubeThumbnail from './YoutubeThumbnail';
import { Award, ChoreographyItem, DirectingItem, MediaItem, PerformanceItem, TeamMembership, Workshop } from '@/types/portfolio';
import SocialSection from './portfolio/SocialSection';
import { ClaimPortfolioButton } from './ClaimPortfolioButton';
import { PortfolioHeroSection } from './portfolio/PortfolioHeroSection';
import { PortfolioSection } from './portfolio/PortfolioSection';
import { ChoreographyCard, MediaCard, TextCard } from './portfolio/PortfolioCards';
import { VideoCarousel } from './portfolio/VideoCarousel';
import { usePortfolioSort } from '@/hooks/usePortfolioSort';
import { usePortfolioModal } from '@/hooks/usePortfolioModal';
import { chunkArray } from '@/lib/portfolioUtils';
import { useState } from 'react';
import { Home, MoreVertical, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
  artist_user?: {
    auth_id: string | null;
    email: string;
    phone: string;
    name: string;
  };
}

export function ArtistPortfolioClient({ portfolio }: { portfolio: ArtistPortfolio }) {
  const {user} = useAuth();
  const { sortOrders, toggleSortOrder } = usePortfolioSort();
  const { modalState, openModal, closeModal } = usePortfolioModal();
  const [selectedItem, setSelectedItem] = useState<PortfolioItemData | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openItemModal = (item: PortfolioItemData) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setSelectedItem(null);
  };

  // Helper function to chunk array into groups - using imported function
  const chunkArrayLocal = <T,>(array: T[], size: number): T[][] => {
    return chunkArray(array, size);
  };

  // Keep local reference for backward compatibility
  const chunkArrayFn = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Helper function to check if date should be shown (hide if year is 1111)
  const shouldShowDate = (dateString: string | null): boolean => {
    if (!dateString) return false;
    const year = new Date(dateString).getFullYear();
    return year !== 1111;
  };

  // Sorting helper functions
  const sortChoreographyByDate = (items: { song: { title: string; singer: string; youtube_link: string | null; date: string | null }; role: string[]; is_highlight: boolean; display_order: number }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.song?.date ? new Date(a.song.date).getTime() : 0;
      const dateB = b.song?.date ? new Date(b.song.date).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  };

  const sortMediaByDate = (items: { youtube_link: string; role: string[]; is_highlight: boolean; display_order: number; title: string; video_date: string | null }[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.video_date ? new Date(a.video_date).getTime() : 0;
      const dateB = b.video_date ? new Date(b.video_date).getTime() : 0;
      return dateB - dateA; // Most recent first
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

  // Transform data for modal
  const getChoreographyData = () => {
    const data = portfolio.choreography.map(item => ({
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
    const data = portfolio.media.map(item => ({
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

    // Combine and sort
    const combined = [...choreoHighlights, ...mediaHighlights];

    if (sortOrders.highlights === 'date') {
      return sortMediaByDate(combined);
    }
    return combined.sort((a, b) => a.display_order - b.display_order);
  };

  const getDirectingData = () => {
    const data = portfolio.directing
      .filter(item => item.directing)
      .map(item => ({
        title: item.directing!.title,
        date: item.directing!.date,
      }));

    if (sortOrders.directing === 'date') {
      return sortDirectingByDate(data);
    }
    return data; // Original order (no display_order field for directing)
  };

  const getPerformancesData = () => {
    const data = portfolio.performances
      .filter(item => item.performance)
      .map(item => ({
        performance_title: item.performance!.performance_title,
        date: item.performance!.date,
        category: item.performance!.category || null,
      }));

    if (sortOrders.performances === 'date') {
      return sortPerformancesByDate(data);
    }
    return data; // Original order (no display_order field for performances)
  };

  const getWorkshopsData = () => {
    const data = portfolio.workshops.map(workshop => ({
      class_name: workshop.class_name,
      class_role: workshop.class_role || [],
      country: workshop.country,
      class_date: workshop.class_date,
    }));

    if (sortOrders.workshops === 'date') {
      return sortWorkshopsByDate(data);
    }
    return data; // Original order (no display_order field for workshops)
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
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white hover:text-green-400 transition-colors">
            <Home size={24} />
          </Link>
          <button
            onClick={() => setIsSignupModalOpen(true)}
            className={`${user ? "hidden" : "block"} text-white hover:text-green-400 transition-colors`}
          >
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* Add padding to account for fixed header */}
      <div className="">
        <PortfolioHeroSection
          photoUrl={portfolio.photo}
          name={portfolio.artist_name}
          nameEng={portfolio.artist_name_eng}
          heightClass="h-[500px]"
        />
      </div>


      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Team Info */}
        {portfolio.teams && portfolio.teams.length > 0 && (
          <div className="flex w-full items-center gap-3">
            <div className="size-20 rounded-sm overflow-hidden shrink-0">
              {portfolio.teams[0]?.team?.photo && (
                <Image
                  src={portfolio.teams[0].team.photo}
                  alt={portfolio.teams[0].team.team_name}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="flex flex-col justify-between h-20">
              <p className="text-xs bg-gray-400 text-black w-fit px-1 rounded-xs font-bold">Team</p>
              <p className="text-md text-white">
                {portfolio.teams[0]?.team?.team_name}
              </p>
              <p className="text-sm text-gray-400">
                {portfolio.teams[0]?.team?.leader?.artist_id == portfolio.artist_id ? "리더" : "멤버"}
              </p>
            </div>
          </div>
        )}

        {/* Introduction */}
        {portfolio.introduction && (
          <section>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {portfolio.introduction}
            </p>
          </section>
        )}

        {/* Social Links */}
        <SocialSection 
          instagram={portfolio.instagram}
          twitter={portfolio.twitter}
          youtube={portfolio.youtube}
        />

        {/* Highlights */}
        {(getHighlightsData().length > 0) && (
          <PortfolioSection
            title="Highlights"
            sortOrder={sortOrders.highlights}
            onToggleSort={() => toggleSortOrder('highlights')}
            isEmpty={false}
          >
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {getHighlightsData().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => openItemModal({
                      type: 'highlight',
                      title: item.title,
                      youtube_link: item.youtube_link || '',
                      role: item.role,
                      video_date: item.video_date,
                    })}
                    className="group w-[250px] shrink-0 text-left"
                  >
                    <div className="overflow-hidden rounded-sm bg-zinc-900">
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
                        {shouldShowDate(item.video_date) && ` · ${new Date(item.video_date!).getFullYear()}.${String(new Date(item.video_date!).getMonth() + 1).padStart(2, '0')}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PortfolioSection>
        )}

        {/* Choreographies */}
        {portfolio.choreography && portfolio.choreography.length > 0 && (
          <PortfolioSection
            title="Choreographies"
            sortOrder={sortOrders.choreographies}
            onToggleSort={() => toggleSortOrder('choreographies')}
            isEmpty={false}
          >
            <VideoCarousel
              items={getChoreographyData()}
              itemsPerSlide={4}
              renderItem={(item) => (
                <div
                  onClick={() => openItemModal({
                    type: 'choreography',
                    song: {
                      title: item.song.title,
                      singer: item.song.singer,
                      youtube_link: item.song.youtube_link,
                      date: item.song.date,
                    },
                    role: item.role,
                  })}
                  className="cursor-pointer"
                >
                  <ChoreographyCard
                    song={{
                      singer: item.song.singer,
                      title: item.song.title,
                      date: item.song.date,
                    }}
                    role={item.role}
                    youtubeLink={item.song.youtube_link || '#'}
                  />
                </div>
              )}
            />
          </PortfolioSection>
        )}

        {/* Media */}
        {portfolio.media && portfolio.media.length > 0 && (
          <PortfolioSection
            title="Media"
            sortOrder={sortOrders.media}
            onToggleSort={() => toggleSortOrder('media')}
            isEmpty={false}
          >
            <VideoCarousel
              items={getMediaData()}
              itemsPerSlide={4}
              gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              renderItem={(item) => (
                <div
                  onClick={() => openItemModal({
                    type: 'media',
                    title: item.title,
                    youtube_link: item.youtube_link,
                    role: item.role
                  })}
                  className="cursor-pointer"
                >
                  <MediaCard
                    title={item.title}
                    role={item.role}
                    youtubeLink={item.youtube_link}
                    videoDate={item.video_date}
                  />
                </div>
              )}
            />
          </PortfolioSection>
        )}

        {/* Directing */}
        {portfolio.directing && portfolio.directing.length > 0 && (
          <PortfolioSection
            title="Directing"
            sortOrder={sortOrders.directing}
            onToggleSort={() => toggleSortOrder('directing')}
            isEmpty={false}
          >
            <VideoCarousel
              items={getDirectingData()}
              itemsPerSlide={3}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              renderItem={(item) => (
                <div
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
              )}
            />
          </PortfolioSection>
        )}

        {/* Performances */}
        {portfolio.performances && portfolio.performances.length > 0 && (
          <PortfolioSection
            title="Performances"
            sortOrder={sortOrders.performances}
            onToggleSort={() => toggleSortOrder('performances')}
            isEmpty={false}
          >
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              className="pb-12!"
            >
              {chunkArray(getPerformancesData(), 4).map((chunk, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chunk.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <h3 className="font-semibold text-lg mb-2">{item.performance_title}</h3>
                        {shouldShowDate(item.date) && (
                          <p className="text-sm text-gray-400">
                            {new Date(item.date!).getFullYear()}.{String(new Date(item.date!).getMonth() + 1).padStart(2, '0')}
                          </p>
                        )}
                        {item.category && (
                          <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </PortfolioSection>
        )}

        {/* Classes/Workshops */}
        {portfolio.workshops && portfolio.workshops.length > 0 && (
          <PortfolioSection
            title="Classes"
            sortOrder={sortOrders.workshops}
            onToggleSort={() => toggleSortOrder('workshops')}
            isEmpty={false}
          >
            <Swiper
              modules={[Pagination]}
              spaceBetween={12}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              className="pb-12!"
            >
              {chunkArray(getWorkshopsData(), 3).map((chunk, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chunk.map((workshop, itemIndex) => (
                      <div
                        key={itemIndex}
                        onClick={() => openItemModal({
                          type: 'workshop',
                          class_name: workshop.class_name,
                          class_role: workshop.class_role || [],
                          country: workshop.country,
                          class_date: workshop.class_date,
                        })}
                        className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <h3 className="font-semibold">{workshop.class_name}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {workshop.class_role.join(', ')} • {workshop.country}
                        </p>
                        {shouldShowDate(workshop.class_date) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(workshop.class_date!).getFullYear()}.{String(new Date(workshop.class_date!).getMonth() + 1).padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </PortfolioSection>
        )}

        {/* Awards */}
        {portfolio.awards && portfolio.awards.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Awards</h2>
            <Swiper
              modules={[Pagination]}
              spaceBetween={12}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              className="pb-12!"
            >
              {chunkArray(getAwardsData(), 3).map((chunk, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chunk.map((award, itemIndex) => (
                      <div
                        key={itemIndex}
                        onClick={() => openItemModal({
                          type: 'award',
                          award_title: award.award_title,
                          issuing_org: award.issuing_org,
                          received_date: award.received_date,
                        })}
                        className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <h3 className="font-semibold">{award.award_title}</h3>
                        {award.issuing_org && (
                          <p className="text-sm text-gray-400 mt-1">{award.issuing_org}</p>
                        )}
                        {shouldShowDate(award.received_date) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(award.received_date!).getFullYear()}.{String(new Date(award.received_date!).getMonth() + 1).padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
        <Link href="/signup/artist" className={`${user ? 'hidden' : 'block'} py-3 bg-green-600 w-full text-center rounded-sm hover:bg-green-800`}>
          Create your own portfolio
        </Link>
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

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-zinc-900 rounded-lg p-8 max-w-md w-full mx-4 border border-white/10">
            <button
              onClick={() => setIsSignupModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mt-2">
              <h2 className="text-2xl font-bold text-white mb-4">
                Create Your Portfolio
              </h2>
              <div className='mb-6 text-center'>
                <p className="text-gray-300">
                  Want to make your own portfolio or claim this portfolio? <span className='text-white'>Join us now</span>
                </p>
              </div>
              <Link
                href="/signup/artist"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
