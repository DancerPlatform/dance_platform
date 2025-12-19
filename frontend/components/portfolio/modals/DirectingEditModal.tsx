'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DirectingItem } from './types';

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
