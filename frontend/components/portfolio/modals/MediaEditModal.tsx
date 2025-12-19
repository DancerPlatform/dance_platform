'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, Star, Plus, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MediaItem } from '@/types/portfolio';
import { YouTubeThumbnail } from './utilities';

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
