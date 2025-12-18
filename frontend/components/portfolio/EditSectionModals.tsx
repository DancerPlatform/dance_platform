'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, GripVertical, Star, Plus, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { MediaItem } from '@/types/portfolio';
import { YouTubeSearchInput } from '@/components/YouTubeSearchInput';
import { RoleTagInput } from './RoleTagInput';
import { COUNTRY_CODES } from '@/lib/countryCodes';

// Types
interface Song {
  song_id?: string;
  title: string;
  singer: string;
  youtube_link?: string;
  date: string;
}

interface ChoreographyItem {
  song?: Song;
  role?: string[];
  is_highlight: boolean;
  display_order: number;
}

// interface MediaItem {
//   media_id?: string;
//   youtube_link: string;
//   role?: string;
//   is_highlight: boolean;
//   display_order: number;
//   title: string;
//   video_date: Date | string;
// }

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

// Utility functions
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
        sizes=''
        fill
        className="object-cover object-center"
      />
    </div>
  );
}

// Profile Edit Modal
interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    artist_name: string;
    artist_name_eng: string;
    introduction: string;
    photo: string;
    instagram: string;
    twitter: string;
    youtube: string;
  }) => Promise<void>;
  initialData: {
    artist_name: string;
    artist_name_eng?: string;
    introduction?: string;
    photo?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  artistId: string;
}

export function ProfileEditModal({ isOpen, onClose, onSave, initialData, artistId }: ProfileEditModalProps) {
  const [artistName, setArtistName] = useState(initialData.artist_name || '');
  const [artistNameEng, setArtistNameEng] = useState(initialData.artist_name_eng || '');
  const [introduction, setIntroduction] = useState(initialData.introduction || '');
  const [photo, setPhoto] = useState(initialData.photo || '');
  const [instagram, setInstagram] = useState(initialData.instagram || '');
  const [twitter, setTwitter] = useState(initialData.twitter || '');
  const [youtube, setYoutube] = useState(initialData.youtube || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initialData changes
  useEffect(() => {
    setArtistName(initialData.artist_name || '');
    setArtistNameEng(initialData.artist_name_eng || '');
    setIntroduction(initialData.introduction || '');
    setPhoto(initialData.photo || '');
    setInstagram(initialData.instagram || '');
    setTwitter(initialData.twitter || '');
    setYoutube(initialData.youtube || '');
  }, [initialData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error:', authError);
        alert('로그인이 필요합니다.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${artistId}-${Date.now()}.${fileExt}`;
      // RLS policy requires files to be in a folder named after the user's auth.uid()
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile_pictures')
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
        .from('profile_pictures')
        .getPublicUrl(filePath);

      setPhoto(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!artistName) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        artist_name: artistName,
        artist_name_eng: artistNameEng,
        introduction,
        photo,
        instagram,
        twitter,
        youtube,
      });
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">프로필 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border border-white shadow-2xl">
                {photo ? (
                  <Image
                    src={photo}
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
          </div>

          <div>
            <Label htmlFor="artist-name">이름 *</Label>
            <Input
              id="artist-name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="artist-name-eng">English Name</Label>
            <Input
              id="artist-name-eng"
              value={artistNameEng}
              onChange={(e) => setArtistNameEng(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="introduction">소개</Label>
            <Textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="bg-zinc-800 border-zinc-700 min-h-[120px]"
              placeholder="자기소개를 입력하세요..."
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Choreography Edit Modal
interface ChoreographyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreography: ChoreographyItem[]) => Promise<void>;
  initialData: ChoreographyItem[];
}

function ChoreographySortableItem({
  id,
  item,
  onToggleHighlight,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: ChoreographyItem;
  onToggleHighlight: () => void;
  onRemove: () => void;
  onUpdate: (data: { song: Song; role: string[] }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="flex gap-1 sm:gap-2 p-2 bg-white/5 rounded-lg group items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-white/10 rounded shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        </button>

        <div className="w-12 sm:w-14 shrink-0 rounded-sm overflow-hidden">
          {item.song?.youtube_link ? (
            <YouTubeThumbnail url={item.song.youtube_link} title={item.song.title} />
          ) : (
            <div className='bg-gray-600 w-full h-6'></div>
          )}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <h3 className="font-semibold max-w-40 truncate text-sm sm:text-base hover:text-green-400 transition-colors">
            {item.song?.singer} - {item.song?.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 truncate">{item.role?.join(', ')}</p>
          {item.song?.date && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.song.date).toLocaleDateString()}
            </p>
          )}
        </div>

        <button onClick={onToggleHighlight} className="p-1 sm:p-2 hover:bg-white/10 rounded shrink-0">
          <Star
            className={`w-5 h-5 sm:w-6 sm:h-6 ${item.is_highlight ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        </button>

        <button onClick={onRemove} className="p-1 sm:p-2 hover:bg-red-500/20 rounded text-red-500 shrink-0">
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Edit Modal */}
      {item.song && (
        <EditChoreographySubModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(data) => {
            onUpdate(data);
            setIsEditModalOpen(false);
          }}
          initialData={{
            song: item.song,
            role: item.role || [],
          }}
        />
      )}
    </>
  );
}

export function ChoreographyEditModal({ isOpen, onClose, onSave, initialData }: ChoreographyEditModalProps) {
  const [choreography, setChoreography] = useState<ChoreographyItem[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = choreography.findIndex((_, i) => `choreo-${i}` === active.id);
      const newIndex = choreography.findIndex((_, i) => `choreo-${i}` === over.id);
      const newChoreography = arrayMove(choreography, oldIndex, newIndex);
      const updated = newChoreography.map((item, index) => ({ ...item, display_order: index }));
      setChoreography(updated);
    }
  };

  const toggleHighlight = (index: number) => {
    const updated = [...choreography];
    updated[index] = { ...updated[index], is_highlight: !updated[index].is_highlight };
    setChoreography(updated);
  };

  const remove = (index: number) => {
    const updated = choreography.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, display_order: i }));
    setChoreography(reordered);
  };

  const addNew = (data: { song: Song; role: string[] }) => {
    const newItem: ChoreographyItem = {
      song: data.song,
      role: data.role,
      is_highlight: false,
      display_order: choreography.length,
    };
    setChoreography([...choreography, newItem]);
  };

  const updateItem = (index: number, data: { song: Song; role: string[] }) => {
    const updated = [...choreography];
    updated[index] = { ...updated[index], song: data.song, role: data.role };
    setChoreography(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(choreography);
      onClose();
    } catch (error) {
      console.error('Error saving choreography:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-4xl h-[90vh] w-[calc(100vw-2rem)] sm:w-full flex flex-col p-0 overflow-hidden">
          <div className="px-6 pt-6 shrink-0">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center gap-2">
                <span className="text-base sm:text-lg">안무 편집</span>
                <Button
                  onClick={() => setShowAddModal(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  추가
                </Button>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={choreography.map((_, i) => `choreo-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {choreography.map((item, index) => (
                    <ChoreographySortableItem
                      key={`choreo-${index}`}
                      id={`choreo-${index}`}
                      item={item}
                      onToggleHighlight={() => toggleHighlight(index)}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {choreography.length === 0 && (
              <p className="text-center text-zinc-400 py-8">안무가 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row w-full shrink-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Choreography Modal */}
      <AddChoreographySubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

// Add Choreography Sub Modal (nested within Choreography Edit Modal)
function AddChoreographySubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { song: Song; role: string[] }) => void;
}) {
  const [title, setTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [date, setDate] = useState('');
  const [roles, setRoles] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title || !singer || !youtubeLink || !date) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    onAdd({
      song: { title, singer, youtube_link: youtubeLink, date },
      role: roles,
    });

    setTitle('');
    setSinger('');
    setYoutubeLink('');
    setDate('');
    setRoles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">안무 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="singer">가수 *</Label>
            <Input
              id="singer"
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 아이유"
            />
          </div>
          <div>
            <Label htmlFor="title">곡 제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: Love poem"
            />
          </div>
          <div>
            <YouTubeSearchInput
              label="YouTube 링크"
              value={youtubeLink}
              onChange={setYoutubeLink}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">날짜 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <RoleTagInput
            id="role"
            label="역할"
            roles={roles}
            onChange={setRoles}
            placeholder="역할을 입력하고 쉼표(,)를 누르세요 (예: 안무가, 퍼포머)"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Choreography Sub Modal
function EditChoreographySubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { song: Song; role: string[] }) => void;
  initialData: { song: Song; role: string[] };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [title, setTitle] = useState(initialData.song.title || '');
  const [singer, setSinger] = useState(initialData.song.singer || '');
  const [youtubeLink, setYoutubeLink] = useState(initialData.song.youtube_link || '');
  const [date, setDate] = useState(initialData.song.date || '');
  const [roles, setRoles] = useState<string[]>(initialData.role || []);

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!title || !singer || !youtubeLink || !date) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    onUpdate({
      song: {
        song_id: initialData.song.song_id,
        title,
        singer,
        youtube_link: youtubeLink,
        date
      },
      role: roles,
    });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">안무 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-singer">가수 *</Label>
            <Input
              id="edit-singer"
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 아이유"
            />
          </div>
          <div>
            <Label htmlFor="edit-title">곡 제목 *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: Love poem"
            />
          </div>
          <div>
            <YouTubeSearchInput
              label="YouTube 링크"
              value={youtubeLink}
              onChange={setYoutubeLink}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-date">날짜 *</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <RoleTagInput
            id="edit-role"
            label="역할"
            roles={roles}
            onChange={setRoles}
            placeholder="역할을 입력하고 쉼표(,)를 누르세요 (예: 안무가, 퍼포머)"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Media Edit Modal (similar structure to Choreography)
interface MediaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaItem[]) => Promise<void>;
  initialData: MediaItem[];
}

function MediaSortableItem({
  id,
  item,
  onToggleHighlight,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: MediaItem;
  onToggleHighlight: () => void;
  onRemove: () => void;
  onUpdate: (data: { youtube_link: string; title: string; role?: string; video_date?: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="relative group flex justify-between  w-full items-center gap-1 sm:gap-2 bg-white/5 p-2 rounded-lg">
        <div className='flex items-center gap-4'>
          <button
            {...attributes}
            {...listeners}
            className="z-10 cursor-grab active:cursor-grabbing p-1 sm:p-2 bg-black/50 hover:bg-black/70 rounded shrink-0 touch-none"
          >
            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="w-12 sm:w-14 shrink-0 rounded-sm overflow-hidden">
          {item.youtube_link ? (
            <YouTubeThumbnail url={item.youtube_link} title={item.title} />
          ) : (
            <div className='bg-gray-600 w-full h-6'></div>
          )}
        </div>
          <p className="text-xs sm:text-sm text-white truncate flex-1 min-w-0 max-w-[150px] cursor-pointer hover:text-green-400 transition-colors" onClick={() => setIsEditModalOpen(true)}>{item.title}</p>
          <p className="text-xs text-gray-400 truncate hidden sm:block">
            {item.role}
            {item.video_date && (
              <span>
                {' '}
                · {new Date(item.video_date).getFullYear()}.
                {String(new Date(item.video_date).getMonth() + 1).padStart(2, '0')}
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-1 sm:gap-2 shrink-0">
          <button onClick={onToggleHighlight} className="p-1 sm:p-2 bg-black/50 hover:bg-black/70 rounded">
            <Star
              className={`w-4 h-4 sm:w-5 sm:h-5 ${item.is_highlight ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
            />
          </button>
          <button onClick={onRemove} className="p-1 sm:p-2 bg-red-500/50 hover:bg-red-500/70 rounded">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMediaSubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(data) => {
          onUpdate(data);
          setIsEditModalOpen(false);
        }}
        initialData={{
          youtube_link: item.youtube_link,
          title: item.title,
          role: item.role,
          video_date: item.video_date
            ? (typeof item.video_date === 'string'
                ? item.video_date
                : new Date(item.video_date).toISOString().split('T')[0])
            : undefined,
        }}
      />
    </>
  );
}

export function MediaEditModal({ isOpen, onClose, onSave, initialData }: MediaEditModalProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Update local state when initialData changes
  useEffect(() => {
    setMedia(initialData);
  }, [initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((_, i) => `media-${i}` === active.id);
      const newIndex = media.findIndex((_, i) => `media-${i}` === over.id);
      const newMedia = arrayMove(media, oldIndex, newIndex);
      const updated = newMedia.map((item, index) => ({ ...item, display_order: index }));
      setMedia(updated);
    }
  };

  const toggleHighlight = (index: number) => {
    const updated = [...media];
    updated[index] = { ...updated[index], is_highlight: !updated[index].is_highlight };
    setMedia(updated);
  };

  const remove = (index: number) => {
    const updated = media.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, display_order: i }));
    setMedia(reordered);
  };

  const addNew = (data: { youtube_link: string; title: string; role?: string; video_date?: string }) => {
    const newItem: MediaItem = {
      youtube_link: data.youtube_link,
      title: data.title,
      role: data.role,
      is_highlight: false,
      display_order: media.length,
      video_date: new Date(data.video_date as string) || new Date().toISOString().split('T')[0],
    };
    setMedia([...media, newItem]);
  };

  const updateItem = (index: number, data: { youtube_link: string; title: string; role?: string; video_date?: string }) => {
    const updated = [...media];
    updated[index] = {
      ...updated[index],
      youtube_link: data.youtube_link,
      title: data.title,
      role: data.role,
      video_date: data.video_date ? new Date(data.video_date) : updated[index].video_date,
    };
    setMedia(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(media);
      onClose();
    } catch (error) {
      console.error('Error saving media:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-4xl h-[90vh] w-[calc(100vw-2rem)] sm:w-full flex flex-col p-0 overflow-hidden">
          <div className="px-6 pt-6 shrink-0">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center gap-2">
                <span className="text-base sm:text-lg">미디어 편집</span>
                <Button
                  onClick={() => setShowAddModal(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  추가
                </Button>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={media.map((_, i) => `media-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-4">
                  {media.map((item, index) => (
                    <MediaSortableItem
                      key={`media-${index}`}
                      id={`media-${index}`}
                      item={item}
                      onToggleHighlight={() => toggleHighlight(index)}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {media.length === 0 && (
              <p className="text-center text-zinc-400 py-8">미디어가 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row w-full shrink-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Media Modal */}
      <AddMediaSubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

// Add Media Sub Modal
function AddMediaSubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { youtube_link: string; title: string; role?: string; video_date?: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [role, setRole] = useState('');
  const [videoDate, setVideoDate] = useState('');

  const handleSubmit = () => {
    if (!youtubeLink || !title) {
      alert('YouTube 링크와 제목을 입력해주세요.');
      return;
    }

    onAdd({
      youtube_link: youtubeLink,
      title,
      role: role || undefined,
      video_date: videoDate || undefined,
    });

    setTitle('');
    setYoutubeLink('');
    setRole('');
    setVideoDate('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">미디어 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="media-title">제목 *</Label>
            <Input
              id="media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="영상 제목"
            />
          </div>
          <div>
            <Label htmlFor="media-youtube">YouTube 링크 *</Label>
            <Input
              id="media-youtube"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label htmlFor="media-role">역할</Label>
            <Input
              id="media-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 안무가"
            />
          </div>
          <div>
            <Label htmlFor="media-date">영상 날짜</Label>
            <Input
              id="media-date"
              type="date"
              value={videoDate}
              onChange={(e) => setVideoDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Media Sub Modal
function EditMediaSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { youtube_link: string; title: string; role?: string; video_date?: string }) => void;
  initialData: { youtube_link: string; title: string; role?: string; video_date?: string };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [title, setTitle] = useState(initialData.title || '');
  const [youtubeLink, setYoutubeLink] = useState(initialData.youtube_link || '');
  const [role, setRole] = useState(initialData.role || '');
  const [videoDate, setVideoDate] = useState(initialData.video_date || '');

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!youtubeLink || !title) {
      alert('YouTube 링크와 제목을 입력해주세요.');
      return;
    }

    onUpdate({
      youtube_link: youtubeLink,
      title,
      role: role || undefined,
      video_date: videoDate || undefined,
    });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">미디어 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-media-title">제목 *</Label>
            <Input
              id="edit-media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="영상 제목"
            />
          </div>
          <div>
            <Label htmlFor="edit-media-youtube">YouTube 링크 *</Label>
            <Input
              id="edit-media-youtube"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label htmlFor="edit-media-role">역할</Label>
            <Input
              id="edit-media-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 안무가"
            />
          </div>
          <div>
            <Label htmlFor="edit-media-date">영상 날짜</Label>
            <Input
              id="edit-media-date"
              type="date"
              value={videoDate}
              onChange={(e) => setVideoDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Performances Edit Modal
interface PerformancesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (performances: PerformanceItem[]) => Promise<void>;
  initialData: PerformanceItem[];
}

function PerformanceSortableItem({
  id,
  item,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: PerformanceItem;
  onRemove: () => void;
  onUpdate: (data: { performance_title: string; date: string; category?: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="p-6 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors flex gap-2 items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-white/10 rounded shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        </button>
        <div className="flex-1 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <h3 className="font-semibold text-lg mb-2 hover:text-green-400 transition-colors">{item.performance?.performance_title}</h3>
          {item.performance?.date && (
            <p className="text-sm text-gray-400">
              {new Date(item.performance.date).toLocaleDateString()}
            </p>
          )}
          {item.performance?.category && (
            <p className="text-xs text-gray-500 mt-1">{item.performance.category}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      {item.performance && (
        <EditPerformanceSubModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(data) => {
            onUpdate(data);
            setIsEditModalOpen(false);
          }}
          initialData={{
            performance_title: item.performance.performance_title,
            date: item.performance.date,
            category: item.performance.category,
          }}
        />
      )}
    </>
  );
}

export function PerformancesEditModal({ isOpen, onClose, onSave, initialData }: PerformancesEditModalProps) {
  const [performances, setPerformances] = useState<PerformanceItem[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = performances.findIndex((_, i) => `performance-${i}` === active.id);
      const newIndex = performances.findIndex((_, i) => `performance-${i}` === over.id);
      const newPerformances = arrayMove(performances, oldIndex, newIndex);
      setPerformances(newPerformances);
    }
  };

  const remove = (index: number) => {
    setPerformances(performances.filter((_, i) => i !== index));
  };

  const addNew = (data: { performance_title: string; date: string; category?: string }) => {
    const newItem: PerformanceItem = {
      performance: {
        performance_title: data.performance_title,
        date: data.date,
        category: data.category,
      },
    };
    setPerformances([...performances, newItem]);
  };

  const updateItem = (index: number, data: { performance_title: string; date: string; category?: string }) => {
    const updated = [...performances];
    updated[index] = {
      ...updated[index],
      performance: {
        performance_title: data.performance_title,
        date: data.date,
        category: data.category,
      },
    };
    setPerformances(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(performances);
      onClose();
    } catch (error) {
      console.error('Error saving performances:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center gap-2">
              <span className="text-base sm:text-lg">공연 편집</span>
              <Button
                onClick={() => setShowAddModal(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                추가
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={performances.map((_, i) => `performance-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-4">
                  {performances.map((item, index) => (
                    <PerformanceSortableItem
                      key={`performance-${index}`}
                      id={`performance-${index}`}
                      item={item}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {performances.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">공연이 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddPerformanceSubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

function AddPerformanceSubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { performance_title: string; date: string; category?: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    if (!title || !date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }

    onAdd({
      performance_title: title,
      date,
      category: category || undefined,
    });

    setTitle('');
    setDate('');
    setCategory('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">공연 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="perf-title">공연 제목 *</Label>
            <Input
              id="perf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="공연 이름"
            />
          </div>
          <div>
            <Label htmlFor="perf-date">날짜 *</Label>
            <Input
              id="perf-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="perf-category">카테고리</Label>
            <Input
              id="perf-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 참가, 주최"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Performance Sub Modal
function EditPerformanceSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { performance_title: string; date: string; category?: string }) => void;
  initialData: { performance_title: string; date: string; category?: string };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [title, setTitle] = useState(initialData.performance_title || '');
  const [date, setDate] = useState(initialData.date || '');
  const [category, setCategory] = useState(initialData.category || '');

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!title || !date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }

    onUpdate({
      performance_title: title,
      date,
      category: category || undefined,
    });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">공연 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-perf-title">공연 제목 *</Label>
            <Input
              id="edit-perf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="공연 이름"
            />
          </div>
          <div>
            <Label htmlFor="edit-perf-date">날짜 *</Label>
            <Input
              id="edit-perf-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="edit-perf-category">카테고리</Label>
            <Input
              id="edit-perf-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 참가, 주최"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Similar modals for Directing, Workshops, Awards
interface DirectingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (directing: DirectingItem[]) => Promise<void>;
  initialData: DirectingItem[];
}

function DirectingSortableItem({
  id,
  item,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: DirectingItem;
  onRemove: () => void;
  onUpdate: (data: { title: string; date: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="p-4 bg-white/5 rounded-lg group relative hover:bg-white/10 transition-colors flex gap-2 items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-white/10 rounded shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        </button>
        <div className="flex-1 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <h3 className="font-semibold hover:text-green-400 transition-colors">{item.directing?.title}</h3>
          {item.directing?.date && (
            <p className="text-sm text-gray-400 mt-1">
              {new Date(item.directing.date).getFullYear()}.
              {String(new Date(item.directing.date).getMonth() + 1).padStart(2, '0')}
            </p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      {item.directing && (
        <EditDirectingSubModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(data) => {
            onUpdate(data);
            setIsEditModalOpen(false);
          }}
          initialData={{
            title: item.directing.title,
            date: item.directing.date,
          }}
        />
      )}
    </>
  );
}

export function DirectingEditModal({ isOpen, onClose, onSave, initialData }: DirectingEditModalProps) {
  const [directing, setDirecting] = useState<DirectingItem[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = directing.findIndex((_, i) => `directing-${i}` === active.id);
      const newIndex = directing.findIndex((_, i) => `directing-${i}` === over.id);
      const newDirecting = arrayMove(directing, oldIndex, newIndex);
      setDirecting(newDirecting);
    }
  };

  const remove = (index: number) => {
    setDirecting(directing.filter((_, i) => i !== index));
  };

  const addNew = (data: { title: string; date: string }) => {
    const newItem: DirectingItem = {
      directing: { title: data.title, date: data.date },
    };
    setDirecting([...directing, newItem]);
  };

  const updateItem = (index: number, data: { title: string; date: string }) => {
    const updated = [...directing];
    updated[index] = {
      ...updated[index],
      directing: { title: data.title, date: data.date },
    };
    setDirecting(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(directing);
      onClose();
    } catch (error) {
      console.error('Error saving directing:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center gap-2">
              <span className="text-base sm:text-lg">연출 편집</span>
              <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                추가
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={directing.map((_, i) => `directing-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {directing.map((item, index) => (
                    <DirectingSortableItem
                      key={`directing-${index}`}
                      id={`directing-${index}`}
                      item={item}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {directing.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">연출 작품이 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddDirectingSubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

function AddDirectingSubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { title: string; date: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = () => {
    if (!title || !date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }
    onAdd({ title, date });
    setTitle('');
    setDate('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">연출 작품 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="dir-title">작품 제목 *</Label>
            <Input
              id="dir-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="연출 작품명"
            />
          </div>
          <div>
            <Label htmlFor="dir-date">날짜 *</Label>
            <Input
              id="dir-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Directing Sub Modal
function EditDirectingSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { title: string; date: string }) => void;
  initialData: { title: string; date: string };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [title, setTitle] = useState(initialData.title || '');
  const [date, setDate] = useState(initialData.date || '');

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!title || !date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }
    onUpdate({ title, date });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">연출 작품 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-dir-title">작품 제목 *</Label>
            <Input
              id="edit-dir-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="연출 작품명"
            />
          </div>
          <div>
            <Label htmlFor="edit-dir-date">날짜 *</Label>
            <Input
              id="edit-dir-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Workshops Edit Modal
interface WorkshopsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workshops: Workshop[]) => Promise<void>;
  initialData: Workshop[];
}

function WorkshopSortableItem({
  id,
  item,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: Workshop;
  onRemove: () => void;
  onUpdate: (data: { class_name: string; class_date: string; country: string; class_role?: string[] }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="p-4 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors flex gap-2 items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-white/10 rounded shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        </button>
        <div className="flex-1 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <h3 className="font-semibold hover:text-green-400 transition-colors">{item.class_name}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {item.class_role?.join(', ')} • {item.country}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(item.class_date).getFullYear()}.
            {String(new Date(item.class_date).getMonth() + 1).padStart(2, '0')}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      <EditWorkshopSubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(data) => {
          onUpdate(data);
          setIsEditModalOpen(false);
        }}
        initialData={{
          class_name: item.class_name,
          class_date: item.class_date,
          country: item.country,
          class_role: item.class_role,
        }}
      />
    </>
  );
}

export function WorkshopsEditModal({ isOpen, onClose, onSave, initialData }: WorkshopsEditModalProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = workshops.findIndex((_, i) => `workshop-${i}` === active.id);
      const newIndex = workshops.findIndex((_, i) => `workshop-${i}` === over.id);
      const newWorkshops = arrayMove(workshops, oldIndex, newIndex);
      setWorkshops(newWorkshops);
    }
  };

  const remove = (index: number) => {
    setWorkshops(workshops.filter((_, i) => i !== index));
  };

  const addNew = (data: { class_name: string; class_date: string; country: string; class_role?: string[] }) => {
    setWorkshops([...workshops, data]);
  };

  const updateItem = (index: number, data: { class_name: string; class_date: string; country: string; class_role?: string[] }) => {
    const updated = [...workshops];
    updated[index] = data;
    setWorkshops(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(workshops);
      onClose();
    } catch (error) {
      console.error('Error saving workshops:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center gap-2">
              <span className="text-base sm:text-lg">워크샵/클래스 편집</span>
              <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                추가
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={workshops.map((_, i) => `workshop-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {workshops.map((workshop, index) => (
                    <WorkshopSortableItem
                      key={`workshop-${index}`}
                      id={`workshop-${index}`}
                      item={workshop}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {workshops.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">워크샵이 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddWorkshopSubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

function AddWorkshopSubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { class_name: string; class_date: string; country: string; class_role?: string[] }) => void;
}) {
  const [className, setClassName] = useState('');
  const [classDate, setClassDate] = useState('');
  const [country, setCountry] = useState('');
  const [classRoles, setClassRoles] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!className || !classDate || !country) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }
    onAdd({
      class_name: className,
      class_date: classDate,
      country,
      class_role: classRoles,
    });
    setClassName('');
    setClassDate('');
    setCountry('');
    setClassRoles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">워크샵/클래스 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="class-name">클래스 이름 *</Label>
            <Input
              id="class-name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="워크샵 또는 클래스명"
            />
          </div>
          <div>
            <Label htmlFor="class-date">날짜 *</Label>
            <Input
              id="class-date"
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="class-country">국가 *</Label>
            <Input
              id="class-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 한국, USA"
            />
          </div>
          <RoleTagInput
            id="class-role"
            label="역할"
            roles={classRoles}
            onChange={setClassRoles}
            placeholder="역할을 입력하고 쉼표(,)를 누르세요 (예: 강사, 게스트)"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Workshop Sub Modal
function EditWorkshopSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { class_name: string; class_date: string; country: string; class_role?: string[] }) => void;
  initialData: { class_name: string; class_date: string; country: string; class_role?: string[] };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [className, setClassName] = useState(initialData.class_name || '');
  const [classDate, setClassDate] = useState(initialData.class_date || '');
  const [country, setCountry] = useState(initialData.country || '');
  const [classRoles, setClassRoles] = useState<string[]>(initialData.class_role || []);

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!className || !classDate || !country) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }
    onUpdate({
      class_name: className,
      class_date: classDate,
      country,
      class_role: classRoles,
    });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">워크샵/클래스 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-class-name">클래스 이름 *</Label>
            <Input
              id="edit-class-name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="워크샵 또는 클래스명"
            />
          </div>
          <div>
            <Label htmlFor="edit-class-date">날짜 *</Label>
            <Input
              id="edit-class-date"
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="edit-class-country">국가 *</Label>
            <Input
              id="edit-class-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 한국, USA"
            />
          </div>
          <RoleTagInput
            id="edit-class-role"
            label="역할"
            roles={classRoles}
            onChange={setClassRoles}
            placeholder="역할을 입력하고 쉼표(,)를 누르세요 (예: 강사, 게스트)"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Awards Edit Modal
interface AwardsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (awards: Award[]) => Promise<void>;
  initialData: Award[];
}

function AwardSortableItem({
  id,
  item,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: Award;
  onRemove: () => void;
  onUpdate: (data: { award_title: string; issuing_org: string; received_date: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="p-4 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors flex gap-2 items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-white/10 rounded shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        </button>
        <div className="flex-1 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <h3 className="font-semibold hover:text-green-400 transition-colors">{item.award_title}</h3>
          <p className="text-sm text-gray-400 mt-1">{item.issuing_org}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(item.received_date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      <EditAwardSubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(data) => {
          onUpdate(data);
          setIsEditModalOpen(false);
        }}
        initialData={{
          award_title: item.award_title,
          issuing_org: item.issuing_org,
          received_date: item.received_date,
        }}
      />
    </>
  );
}

export function AwardsEditModal({ isOpen, onClose, onSave, initialData }: AwardsEditModalProps) {
  const [awards, setAwards] = useState<Award[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = awards.findIndex((_, i) => `award-${i}` === active.id);
      const newIndex = awards.findIndex((_, i) => `award-${i}` === over.id);
      const newAwards = arrayMove(awards, oldIndex, newIndex);
      setAwards(newAwards);
    }
  };

  const remove = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const addNew = (data: { award_title: string; issuing_org: string; received_date: string }) => {
    setAwards([...awards, data]);
  };

  const updateItem = (index: number, data: { award_title: string; issuing_org: string; received_date: string }) => {
    const updated = [...awards];
    updated[index] = data;
    setAwards(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(awards);
      onClose();
    } catch (error) {
      console.error('Error saving awards:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center gap-2">
              <span className="text-base sm:text-lg">수상 경력 편집</span>
              <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                추가
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={awards.map((_, i) => `award-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {awards.map((award, index) => (
                    <AwardSortableItem
                      key={`award-${index}`}
                      id={`award-${index}`}
                      item={award}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {awards.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">수상 경력이 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddAwardSubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

function AddAwardSubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { award_title: string; issuing_org: string; received_date: string }) => void;
}) {
  const [awardTitle, setAwardTitle] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [receivedDate, setReceivedDate] = useState('');

  const handleSubmit = () => {
    if (!awardTitle || !issuingOrg || !receivedDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onAdd({
      award_title: awardTitle,
      issuing_org: issuingOrg,
      received_date: receivedDate,
    });
    setAwardTitle('');
    setIssuingOrg('');
    setReceivedDate('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">수상 경력 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="award-title">수상명 *</Label>
            <Input
              id="award-title"
              value={awardTitle}
              onChange={(e) => setAwardTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="상 이름"
            />
          </div>
          <div>
            <Label htmlFor="award-org">수여 기관 *</Label>
            <Input
              id="award-org"
              value={issuingOrg}
              onChange={(e) => setIssuingOrg(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="수여한 조직/기관"
            />
          </div>
          <div>
            <Label htmlFor="award-date">수상 날짜 *</Label>
            <Input
              id="award-date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Award Sub Modal
function EditAwardSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { award_title: string; issuing_org: string; received_date: string }) => void;
  initialData: { award_title: string; issuing_org: string; received_date: string };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [awardTitle, setAwardTitle] = useState(initialData.award_title || '');
  const [issuingOrg, setIssuingOrg] = useState(initialData.issuing_org || '');
  const [receivedDate, setReceivedDate] = useState(initialData.received_date || '');

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!awardTitle || !issuingOrg || !receivedDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onUpdate({
      award_title: awardTitle,
      issuing_org: issuingOrg,
      received_date: receivedDate,
    });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">수상 경력 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-award-title">수상명 *</Label>
            <Input
              id="edit-award-title"
              value={awardTitle}
              onChange={(e) => setAwardTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="상 이름"
            />
          </div>
          <div>
            <Label htmlFor="edit-award-org">수여 기관 *</Label>
            <Input
              id="edit-award-org"
              value={issuingOrg}
              onChange={(e) => setIssuingOrg(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="수여한 조직/기관"
            />
          </div>
          <div>
            <Label htmlFor="edit-award-date">수상 날짜 *</Label>
            <Input
              id="edit-award-date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Visas Edit Modal
interface VisasEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visas: { country_code: string; start_date: string; end_date: string }[]) => Promise<void>;
  initialData: { visa_id?: string; country_code: string; start_date: string; end_date: string }[];
}

function VisaSortableItem({
  id,
  item,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: { visa_id?: string; country_code: string; start_date: string; end_date: string };
  onRemove: () => void;
  onUpdate: (data: { country_code: string; start_date: string; end_date: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getCountryName = (code: string) => {
    return COUNTRY_CODES.find(c => c.code === code)?.name || code;
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="p-4 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors flex gap-2 items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-white/10 rounded shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src={`https://flagsapi.com/${item.country_code}/flat/32.png`}
            alt={getCountryName(item.country_code)}
            width={32}
            height={24}
            className="rounded-sm"
          />
        </div>
        <div className="flex-1 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <h3 className="font-semibold hover:text-green-400 transition-colors">{getCountryName(item.country_code)}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <EditVisaSubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(data) => {
          onUpdate(data);
          setIsEditModalOpen(false);
        }}
        initialData={{
          country_code: item.country_code,
          start_date: item.start_date,
          end_date: item.end_date,
        }}
      />
    </>
  );
}

export function VisasEditModal({ isOpen, onClose, onSave, initialData }: VisasEditModalProps) {
  const [visas, setVisas] = useState<{ visa_id?: string; country_code: string; start_date: string; end_date: string }[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visas.findIndex((_, i) => `visa-${i}` === active.id);
      const newIndex = visas.findIndex((_, i) => `visa-${i}` === over.id);
      const newVisas = arrayMove(visas, oldIndex, newIndex);
      setVisas(newVisas);
    }
  };

  const remove = (index: number) => {
    setVisas(visas.filter((_, i) => i !== index));
  };

  const addNew = (data: { country_code: string; start_date: string; end_date: string }) => {
    setVisas([...visas, data]);
  };

  const updateItem = (index: number, data: { country_code: string; start_date: string; end_date: string }) => {
    const updated = [...visas];
    updated[index] = { ...updated[index], ...data };
    setVisas(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(visas);
      onClose();
    } catch (error) {
      console.error('Error saving visas:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center gap-2">
              <span className="text-base sm:text-lg">비자 편집</span>
              <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                추가
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={visas.map((_, i) => `visa-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {visas.map((visa, index) => (
                    <VisaSortableItem
                      key={`visa-${index}`}
                      id={`visa-${index}`}
                      item={visa}
                      onRemove={() => remove(index)}
                      onUpdate={(data) => updateItem(index, data)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {visas.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">비자가 없습니다. 추가 버튼을 눌러 추가해보세요.</p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddVisaSubModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addNew(data);
          setShowAddModal(false);
        }}
      />
    </>
  );
}

function AddVisaSubModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { country_code: string; start_date: string; end_date: string }) => void;
}) {
  const [countryCode, setCountryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCountryName = (code: string) => {
    return COUNTRY_CODES.find(c => c.code === code)?.name || code;
  };

  const handleSubmit = () => {
    if (!countryCode || !startDate || !endDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onAdd({
      country_code: countryCode,
      start_date: startDate,
      end_date: endDate,
    });
    setCountryCode('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">비자 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="visa-country">국가 *</Label>
            {countryCode ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                <Image
                  src={`https://flagsapi.com/${countryCode}/flat/32.png`}
                  alt={getCountryName(countryCode)}
                  width={32}
                  height={24}
                  className="rounded-sm"
                />
                <span className="flex-1">{getCountryName(countryCode)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCountryCode('')}
                  className="text-red-400 hover:text-red-300"
                >
                  변경
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="visa-country"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="국가를 검색하세요..."
                />
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          onClick={() => {
                            setCountryCode(country.code);
                            setSearchTerm('');
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 cursor-pointer transition-colors"
                        >
                          <Image
                            src={`https://flagsapi.com/${country.code}/flat/24.png`}
                            alt={country.name}
                            width={24}
                            height={18}
                            className="rounded-sm"
                          />
                          <span className="text-white text-sm">{country.name}</span>
                          <span className="text-gray-500 text-xs ml-auto">{country.code}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">
                        국가를 찾을 수 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="visa-start-date">시작 날짜 *</Label>
            <Input
              id="visa-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="visa-end-date">종료 날짜 *</Label>
            <Input
              id="visa-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditVisaSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { country_code: string; start_date: string; end_date: string }) => void;
  initialData: { country_code: string; start_date: string; end_date: string };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [countryCode, setCountryCode] = useState(initialData.country_code || '');
  const [startDate, setStartDate] = useState(initialData.start_date || '');
  const [endDate, setEndDate] = useState(initialData.end_date || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCountryName = (code: string) => {
    return COUNTRY_CODES.find(c => c.code === code)?.name || code;
  };

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!countryCode || !startDate || !endDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onUpdate({
      country_code: countryCode,
      start_date: startDate,
      end_date: endDate,
    });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">비자 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-visa-country">국가 *</Label>
            {countryCode ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                <Image
                  src={`https://flagsapi.com/${countryCode}/flat/32.png`}
                  alt={getCountryName(countryCode)}
                  width={32}
                  height={24}
                  className="rounded-sm"
                />
                <span className="flex-1">{getCountryName(countryCode)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCountryCode('')}
                  className="text-red-400 hover:text-red-300"
                >
                  변경
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="edit-visa-country"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="국가를 검색하세요..."
                />
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          onClick={() => {
                            setCountryCode(country.code);
                            setSearchTerm('');
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 cursor-pointer transition-colors"
                        >
                          <Image
                            src={`https://flagsapi.com/${country.code}/flat/24.png`}
                            alt={country.name}
                            width={24}
                            height={18}
                            className="rounded-sm"
                          />
                          <span className="text-white text-sm">{country.name}</span>
                          <span className="text-gray-500 text-xs ml-auto">{country.code}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">
                        국가를 찾을 수 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="edit-visa-start-date">시작 날짜 *</Label>
            <Input
              id="edit-visa-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="edit-visa-end-date">종료 날짜 *</Label>
            <Input
              id="edit-visa-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-zinc-700 w-full sm:w-auto">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
