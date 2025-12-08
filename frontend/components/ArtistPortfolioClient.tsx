'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ArtistPortfolioClient.css';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { PortfolioModal, PortfolioSectionType, PortfolioData } from './PortfolioModal';
import YouTubeThumbnail from './YoutubeThumbnail';
import { Award, ChoreographyItem, DirectingItem, MediaItem, PerformanceItem, TeamMembership, Workshop } from '@/types/portfolio';
import SocialSection from './portfolio/SocialSection';
import { SectionHeaders } from './SectionHeaders';
import { ClaimPortfolioButton } from './ClaimPortfolioButton';

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

type SortOrder = 'display_order' | 'date';

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

  // Helper function to chunk array into groups
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
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
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        {portfolio.photo && (
          <>
            <Image
              src={portfolio.photo}
              alt={portfolio.artist_name}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute bottom-0 inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
          </>
        )}

        {/* Artist Info Section */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center">
          {/* {portfolio.photo && (
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
          )} */}
          <h1 className="text-4xl font-bold mb-2">{portfolio.artist_name}</h1>
          {portfolio.artist_name_eng && (
            <p className="text-xl text-gray-300">{portfolio.artist_name_eng}</p>
          )}
        </div>
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
          <section>
            <SectionHeaders
              title="Highlights"
              sortOrder={sortOrders.highlights}
              onToggleSort={() => toggleSortOrder('highlights')}
            />
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {getHighlightsData().map((item, index) => (
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
            {/* {getHighlightsData().length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => openModal('highlights', 'Highlights', getHighlightsData())}
                  className="text-green-400 text-sm hover:underline"
                > 
                  View All →
                </button>
              </div>
            )} */}
          </section>
        )}

        {/* Choreographies */}
        {portfolio.choreography && portfolio.choreography.length > 0 && (
          <section>
            <SectionHeaders
              title="Choreographies"
              sortOrder={sortOrders.choreographies}
              onToggleSort={() => toggleSortOrder('choreographies')}
            />
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              className="pb-12!"
            >
              {chunkArray(getChoreographyData(), 4).map((chunk, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="space-y-4">
                    {chunk.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
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
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Media */}
        {portfolio.media && portfolio.media.length > 0 && (
          <section>
            <SectionHeaders
              title="Media"
              sortOrder={sortOrders.media}
              onToggleSort={() => toggleSortOrder('media')}
            />
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              className="pb-12!"
            >
              {chunkArray(getMediaData(), 4).map((chunk, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chunk.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
                        href={item.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block"
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
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Directing */}
        {portfolio.directing && portfolio.directing.length > 0 && (
          <section>
            <SectionHeaders
              title="Directing"
              sortOrder={sortOrders.directing}
              onToggleSort={() => toggleSortOrder('directing')}
            />
            <Swiper
              modules={[Pagination]}
              spaceBetween={12}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              className="pb-12!"
            >
              {chunkArray(getDirectingData(), 3).map((chunk, slideIndex) => (
                <SwiperSlide key={slideIndex}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chunk.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.date && (
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(item.date).getFullYear()}.{String(new Date(item.date).getMonth() + 1).padStart(2, '0')}
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

        {/* Performances */}
        {portfolio.performances && portfolio.performances.length > 0 && (
          <section>
            <SectionHeaders
              title="Performances"
              sortOrder={sortOrders.performances}
              onToggleSort={() => toggleSortOrder('performances')}
            />
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
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Classes/Workshops */}
        {portfolio.workshops && portfolio.workshops.length > 0 && (
          <section>
            <SectionHeaders
              title="Classes"
              sortOrder={sortOrders.workshops}
              onToggleSort={() => toggleSortOrder('workshops')}
            />
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
                      <div key={itemIndex} className="p-4 bg-white/5 rounded-lg">
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
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
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
                      <div key={itemIndex} className="p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold">{award.award_title}</h3>
                        {award.issuing_org && (
                          <p className="text-sm text-gray-400 mt-1">{award.issuing_org}</p>
                        )}
                        {award.received_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(award.received_date).toLocaleDateString()}
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
