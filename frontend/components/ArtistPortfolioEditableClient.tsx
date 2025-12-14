'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ArtistPortfolioClient.css';
import { PortfolioModal } from './PortfolioModal';
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
import { PortfolioHeroSection } from './portfolio/PortfolioHeroSection';
import { PortfolioSection } from './portfolio/PortfolioSection';
import { ChoreographyCard, MediaCard, TextCard } from './portfolio/PortfolioCards';
import { VideoCarousel } from './portfolio/VideoCarousel';
import { usePortfolioSort } from '@/hooks/usePortfolioSort';
import { usePortfolioModal } from '@/hooks/usePortfolioModal';
import { chunkArray } from '@/lib/portfolioUtils';
import { SectionHeaders } from './SectionHeaders';

export function ArtistPortfolioEditableClient({
  portfolio: initialPortfolio,
  artistId
}: {
  portfolio: ArtistPortfolio;
  artistId: string;
}) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<ArtistPortfolio>(initialPortfolio);
  const { sortOrders, toggleSortOrder } = usePortfolioSort();
  const { modalState, closeModal } = usePortfolioModal();

  // Edit modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showChoreographyEdit, setShowChoreographyEdit] = useState(false);
  const [showMediaEdit, setShowMediaEdit] = useState(false);
  const [showPerformancesEdit, setShowPerformancesEdit] = useState(false);
  const [showDirectingEdit, setShowDirectingEdit] = useState(false);
  const [showWorkshopsEdit, setShowWorkshopsEdit] = useState(false);
  const [showAwardsEdit, setShowAwardsEdit] = useState(false);

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
      `/api/artists/${artistId}/portfolio/profile`,
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
      `/api/artists/${artistId}/portfolio/choreography`,
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
      `/api/artists/${artistId}/portfolio/media`,
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
      `/api/artists/${artistId}/portfolio/performances`,
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
      `/api/artists/${artistId}/portfolio/directing`,
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
      `/api/artists/${artistId}/portfolio/workshops`,
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
      `/api/artists/${artistId}/portfolio/awards`,
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
      <PortfolioHeroSection
        photoUrl={portfolio.photo}
        name={portfolio.artist_name}
        nameEng={portfolio.artist_name_eng}
        heightClass="h-[400px] sm:h-[500px]"
        editable={true}
        onEdit={() => setShowProfileEdit(true)}
      />

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
        <PortfolioSection
          title="Choreographies"
          sortOrder={sortOrders.choreographies}
          onToggleSort={() => toggleSortOrder('choreographies')}
          editable={true}
          onEdit={() => setShowChoreographyEdit(true)}
          isEmpty={!portfolio.choreography || portfolio.choreography.length === 0}
          emptyMessage="아직 안무 작품이 없습니다. 편집 버튼을 눌러 추가해보세요."
        >
          <VideoCarousel
            items={getChoreographyData()}
            itemsPerSlide={4}
            containerClassName="space-y-3 sm:space-y-4"
            renderItem={(item) => (
              <ChoreographyCard
                song={{
                  singer: item.song.singer,
                  title: item.song.title,
                  date: item.song.date,
                }}
                role={item.role}
                youtubeLink={item.song.youtube_link || '#'}
              />
            )}
          />
        </PortfolioSection>

        {/* Media */}
        <PortfolioSection
          title="Media"
          sortOrder={sortOrders.media}
          onToggleSort={() => toggleSortOrder('media')}
          editable={true}
          onEdit={() => setShowMediaEdit(true)}
          isEmpty={!portfolio.media || portfolio.media.length === 0}
          emptyMessage="아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요."
        >
          <VideoCarousel
            items={getMediaData()}
            itemsPerSlide={4}
            gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            renderItem={(item) => (
              <MediaCard
                title={item.title}
                role={item.role}
                youtubeLink={item.youtube_link}
                videoDate={item.video_date}
              />
            )}
          />
        </PortfolioSection>

        {/* Directing */}
        <PortfolioSection
          title="Directing"
          sortOrder={sortOrders.directing}
          onToggleSort={() => toggleSortOrder('directing')}
          editable={true}
          onEdit={() => setShowMediaEdit(true)}
          isEmpty={!portfolio.directing || portfolio.directing.length === 0}
          emptyMessage="아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요."
        >
          
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
        </PortfolioSection>

        {/* Performances */}
        <PortfolioSection
          title="Performances"
          sortOrder={sortOrders.performance}
          onToggleSort={() => toggleSortOrder('performances')}
          editable={true}
          onEdit={() => setShowPerformancesEdit(true)}
          isEmpty={!portfolio.performances || portfolio.performances.length === 0}
          emptyMessage="아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요."
        >
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
        </PortfolioSection>

        {/* Classes/Workshops */}
        <PortfolioSection
          title="Classes"
          sortOrder={sortOrders.workshop}
          onToggleSort={() => toggleSortOrder('workshop')}
          editable={true}
          onEdit={() => setShowWorkshopsEdit(true)}
          isEmpty={!portfolio.workshops || portfolio.workshops.length === 0}
          emptyMessage="아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요."
        >
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
        </PortfolioSection>

        {/* Awards */}
        <PortfolioSection
          title="Awards"
          sortOrder={sortOrders.awards}
          onToggleSort={() => toggleSortOrder('awards')}
          editable={true}
          onEdit={() => setShowAwardsEdit(true)}
          isEmpty={!portfolio.awards || portfolio.awards.length === 0}
          emptyMessage="아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요."
        >
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
        </PortfolioSection>
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
