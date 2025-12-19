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
import { YouTubeSearchInput } from '@/components/YouTubeSearchInput';
import { RoleTagInput } from '../RoleTagInput';
import { ChoreographyItem, Song } from './types';
import { YouTubeThumbnail } from './utilities';

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
