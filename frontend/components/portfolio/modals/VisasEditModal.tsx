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
import Image from 'next/image';
import { COUNTRY_CODES } from '@/lib/countryCodes';

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
