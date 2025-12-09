'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit } from 'lucide-react';
import { PortfolioModal, PortfolioSectionType } from './PortfolioModal';
import { GroupPortfolio } from './GroupPortfolioClient';
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

export function TeamPortfolioEditableClient({
  portfolio: initialPortfolio,
  teamId
}: {
  portfolio: GroupPortfolio;
  teamId: string;
}) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<GroupPortfolio>(initialPortfolio);
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

  // Aggregate team choreography, media, performances, directing, workshops, and awards
  const teamChoreography: ChoreographyItem[] = [];
  const teamMedia: MediaItem[] = [];
  const teamPerformances: PerformanceItem[] = [];
  const teamDirecting: DirectingItem[] = [];
  const teamWorkshops: Workshop[] = [];
  const teamAwards: Award[] = [];

  // Merge portfolio items from all members, removing duplicates
  const choreographyMap = new Map<string, ChoreographyItem>();
  portfolio.members.forEach(member => {
    member.portfolio.choreography?.forEach(item => {
      const songId = item.song?.song_id;
      if (songId && !choreographyMap.has(songId)) {
        choreographyMap.set(songId, item);
      }
    });
  });
  teamChoreography.push(...Array.from(choreographyMap.values()));

  const mediaMap = new Map<string, MediaItem>();
  portfolio.members.forEach(member => {
    member.portfolio.media?.forEach(item => {
      const key = item.media_id || item.youtube_link;
      if (key && !mediaMap.has(key)) {
        mediaMap.set(key, item);
      }
    });
  });
  teamMedia.push(...Array.from(mediaMap.values()));

  const performanceMap = new Map<string, PerformanceItem>();
  portfolio.members.forEach(member => {
    member.portfolio.performances?.forEach(item => {
      const perfId = item.performance?.performance_id;
      if (perfId && !performanceMap.has(perfId)) {
        performanceMap.set(perfId, item);
      }
    });
  });
  teamPerformances.push(...Array.from(performanceMap.values()));

  const directingMap = new Map<string, DirectingItem>();
  portfolio.members.forEach(member => {
    member.portfolio.directing?.forEach(item => {
      const dirId = item.directing?.directing_id;
      if (dirId && !directingMap.has(dirId)) {
        directingMap.set(dirId, item);
      }
    });
  });
  teamDirecting.push(...Array.from(directingMap.values()));

  const workshopsMap = new Map<string, Workshop>();
  portfolio.members.forEach(member => {
    member.portfolio.workshops?.forEach(item => {
      const key = `${item.class_name}_${item.class_date}`;
      if (!workshopsMap.has(key)) {
        workshopsMap.set(key, item);
      }
    });
  });
  teamWorkshops.push(...Array.from(workshopsMap.values()));

  const awardsMap = new Map<string, Award>();
  portfolio.members.forEach(member => {
    member.portfolio.awards?.forEach(item => {
      const key = `${item.issuing_org}_${item.award_title}`;
      if (!awardsMap.has(key)) {
        awardsMap.set(key, item);
      }
    });
  });
  teamAwards.push(...Array.from(awardsMap.values()));

  const highlights = teamChoreography.filter(item => item.is_highlight) || [];
  const highlightMedia = teamMedia.filter(item => item.is_highlight) || [];

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/profile`,
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

    setPortfolio({
      ...portfolio,
      group_name: data.artist_name,
      group_name_eng: data.artist_name_eng,
      introduction: data.introduction,
      photo: data.photo,
      instagram: data.instagram,
      twitter: data.twitter,
      youtube: data.youtube,
    });
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/choreography`,
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

    alert('안무 목록이 저장되었습니다.');
    router.refresh();
  };

  const handleSaveMedia = async (media: MediaItem[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/media`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/performances`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/directing`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/workshops`,
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}/portfolio/awards`,
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

    alert('수상 경력이 저장되었습니다.');
    router.refresh();
  };

  const getHighlightsData = () => {
    const choreoHighlights = teamChoreography
      .filter(item => item.is_highlight)
      .map(item => ({
        youtube_link: item.song?.youtube_link || '',
        role: item.role || [],
        is_highlight: true,
        display_order: item.display_order,
        title: item.song ? `${item.song.singer} - ${item.song.title}` : 'Untitled',
        video_date: item.song?.date || null,
      }));

    const mediaHighlights = teamMedia
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

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        {portfolio.photo && (
          <>
            <Image
              src={portfolio.photo}
              alt={portfolio.group_name}
              fill
              className="object-cover object-top blur-sm"
              priority
            />
            <div className="absolute bottom-0 inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
          </>
        )}

        {/* Team Info Section */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center px-4">
          {portfolio.photo && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-white shadow-2xl mb-3 sm:mb-4">
              <Image
                src={portfolio.photo}
                alt={portfolio.group_name}
                width={128}
                height={128}
                className="object-cover object-top w-full h-full"
                priority
              />
            </div>
          )}
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{portfolio.group_name}</h1>
          {portfolio.group_name_eng && (
            <p className="text-base sm:text-xl text-gray-300">{portfolio.group_name_eng}</p>
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
                    className="group w-60 sm:w-[320px] shrink-0"
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
          {teamChoreography && teamChoreography.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {teamChoreography.slice(0, 5).map((item, index) => (
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
          ) : (
            <p className="text-sm text-gray-400">아직 안무 작품이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Media */}
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
          {teamMedia && teamMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...teamMedia].sort((a, b) => a.display_order - b.display_order).slice(0, 8).map((item, index) => (
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
          ) : (
            <p className="text-sm text-gray-400">아직 미디어가 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Directing */}
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
          {teamDirecting && teamDirecting.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {teamDirecting.slice(0, 5).map((item, index) => (
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
          ) : (
            <p className="text-sm text-gray-400">아직 연출 작품이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Performances */}
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
          {teamPerformances && teamPerformances.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {teamPerformances.slice(0, 4).map((item, index) => (
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
          ) : (
            <p className="text-sm text-gray-400">아직 공연 기록이 없습니다. 편집 버튼을 눌러 추가해보세요.</p>
          )}
        </section>

        {/* Classes/Workshops */}
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
          {teamWorkshops && teamWorkshops.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {teamWorkshops.slice(0, 5).map((workshop, index) => (
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
          {teamAwards && teamAwards.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {teamAwards.map((award, index) => (
                <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold text-sm sm:text-base">{award.award_title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">{award.issuing_org}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(award.received_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
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
          artist_name: portfolio.group_name || "",
          artist_name_eng: portfolio.group_name_eng || "",
          introduction: portfolio.introduction || "",
          photo: portfolio.photo || "",
          instagram: portfolio.instagram || "",
          twitter: portfolio.twitter || "",
          youtube: portfolio.youtube || "",
        }}
        artistId={teamId}
      />

      <ChoreographyEditModal
        isOpen={showChoreographyEdit}
        onClose={() => setShowChoreographyEdit(false)}
        onSave={handleSaveChoreography}
        initialData={teamChoreography}
      />

      <MediaEditModal
        isOpen={showMediaEdit}
        onClose={() => setShowMediaEdit(false)}
        onSave={handleSaveMedia}
        initialData={teamMedia}
      />

      <PerformancesEditModal
        isOpen={showPerformancesEdit}
        onClose={() => setShowPerformancesEdit(false)}
        onSave={handleSavePerformances}
        initialData={teamPerformances}
      />

      <DirectingEditModal
        isOpen={showDirectingEdit}
        onClose={() => setShowDirectingEdit(false)}
        onSave={handleSaveDirecting}
        initialData={teamDirecting}
      />

      <WorkshopsEditModal
        isOpen={showWorkshopsEdit}
        onClose={() => setShowWorkshopsEdit(false)}
        onSave={handleSaveWorkshops}
        initialData={teamWorkshops}
      />

      <AwardsEditModal
        isOpen={showAwardsEdit}
        onClose={() => setShowAwardsEdit(false)}
        onSave={handleSaveAwards}
        initialData={teamAwards}
      />
    </>
  );
}
