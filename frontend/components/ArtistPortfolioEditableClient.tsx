'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ArtistPortfolioClient.css';
import { PortfolioModal, PortfolioSectionType } from './PortfolioModal';
import { ArtistPortfolio } from './ArtistPortfolioClient';
import {
  ProfileEditModal,
  ChoreographyEditModal,
  MediaEditModal,
  PerformancesEditModal,
  DirectingEditModal,
  WorkshopsEditModal,
  AwardsEditModal,
} from './portfolio/EditSectionModals';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import YouTubeThumbnail from './YoutubeThumbnail';
import { Award, ChoreographyItem, DirectingItem, MediaItem, PerformanceItem, Workshop } from '@/types/portfolio';
import SocialSection from './portfolio/SocialSection';
import { SectionHeaders } from './SectionHeaders';

type SortOrder = 'display_order' | 'date';

export function ArtistPortfolioEditableClient({
  portfolio: initialPortfolio,
  artistId
}: {
  portfolio: ArtistPortfolio;
  artistId: string;
}) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<ArtistPortfolio>(initialPortfolio);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    sectionType: PortfolioSectionType | null;
    sectionTitle: string;
    data: any[];
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

  // Edit modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showChoreographyEdit, setShowChoreographyEdit] = useState(false);
  const [showMediaEdit, setShowMediaEdit] = useState(false);
  const [showPerformancesEdit, setShowPerformancesEdit] = useState(false);
  const [showDirectingEdit, setShowDirectingEdit] = useState(false);
  const [showWorkshopsEdit, setShowWorkshopsEdit] = useState(false);
  const [showAwardsEdit, setShowAwardsEdit] = useState(false);

  const toggleSortOrder = (section: string) => {
    setSortOrders(prev => ({
      ...prev,
      [section]: prev[section] === 'display_order' ? 'date' : 'display_order'
    }));
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

  // Save handlers for each section
  const handleSaveProfile = async (data: {
    artist_name: string;
    artist_name_eng: string;
    introduction: string;
    photo: string;
    instagram: string;
    twitter: string;
    youtube: string;
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save profile');
    }

    setPortfolio({ ...portfolio, ...data });
    alert('프로필이 저장되었습니다.');
    router.refresh();
  };

  const handleSaveChoreography = async (choreography: ChoreographyItem[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/choreography`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ choreography }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save choreography');
    }

    setPortfolio({ ...portfolio, choreography });
    alert('안무 목록이 저장되었습니다.');
    router.refresh();
  };

  const handleSaveMedia = async (media: MediaItem[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    console.log('Saving media:', media.map(m => ({ media_id: m.media_id, title: m.title, display_order: m.display_order })));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/media`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ media }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save media');
    }

    setPortfolio({ ...portfolio, media });
    alert('미디어가 저장되었습니다.');
    router.refresh();
  };

  const handleSavePerformances = async (performances: PerformanceItem[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/performances`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ performances }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save performances');
    }

    setPortfolio({ ...portfolio, performances });
    alert('공연 목록이 저장되었습니다.');
    router.refresh();
  };

  const handleSaveDirecting = async (directing: DirectingItem[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/directing`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ directing }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save directing');
    }

    setPortfolio({ ...portfolio, directing });
    alert('연출 목록이 저장되었습니다.');
    router.refresh();
  };

  const handleSaveWorkshops = async (workshops: Workshop[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/workshops`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ workshops }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save workshops');
    }

    setPortfolio({ ...portfolio, workshops });
    alert('워크샵 목록이 저장되었습니다.');
    router.refresh();
  };

  const handleSaveAwards = async (awards: Award[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio/awards`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ awards }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save awards');
    }

    setPortfolio({ ...portfolio, awards });
    alert('수상 경력이 저장되었습니다.');
    router.refresh();
  };

  // Transform data functions
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
    return data;
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
    return data;
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
    return data;
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
      <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center px-4">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{portfolio.artist_name}</h1>
          {portfolio.artist_name_eng && (
            <p className="text-base sm:text-xl text-gray-300">{portfolio.artist_name_eng}</p>
          )}
          <button
            onClick={() => setShowProfileEdit(true)}
            className="mt-3 sm:mt-4 flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">프로필 편집</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
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
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
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
        {getHighlightsData().length > 0 && (
          <section>
            <SectionHeaders
              title="Highlights"
              sortOrder={sortOrders.highlights}
              onToggleSort={() => toggleSortOrder('highlights')}
            />
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-3 sm:gap-4 min-w-max">
                {getHighlightsData().map((item, index) => (
                  <a
                    key={index}
                    href={item.youtube_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-60 sm:w-[320px] shrink-0"
                  >
                    <div className="overflow-hidden rounded-xl bg-zinc-900">
                      {item.youtube_link && (
                        <YouTubeThumbnail url={item.youtube_link} title={item.title} />
                      )}
                    </div>
                    <div className="mt-2 sm:mt-3 px-1">
                      <h3 className="text-sm sm:text-base font-bold leading-tight text-white group-hover:text-green-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {item.role.join(', ')}
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
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <SectionHeaders
              title="Choreographies"
              sortOrder={sortOrders.choreographies}
              onToggleSort={() => toggleSortOrder('choreographies')}
            />
            <button
              onClick={() => setShowChoreographyEdit(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">편집</span>
            </button>
          </div>
          {portfolio.choreography && portfolio.choreography.length > 0 ? (
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
                  <div className="space-y-3 sm:space-y-4">
                    {chunk.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
                        href={item.song.youtube_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-2 sm:gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group items-center"
                      >
                        <div className="w-24 h-14 sm:w-36 sm:h-20 shrink-0 rounded-sm overflow-hidden">
                          {item.song.youtube_link && (
                            <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-green-400 transition-colors">
                            {item.song.singer} - {item.song.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400">{item.role.join(', ')}</p>
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
          ) : (
            <p className="text-sm text-gray-400">아직 안무 작품이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Media */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <SectionHeaders
              title="Media"
              sortOrder={sortOrders.media}
              onToggleSort={() => toggleSortOrder('media')}
            />
            <button
              onClick={() => setShowMediaEdit(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">편집</span>
            </button>
          </div>
          {portfolio.media && portfolio.media.length > 0 ? (
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {chunk.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
                        href={item.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block"
                      >
                        <div className="aspect-video bg-gray-800 rounded-md sm:rounded-lg overflow-hidden">
                          <YouTubeThumbnail url={item.youtube_link} />
                        </div>
                        <p className="text-xs sm:text-sm text-white mt-1 truncate">{item.title}</p>
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
          ) : (
            <p className="text-sm text-gray-400">아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Directing */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <SectionHeaders
              title="Directing"
              sortOrder={sortOrders.directing}
              onToggleSort={() => toggleSortOrder('directing')}
            />
            <button
              onClick={() => setShowDirectingEdit(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">편집</span>
            </button>
          </div>
          {portfolio.directing && portfolio.directing.length > 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {chunk.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold text-sm sm:text-base">{item.title}</h3>
                        {item.date && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            {new Date(item.date).getFullYear()}.{String(new Date(item.date).getMonth() + 1).padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-sm text-gray-400">아직 연출 작품이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Performances */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <SectionHeaders
              title="Performances"
              sortOrder={sortOrders.performances}
              onToggleSort={() => toggleSortOrder('performances')}
            />
            <button
              onClick={() => setShowPerformancesEdit(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">편집</span>
            </button>
          </div>
          {portfolio.performances && portfolio.performances.length > 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {chunk.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-4 sm:p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{item.performance_title}</h3>
                        {item.date && (
                          <p className="text-xs sm:text-sm text-gray-400">
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
          ) : (
            <p className="text-sm text-gray-400">아직 공연 기록이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Classes/Workshops */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <SectionHeaders
              title="Classes"
              sortOrder={sortOrders.workshops}
              onToggleSort={() => toggleSortOrder('workshops')}
            />
            <button
              onClick={() => setShowWorkshopsEdit(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">편집</span>
            </button>
          </div>
          {portfolio.workshops && portfolio.workshops.length > 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {chunk.map((workshop, itemIndex) => (
                      <div key={itemIndex} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold text-sm sm:text-base">{workshop.class_name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
          ) : (
            <p className="text-sm text-gray-400">아직 클래스 기록이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Awards */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Awards</h2>
            <button
              onClick={() => setShowAwardsEdit(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">편집</span>
            </button>
          </div>
          {portfolio.awards && portfolio.awards.length > 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {chunk.map((award, itemIndex) => (
                      <div key={itemIndex} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                        <h3 className="font-semibold text-sm sm:text-base">{award.award_title}</h3>
                        {award.issuing_org && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">{award.issuing_org}</p>
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
          ) : (
            <p className="text-sm text-gray-400">아직 수상 경력이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>
      </div>

      {/* View All Modal */}
      {modalState.sectionType && (
        <PortfolioModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          sectionType={modalState.sectionType}
          sectionTitle={modalState.sectionTitle}
          data={modalState.data}
        />
      )}

      {/* Edit Modals */}
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        onSave={handleSaveProfile}
        initialData={{
          artist_name: portfolio.artist_name || "",
          artist_name_eng: portfolio.artist_name_eng || "",
          introduction: portfolio.introduction || "",
          photo: portfolio.photo || "",
          instagram: portfolio.instagram || "",
          twitter: portfolio.twitter || "",
          youtube: portfolio.youtube || "",
        }}
        artistId={artistId}
      />

      <ChoreographyEditModal
        isOpen={showChoreographyEdit}
        onClose={() => setShowChoreographyEdit(false)}
        onSave={handleSaveChoreography}
        initialData={portfolio.choreography}
      />

      <MediaEditModal
        isOpen={showMediaEdit}
        onClose={() => setShowMediaEdit(false)}
        onSave={handleSaveMedia}
        initialData={portfolio.media}
      />

      <PerformancesEditModal
        isOpen={showPerformancesEdit}
        onClose={() => setShowPerformancesEdit(false)}
        onSave={handleSavePerformances}
        initialData={portfolio.performances}
      />

      <DirectingEditModal
        isOpen={showDirectingEdit}
        onClose={() => setShowDirectingEdit(false)}
        onSave={handleSaveDirecting}
        initialData={portfolio.directing}
      />

      <WorkshopsEditModal
        isOpen={showWorkshopsEdit}
        onClose={() => setShowWorkshopsEdit(false)}
        onSave={handleSaveWorkshops}
        initialData={portfolio.workshops}
      />

      <AwardsEditModal
        isOpen={showAwardsEdit}
        onClose={() => setShowAwardsEdit(false)}
        onSave={handleSaveAwards}
        initialData={portfolio.awards}
      />
    </>
  );
}
