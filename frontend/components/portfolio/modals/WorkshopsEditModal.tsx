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
import { Workshop } from './types';
import { RoleTagInput } from '../RoleTagInput';

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
