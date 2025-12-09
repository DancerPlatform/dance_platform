import { useState } from 'react';

export type SortOrder = 'display_order' | 'date';

export type PortfolioSectionType =
  | 'highlights'
  | 'choreographies'
  | 'media'
  | 'directing'
  | 'performances'
  | 'workshops';

interface UsePortfolioSortReturn {
  sortOrders: Record<string, SortOrder>;
  toggleSortOrder: (section: string) => void;
}

export function usePortfolioSort(): UsePortfolioSortReturn {
  const [sortOrders, setSortOrders] = useState<Record<string, SortOrder>>({
    highlights: 'display_order',
    choreographies: 'display_order',
    media: 'display_order',
    directing: 'display_order',
    performances: 'display_order',
    workshops: 'display_order',
  });

  const toggleSortOrder = (section: string) => {
    setSortOrders(prev => ({
      ...prev,
      [section]: prev[section] === 'display_order' ? 'date' : 'display_order'
    }));
  };

  return { sortOrders, toggleSortOrder };
}
