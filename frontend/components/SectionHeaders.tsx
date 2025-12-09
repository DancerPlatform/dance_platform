interface SectionHeadersProps {
  title: string;
  sortOrder: 'display_order' | 'date';
  onToggleSort: () => void;
}

export function SectionHeaders({ title, sortOrder, onToggleSort }: SectionHeadersProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      <div className="flex gap-4">
        <button
          onClick={onToggleSort}
          className={`text-xs transition-colors ${
            sortOrder === 'display_order'
              ? 'text-green-400 font-semibold'
              : 'text-gray-400 hover:bg-white/20'
          }`}
        >
          설정순
        </button>
        <button
          onClick={onToggleSort}
          className={`text-xs transition-colors ${
            sortOrder === 'date'
              ? 'text-green-400 font-semibold'
              : 'text-gray-400 hover:bg-white/20'
          }`}
        >
          최신순
        </button>
      </div>
    </div>
  );
}
