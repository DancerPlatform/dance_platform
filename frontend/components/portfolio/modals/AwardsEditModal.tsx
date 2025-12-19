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
import { Award } from './types';

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
