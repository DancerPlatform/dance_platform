'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Instagram, Twitter, Youtube, Edit } from 'lucide-react';
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

  // Edit modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showChoreographyEdit, setShowChoreographyEdit] = useState(false);
  const [showMediaEdit, setShowMediaEdit] = useState(false);
  const [showPerformancesEdit, setShowPerformancesEdit] = useState(false);
  const [showDirectingEdit, setShowDirectingEdit] = useState(false);
  const [showWorkshopsEdit, setShowWorkshopsEdit] = useState(false);
  const [showAwardsEdit, setShowAwardsEdit] = useState(false);

  const highlights = portfolio.choreography?.filter(item => item.is_highlight) || [];
  const highlightMedia = portfolio.media?.filter(item => item.is_highlight) || [];

  const closeModal = () => {
    setModalState({
      isOpen: false,
      sectionType: null,
      sectionTitle: '',
      data: [],
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

  const handleSaveMedia = async (media: any[]) => {
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

  // Transform data for modal (same as original component)
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
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center px-4">
          {portfolio.photo && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-white shadow-2xl mb-3 sm:mb-4">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-16">
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
        {/* Social Links */}
        <SocialSection 
          instagram={portfolio.instagram}
          twitter={portfolio.twitter}
          youtube={portfolio.youtube}
        />

        {/* Introduction */}
        {portfolio.introduction && (
          <section>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
              {portfolio.introduction}
            </p>
          </section>
        )}

        {/* Highlights */}
        {(highlights.length > 0 || highlightMedia.length > 0) && (
          <section>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">Highlights</h2>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-3 sm:gap-4 min-w-max">
                {getHighlightsData().slice(0, 5).map((item, index) => (
                  <a
                    key={index}
                    href={item.youtube_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-[240px] sm:w-[320px] shrink-0"
                  >
                    <div className="overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900">
                      {item.youtube_link && (
                        <YouTubeThumbnail url={item.youtube_link} title={item.title} />
                      )}
                    </div>
                    <div className="mt-2 sm:mt-3 px-1">
                      <h3 className="text-sm sm:text-base font-bold leading-tight text-white group-hover:text-green-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 truncate">
                        {item.role?.join(', ')}
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
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Choreographies</h2>
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowChoreographyEdit(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">편집</span>
                </button>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {portfolio.choreography.slice(0, 5).map((item, index) => (
                <a
                  key={index}
                  href={item.song?.youtube_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 sm:gap-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group items-center"
                >
                  <div className="w-24 h-14 sm:w-36 sm:h-20 shrink-0 rounded-sm overflow-hidden">
                    {item.song?.youtube_link && (
                      <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-sm sm:text-base group-hover:text-green-400 transition-colors">
                      {item.song?.singer} - {item.song?.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{item.role?.join(', ')}</p>
                    {item.song?.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.song.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {item.is_highlight && (
                    <div className="flex items-center shrink-0">
                      <span className="text-yellow-400 text-lg sm:text-2xl">★</span>
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
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Media</h2>
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowMediaEdit(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">편집</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...portfolio.media].sort((a, b) => a.display_order - b.display_order).slice(0, 8).map((item, index) => (
                <a
                  key={index}
                  href={item.youtube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="aspect-video bg-gray-800 rounded-md sm:rounded-lg overflow-hidden">
                    <YouTubeThumbnail url={item.youtube_link} />
                  </div>
                  <p className="text-xs sm:text-sm text-white mt-1 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {item.role}
                    {item.video_date && (
                      <span> · {new Date(item.video_date).getFullYear()}.{String(new Date(item.video_date).getMonth() + 1).padStart(2, '0')}</span>
                    )}
                  </p>
                  {item.is_highlight && (
                    <div className="absolute top-2 right-2">
                      <span className="text-yellow-400 text-base sm:text-xl">★</span>
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
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Directing</h2>
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowDirectingEdit(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">편집</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {portfolio.directing.slice(0, 5).map((item, index) => (
                <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold text-sm sm:text-base">{item.directing?.title}</h3>
                  {item.directing?.date && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Performances</h2>
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowPerformancesEdit(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">편집</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {portfolio.performances.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{item.performance?.performance_title}</h3>
                  {item.performance?.date && (
                    <p className="text-xs sm:text-sm text-gray-400">
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
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Classes</h2>
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowWorkshopsEdit(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">편집</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {portfolio.workshops.slice(0, 5).map((workshop, index) => (
                <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold text-sm sm:text-base">{workshop.class_name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
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

        {/* Awards */}
        {portfolio.awards && portfolio.awards.length > 0 && (
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
            <div className="space-y-2 sm:space-y-3">
              {portfolio.awards.map((award, index) => (
                <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold text-sm sm:text-base">{award.award_title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">{award.issuing_org}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(award.received_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
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
          artist_name: portfolio.artist_name,
          artist_name_eng: portfolio.artist_name_eng,
          introduction: portfolio.introduction,
          photo: portfolio.photo,
          instagram: portfolio.instagram,
          twitter: portfolio.twitter,
          youtube: portfolio.youtube,
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
