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
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title || 'Video thumbnail'}
        fill
        className="object-cover object-center"
      />
    </div>
  );
}

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

  const openModal = (
    sectionType: PortfolioSectionType,
    sectionTitle: string,
    data: any[]
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

  const handleSaveChoreography = async (choreography: any[]) => {
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

  const handleSavePerformances = async (performances: any[]) => {
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

  const handleSaveDirecting = async (directing: any[]) => {
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

  const handleSaveWorkshops = async (workshops: any[]) => {
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

  const handleSaveAwards = async (awards: any[]) => {
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
          <button
            onClick={() => setShowProfileEdit(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">프로필 편집</span>
          </button>
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
              <button
                onClick={() => openModal('highlights', 'Highlights', getHighlightsData())}
                className="text-green-400 text-sm hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                {highlights.slice(0, 5).map((item, index) => (
                  <a
                    key={index}
                    href={item.song?.youtube_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-[320px] shrink-0"
                  >
                    <div className="overflow-hidden rounded-2xl bg-zinc-900">
                      {item.song?.youtube_link && (
                        <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
                      )}
                    </div>
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowChoreographyEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => openModal('choreographies', 'Choreographies', getChoreographyData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMediaEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => openModal('media', 'Media', getMediaData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolio.media.slice(0, 8).map((item, index) => (
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDirectingEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => openModal('directing', 'Directing', getDirectingData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPerformancesEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => openModal('performances', 'Performances', getPerformancesData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWorkshopsEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => openModal('workshops', 'Classes & Workshops', getWorkshopsData())}
                  className="text-green-400 text-sm hover:underline"
                >
                  View All →
                </button>
              </div>
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

        {/* Awards */}
        {portfolio.awards && portfolio.awards.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Awards</h2>
              <button
                onClick={() => setShowAwardsEdit(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
            <div className="space-y-3">
              {portfolio.awards.map((award, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-semibold">{award.award_title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{award.issuing_org}</p>
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
