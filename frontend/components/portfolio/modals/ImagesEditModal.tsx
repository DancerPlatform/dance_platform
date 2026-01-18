'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, Plus, Trash2, Upload } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GalleryImage } from '@/types/portfolio';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface ImagesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (images: GalleryImage[]) => Promise<void>;
  initialData: GalleryImage[];
  artistId: string;
}

function ImageSortableItem({
  id,
  item,
  onRemove,
  onUpdate,
}: {
  id: string;
  item: GalleryImage;
  onRemove: () => void;
  onUpdate: (data: { caption?: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="relative group flex justify-between w-full items-center gap-1 sm:gap-2 bg-white/5 p-2 rounded-lg">
        <div className='flex items-center gap-4'>
          <button
            {...attributes}
            {...listeners}
            className="z-10 cursor-grab active:cursor-grabbing p-1 sm:p-2 bg-black/50 hover:bg-black/70 rounded shrink-0 touch-none"
          >
            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-sm overflow-hidden bg-zinc-800">
            <Image
              src={item.image_url}
              alt={item.caption || 'Gallery image'}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <p
            className="text-xs sm:text-sm text-white truncate flex-1 min-w-0 max-w-[150px] cursor-pointer hover:text-green-400 transition-colors"
            onClick={() => setIsEditModalOpen(true)}
          >
            {item.caption || 'No caption'}
          </p>
        </div>

        <div className="flex gap-1 sm:gap-2 shrink-0">
          <button onClick={onRemove} className="p-1 sm:p-2 bg-red-500/50 hover:bg-red-500/70 rounded">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Edit Caption Modal */}
      <EditImageSubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(data) => {
          onUpdate(data);
          setIsEditModalOpen(false);
        }}
        initialData={{
          caption: item.caption,
          image_url: item.image_url,
        }}
      />
    </>
  );
}

export function ImagesEditModal({ isOpen, onClose, onSave, initialData, artistId }: ImagesEditModalProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialData);
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
      const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex);
      const updated = newImages.map((item, index) => ({ ...item, display_order: index }));
      setImages(updated);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        alert('로그인이 필요합니다.');
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${artistId}-gallery-${Date.now()}-${i}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('artist_gallery')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          alert(`이미지 업로드에 실패했습니다: ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('artist_gallery')
          .getPublicUrl(filePath);

        const newImage: GalleryImage = {
          image_url: publicUrl,
          caption: '',
          display_order: images.length + i,
        };
        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const remove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, display_order: i }));
    setImages(reordered);
  };

  const updateItem = (index: number, data: { caption?: string }) => {
    const updated = [...images];
    updated[index] = {
      ...updated[index],
      caption: data.caption,
    };
    setImages(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(images);
      onClose();
    } catch (error) {
      console.error('Error saving images:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-4xl h-[90vh] w-[calc(100vw-2rem)] sm:w-full flex flex-col p-0 overflow-hidden">
        <div className="px-6 pt-6 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center gap-2">
              <span className="text-base sm:text-lg">갤러리 편집</span>
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                className="bg-green-600 hover:bg-green-700 shrink-0 text-xs sm:text-sm"
                disabled={isUploading}
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isUploading ? '업로드 중...' : '이미지 추가'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={images.map((_, i) => `image-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4">
                {images.map((item, index) => (
                  <ImageSortableItem
                    key={`image-${index}`}
                    id={`image-${index}`}
                    item={item}
                    onRemove={() => remove(index)}
                    onUpdate={(data) => updateItem(index, data)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="w-12 h-12 text-zinc-500 mb-4" />
              <p className="text-zinc-400 mb-2">갤러리에 이미지가 없습니다</p>
              <p className="text-zinc-500 text-sm">이미지 추가 버튼을 눌러 사진을 업로드하세요</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row w-full shrink-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving || isUploading}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving || isUploading}>
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Image Caption Sub Modal
function EditImageSubModal({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { caption?: string }) => void;
  initialData: { caption?: string; image_url: string };
}) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [caption, setCaption] = useState(initialData.caption || '');

  useEffect(() => {
    setInternalOpen(isOpen);
    setCaption(initialData.caption || '');
  }, [isOpen, initialData]);

  const handleClose = (open: boolean) => {
    if (!open) {
      setInternalOpen(false);
      onClose();
    }
  };

  const handleSubmit = () => {
    onUpdate({ caption: caption || undefined });
    handleClose(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">이미지 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden bg-zinc-800">
              <Image
                src={initialData.image_url}
                alt={caption || 'Gallery image'}
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="image-caption">캡션</Label>
            <Input
              id="image-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="이미지 설명을 입력하세요"
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
