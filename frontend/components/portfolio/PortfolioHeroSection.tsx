import Image from 'next/image';
import { Edit, Camera } from 'lucide-react';

interface PortfolioHeroSectionProps {
  photoUrl?: string | null;
  name: string;
  nameEng?: string | null;
  heightClass?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export function PortfolioHeroSection({
  photoUrl,
  name,
  nameEng,
  heightClass = 'h-[400px] sm:h-[500px]',
  editable = false,
  onEdit,
}: PortfolioHeroSectionProps) {
  return (
    <div className={`relative ${heightClass} overflow-hidden bg-zinc-900 group`}>
      {/* Photo/Camera Area - Clickable when editable */}
      <div
        className={`absolute inset-0 ${editable ? 'cursor-pointer' : ''}`}
        onClick={editable && onEdit ? onEdit : undefined}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        onKeyDown={editable && onEdit ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
          }
        } : undefined}
      >
        {photoUrl ? (
          <>
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover object-top"
              priority
            />
            {editable && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Camera className="w-12 h-12" strokeWidth={1.5} />
                  <span className="text-sm font-medium">프로필 사진 변경</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-600">
                <Camera className="w-24 h-24 sm:w-32 sm:h-32" strokeWidth={1.5} />
                {editable && (
                  <span className="text-sm sm:text-base font-medium">프로필 사진 추가</span>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 inset-0 bg-gradient-to-b from-transparent via-black/30 to-black pointer-events-none"></div>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-center flex flex-col items-center pointer-events-none">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3">{name}</h1>
        {nameEng && (
          <p className="text-xl sm:text-2xl text-gray-300 mb-3 sm:mb-4">{nameEng}</p>
        )}

        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors pointer-events-auto"
          >
            <Edit className="w-4 h-4" />
            <span>프로필 편집</span>
          </button>
        )}
      </div>
    </div>
  );
}
