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
import { PerformanceItem } from './types';

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
