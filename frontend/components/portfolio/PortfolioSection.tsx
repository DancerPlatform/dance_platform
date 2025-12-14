import { ReactNode } from 'react';
import { Edit } from 'lucide-react';
import { SectionHeaders } from '@/components/SectionHeaders';
import { SortOrder } from '@/hooks/usePortfolioSort';

interface PortfolioSectionProps {
  title: string;
  sortOrder: SortOrder;
  onToggleSort: () => void;
  editable?: boolean;
  onEdit?: () => void;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function PortfolioSection({
  title,
  sortOrder,
  onToggleSort,
  editable = false,
  onEdit,
  isEmpty = false,
  emptyMessage,
  children,
}: PortfolioSectionProps) {
  return (
    <section>
      {editable && onEdit ? (
        <div className="flex justify-between items-center sm:mb-6 gap-2">
          <SectionHeaders
            title={title}
            sortOrder={sortOrder}
            onToggleSort={onToggleSort}
            edit={editable}
          />
          <button
            onClick={onEdit}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">편집</span>
          </button>
        </div>
      ) : (
        <div className="mb-4 sm:mb-6">
          <SectionHeaders
            title={title}
            sortOrder={sortOrder}
            onToggleSort={onToggleSort}
          />
        </div>
      )}

      {isEmpty && emptyMessage ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}
