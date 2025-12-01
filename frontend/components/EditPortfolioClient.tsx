'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Instagram, Twitter, Youtube, Upload, GripVertical, Star, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ArtistPortfolio } from './ArtistPortfolioClient';
import { supabase } from '@/lib/supabase';
import {
  AddChoreographyModal,
  AddMediaModal,
  AddPerformanceModal,
  AddDirectingModal,
  AddWorkshopModal,
  AddAwardModal,
} from './portfolio/AddModals';

interface Song {
  song_id?: string;
  title: string;
  singer: string;
  youtube_link?: string;
  date: string;
}

interface MediaItem {
  media_id?: string;
  youtube_link: string;
  role?: string;
  is_highlight: boolean;
  display_order: number;
  title: string;
  video_date: Date | string;
}

interface ChoreographyItem {
  song?: Song;
  role?: string[];
  is_highlight: boolean;
  display_order: number;
}

interface Performance {
  performance_title: string;
  date: string;
  category?: string;
}

interface PerformanceItem {
  performance_id?: string;
  performance?: Performance;
}

interface Directing {
  title: string;
  date: string;
}

interface DirectingItem {
  directing_id?: string;
  directing?: Directing;
}

interface Workshop {
  class_name: string;
  class_role?: string[];
  country: string;
  class_date: string;
}

interface Award {
  award_title: string;
  issuing_org: string;
  received_date: string;
}

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

interface SortableItemProps {
  id: string;
  item: ChoreographyItem | MediaItem;
  type: 'choreography' | 'media';
  onToggleHighlight: () => void;
  onRemove: () => void;
}

function SortableItem({ id, item, type, onToggleHighlight, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (type === 'choreography') {
    const choreoItem = item as ChoreographyItem;
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex gap-4 p-2 bg-white/5 rounded-lg group items-center"
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded"
        >
          <GripVertical className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="w-36 h-20 shrink-0 rounded-sm overflow-hidden">
          {choreoItem.song?.youtube_link && (
            <YouTubeThumbnail url={choreoItem.song.youtube_link} title={choreoItem.song.title} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {choreoItem.song?.singer} - {choreoItem.song?.title}
          </h3>
          <p className="text-sm text-gray-400">{choreoItem.role?.join(', ')}</p>
          {choreoItem.song?.date && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(choreoItem.song.date).toLocaleDateString()}
            </p>
          )}
        </div>

        <button
          onClick={onToggleHighlight}
          className="p-2 hover:bg-white/10 rounded"
        >
          <Star
            className={`w-6 h-6 ${choreoItem.is_highlight ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        </button>

        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-500/20 rounded text-red-500"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const mediaItem = item as MediaItem;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-2 bg-black/50 hover:bg-black/70 rounded"
      >
        <GripVertical className="w-5 h-5 text-white" />
      </button>

      <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
        <YouTubeThumbnail url={mediaItem.youtube_link} />
      </div>

      <p className="text-sm text-white mt-1 truncate">{mediaItem.title}</p>
      <p className="text-xs text-gray-400 truncate">
        {mediaItem.role}
        {mediaItem.video_date && (
          <span> · {new Date(mediaItem.video_date).getFullYear()}.{String(new Date(mediaItem.video_date).getMonth() + 1).padStart(2, '0')}</span>
        )}
      </p>

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={onToggleHighlight}
          className="p-2 bg-black/50 hover:bg-black/70 rounded"
        >
          <Star
            className={`w-5 h-5 ${mediaItem.is_highlight ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
          />
        </button>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export function EditPortfolioClient({ portfolio, artistId }: { portfolio: ArtistPortfolio; artistId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showChoreographyModal, setShowChoreographyModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showDirectingModal, setShowDirectingModal] = useState(false);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);

  // Local state for all editable fields
  const [profileImage, setProfileImage] = useState(portfolio.photo || '');
  const [artistName, setArtistName] = useState(portfolio.artist_name);
  const [artistNameEng, setArtistNameEng] = useState(portfolio.artist_name_eng || '');
  const [introduction, setIntroduction] = useState(portfolio.introduction || '');
  const [instagram, setInstagram] = useState(portfolio.instagram || '');
  const [twitter, setTwitter] = useState(portfolio.twitter || '');
  const [youtube, setYoutube] = useState(portfolio.youtube || '');

  const [choreography, setChoreography] = useState<ChoreographyItem[]>(portfolio.choreography || []);
  const [media, setMedia] = useState<MediaItem[]>(portfolio.media || []);
  const [performances, setPerformances] = useState<PerformanceItem[]>(portfolio.performances || []);
  const [directing, setDirecting] = useState<DirectingItem[]>(portfolio.directing || []);
  const [workshops, setWorkshops] = useState<Workshop[]>(portfolio.workshops || []);
  const [awards, setAwards] = useState<Award[]>(portfolio.awards || []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${artistId}-${Date.now()}.${fileExt}`;
      const filePath = `artist-profiles/${fileName}`;

      const { data, error } = await supabase.storage
        .from('artist-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        alert('이미지 업로드에 실패했습니다.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('artist-images')
        .getPublicUrl(filePath);

      setProfileImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  // Choreography handlers
  const handleChoreographyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = choreography.findIndex((_, i) => `choreo-${i}` === active.id);
      const newIndex = choreography.findIndex((_, i) => `choreo-${i}` === over.id);
      const newChoreography = arrayMove(choreography, oldIndex, newIndex);
      const updatedChoreography = newChoreography.map((item, index) => ({
        ...item,
        display_order: index,
      }));
      setChoreography(updatedChoreography);
    }
  };

  const toggleChoreographyHighlight = (index: number) => {
    const updated = [...choreography];
    updated[index] = { ...updated[index], is_highlight: !updated[index].is_highlight };
    setChoreography(updated);
  };

  const removeChoreography = (index: number) => {
    const updated = choreography.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, display_order: i }));
    setChoreography(reordered);
  };

  const addChoreography = (data: { song: Song; role: string[] }) => {
    const newItem: ChoreographyItem = {
      song: data.song,
      role: data.role,
      is_highlight: false,
      display_order: choreography.length,
    };
    setChoreography([...choreography, newItem]);
  };

  // Media handlers
  const handleMediaDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((_, i) => `media-${i}` === active.id);
      const newIndex = media.findIndex((_, i) => `media-${i}` === over.id);
      const newMedia = arrayMove(media, oldIndex, newIndex);
      const updatedMedia = newMedia.map((item, index) => ({
        ...item,
        display_order: index,
      }));
      setMedia(updatedMedia);
    }
  };

  const toggleMediaHighlight = (index: number) => {
    const updated = [...media];
    updated[index] = { ...updated[index], is_highlight: !updated[index].is_highlight };
    setMedia(updated);
  };

  const removeMedia = (index: number) => {
    const updated = media.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, display_order: i }));
    setMedia(reordered);
  };

  const addMedia = (data: { youtube_link: string; title: string; role?: string; video_date?: string }) => {
    const newItem: MediaItem = {
      youtube_link: data.youtube_link,
      title: data.title,
      role: data.role,
      is_highlight: false,
      display_order: media.length,
      video_date: data.video_date || new Date().toISOString().split('T')[0],
    };
    setMedia([...media, newItem]);
  };

  // Performance handlers
  const removePerformance = (index: number) => {
    setPerformances(performances.filter((_, i) => i !== index));
  };

  const addPerformance = (data: { performance_title: string; date: string; category?: string }) => {
    const newItem: PerformanceItem = {
      performance: {
        performance_title: data.performance_title,
        date: data.date,
        category: data.category,
      },
    };
    setPerformances([...performances, newItem]);
  };

  // Directing handlers
  const removeDirecting = (index: number) => {
    setDirecting(directing.filter((_, i) => i !== index));
  };

  const addDirecting = (data: { title: string; date: string }) => {
    const newItem: DirectingItem = {
      directing: {
        title: data.title,
        date: data.date,
      },
    };
    setDirecting([...directing, newItem]);
  };

  // Workshop handlers
  const removeWorkshop = (index: number) => {
    setWorkshops(workshops.filter((_, i) => i !== index));
  };

  const addWorkshop = (data: { class_name: string; class_date: string; country: string; class_role?: string[] }) => {
    const newItem: Workshop = {
      class_name: data.class_name,
      class_date: data.class_date,
      country: data.country,
      class_role: data.class_role,
    };
    setWorkshops([...workshops, newItem]);
  };

  // Award handlers
  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const addAward = (data: { award_title: string; issuing_org: string; received_date: string }) => {
    const newItem: Award = {
      award_title: data.award_title,
      issuing_org: data.issuing_org,
      received_date: data.received_date,
    };
    setAwards([...awards, newItem]);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const portfolioData = {
        artist_name: artistName,
        artist_name_eng: artistNameEng,
        introduction,
        photo: profileImage,
        instagram,
        twitter,
        youtube,
        choreography,
        media,
        performances,
        directing,
        workshops,
        awards,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}/portfolio`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(portfolioData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      alert('포트폴리오가 성공적으로 저장되었습니다.');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/main/profile')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>취소</span>
          </button>

          <h1 className="text-xl font-bold">포트폴리오 편집</h1>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 px-6 py-2 rounded-full font-medium transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>저장하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        {profileImage && (
          <>
            <Image
              src={profileImage}
              alt={artistName}
              fill
              className="object-cover object-top blur-sm"
            />
            <div className="absolute bottom-0 inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border border-white shadow-2xl mb-4">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={artistName}
                  width={128}
                  height={128}
                  className="object-cover object-top w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-zinc-400" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="text-4xl font-bold mb-2 bg-transparent border-b-2 border-transparent hover:border-zinc-600 focus:border-green-500 outline-none text-center transition-colors"
            placeholder="이름"
          />

          <input
            type="text"
            value={artistNameEng}
            onChange={(e) => setArtistNameEng(e.target.value)}
            className="text-xl text-gray-300 bg-transparent border-b-2 border-transparent hover:border-zinc-600 focus:border-green-500 outline-none text-center transition-colors"
            placeholder="English Name"
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-16">
        {/* Social Links */}
        <section>
          <h2 className="text-2xl font-bold mb-4">소셜 미디어</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Instagram className="w-6 h-6 text-zinc-400" />
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="flex-1 bg-white/5 border border-zinc-700 focus:border-green-500 rounded-lg px-4 py-2 outline-none transition-colors"
                placeholder="Instagram URL"
              />
            </div>
            <div className="flex items-center gap-3">
              <Twitter className="w-6 h-6 text-zinc-400" />
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="flex-1 bg-white/5 border border-zinc-700 focus:border-green-500 rounded-lg px-4 py-2 outline-none transition-colors"
                placeholder="Twitter URL"
              />
            </div>
            <div className="flex items-center gap-3">
              <Youtube className="w-6 h-6 text-zinc-400" />
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="flex-1 bg-white/5 border border-zinc-700 focus:border-green-500 rounded-lg px-4 py-2 outline-none transition-colors"
                placeholder="YouTube URL"
              />
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold mb-4">소개</h2>
          <textarea
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            className="w-full bg-white/5 border border-zinc-700 focus:border-green-500 rounded-lg px-4 py-3 outline-none transition-colors min-h-[120px] resize-y"
            placeholder="자기소개를 입력하세요..."
          />
        </section>

        {/* Choreographies */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Choreographies</h2>
            <button
              onClick={() => setShowChoreographyModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>추가</span>
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleChoreographyDragEnd}
          >
            <SortableContext
              items={choreography.map((_, i) => `choreo-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {choreography.map((item, index) => (
                  <SortableItem
                    key={`choreo-${index}`}
                    id={`choreo-${index}`}
                    item={item}
                    type="choreography"
                    onToggleHighlight={() => toggleChoreographyHighlight(index)}
                    onRemove={() => removeChoreography(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Media */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Media</h2>
            <button
              onClick={() => setShowMediaModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>추가</span>
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleMediaDragEnd}
          >
            <SortableContext
              items={media.map((_, i) => `media-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item, index) => (
                  <SortableItem
                    key={`media-${index}`}
                    id={`media-${index}`}
                    item={item}
                    type="media"
                    onToggleHighlight={() => toggleMediaHighlight(index)}
                    onRemove={() => removeMedia(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Performances */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Performances</h2>
            <button
              onClick={() => setShowPerformanceModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>추가</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performances.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-white/5 rounded-lg group relative hover:bg-white/10 transition-colors"
              >
                <button
                  onClick={() => removePerformance(index)}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/50 hover:bg-red-500/70 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

        {/* Directing */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Directing</h2>
            <button
              onClick={() => setShowDirectingModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>추가</span>
            </button>
          </div>
          <div className="space-y-3">
            {directing.map((item, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg group relative hover:bg-white/10 transition-colors">
                <button
                  onClick={() => removeDirecting(index)}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/50 hover:bg-red-500/70 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

        {/* Workshops */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Classes & Workshops</h2>
            <button
              onClick={() => setShowWorkshopModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>추가</span>
            </button>
          </div>
          <div className="space-y-3">
            {workshops.map((workshop, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg group relative hover:bg-white/10 transition-colors">
                <button
                  onClick={() => removeWorkshop(index)}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/50 hover:bg-red-500/70 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

        {/* Awards */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Awards</h2>
            <button
              onClick={() => setShowAwardModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>추가</span>
            </button>
          </div>
          <div className="space-y-3">
            {awards.map((award, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg group relative hover:bg-white/10 transition-colors">
                <button
                  onClick={() => removeAward(index)}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/50 hover:bg-red-500/70 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h3 className="font-semibold">{award.award_title}</h3>
                <p className="text-sm text-gray-400 mt-1">{award.issuing_org}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(award.received_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modals */}
      <AddChoreographyModal
        isOpen={showChoreographyModal}
        onClose={() => setShowChoreographyModal(false)}
        onAdd={addChoreography}
      />
      <AddMediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onAdd={addMedia}
      />
      <AddPerformanceModal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        onAdd={addPerformance}
      />
      <AddDirectingModal
        isOpen={showDirectingModal}
        onClose={() => setShowDirectingModal(false)}
        onAdd={addDirecting}
      />
      <AddWorkshopModal
        isOpen={showWorkshopModal}
        onClose={() => setShowWorkshopModal(false)}
        onAdd={addWorkshop}
      />
      <AddAwardModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        onAdd={addAward}
      />
    </div>
  );
}
