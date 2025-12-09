import Image from 'next/image';
import { Edit } from 'lucide-react';

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
    <div className={`relative ${heightClass} overflow-hidden`}>
      {photoUrl && (
        <>
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute bottom-0 inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3">{name}</h1>
        {nameEng && (
          <p className="text-xl sm:text-2xl text-gray-300 mb-3 sm:mb-4">{nameEng}</p>
        )}

        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>프로필 편집</span>
          </button>
        )}
      </div>
    </div>
  );
}
