import { SortOrder } from '@/hooks/usePortfolioSort';

// Utility function to chunk array into smaller arrays
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Sorting functions for different portfolio sections
export function sortChoreographyByDate(items: any[]) {
  return [...items].sort((a, b) => {
    const dateA = a.song?.date ? new Date(a.song.date).getTime() : 0;
    const dateB = b.song?.date ? new Date(b.song.date).getTime() : 0;
    return dateB - dateA; // Most recent first
  });
}

export function sortMediaByDate(items: any[]) {
  return [...items].sort((a, b) => {
    const dateA = a.video_date ? new Date(a.video_date).getTime() : 0;
    const dateB = b.video_date ? new Date(b.video_date).getTime() : 0;
    return dateB - dateA;
  });
}

export function sortDirectingByDate(items: any[]) {
  return [...items].sort((a, b) => {
    const dateA = a.directing_date ? new Date(a.directing_date).getTime() : 0;
    const dateB = b.directing_date ? new Date(b.directing_date).getTime() : 0;
    return dateB - dateA;
  });
}

export function sortPerformancesByDate(items: any[]) {
  return [...items].sort((a, b) => {
    const dateA = a.performance_date ? new Date(a.performance_date).getTime() : 0;
    const dateB = b.performance_date ? new Date(b.performance_date).getTime() : 0;
    return dateB - dateA;
  });
}

export function sortWorkshopsByDate(items: any[]) {
  return [...items].sort((a, b) => {
    const dateA = a.workshop_date ? new Date(a.workshop_date).getTime() : 0;
    const dateB = b.workshop_date ? new Date(b.workshop_date).getTime() : 0;
    return dateB - dateA;
  });
}

// Generic sort function that applies sorting based on section type and sort order
export function sortPortfolioData<T extends { display_order: number }>(
  data: T[],
  sortOrder: SortOrder,
  sortByDateFn?: (items: T[]) => T[]
): T[] {
  if (sortOrder === 'date' && sortByDateFn) {
    return sortByDateFn(data);
  }
  return [...data].sort((a, b) => a.display_order - b.display_order);
}

// Data transformation functions
export function getChoreographyData(choreographies: any[], sortOrder: SortOrder) {
  const data = choreographies.map(item => ({
    id: item.id,
    song: {
      singer: item.song?.singer || '',
      title: item.song?.title || '',
      date: item.song?.date || null,
    },
    role: item.role || [],
    youtube_link: item.youtube_link || '',
    display_order: item.display_order,
  }));

  return sortPortfolioData(data, sortOrder, sortChoreographyByDate);
}

export function getMediaData(media: any[], sortOrder: SortOrder) {
  const data = media.map(item => ({
    id: item.id,
    title: item.title || '',
    role: item.role || [],
    youtube_link: item.youtube_link || '',
    video_date: item.video_date || null,
    display_order: item.display_order,
  }));

  return sortPortfolioData(data, sortOrder, sortMediaByDate);
}

export function getHighlightsData(highlights: any[], sortOrder: SortOrder) {
  const data = highlights.flatMap(item => {
    const baseItem = {
      id: item.id,
      display_order: item.display_order,
    };

    if (item.choreography_id) {
      return {
        ...baseItem,
        type: 'choreography' as const,
        song: {
          singer: item.choreography?.song?.singer || '',
          title: item.choreography?.song?.title || '',
          date: item.choreography?.song?.date || null,
        },
        role: item.choreography?.role || [],
        youtube_link: item.choreography?.youtube_link || '',
      };
    } else if (item.media_id) {
      return {
        ...baseItem,
        type: 'media' as const,
        title: item.media?.title || '',
        role: item.media?.role || [],
        youtube_link: item.media?.youtube_link || '',
        video_date: item.media?.video_date || null,
      };
    }
    return [];
  });

  if (sortOrder === 'date') {
    return data.sort((a, b) => {
      const dateA = 'song' in a && a.song?.date
        ? new Date(a.song.date).getTime()
        : 'video_date' in a && a.video_date
        ? new Date(a.video_date).getTime()
        : 0;
      const dateB = 'song' in b && b.song?.date
        ? new Date(b.song.date).getTime()
        : 'video_date' in b && b.video_date
        ? new Date(b.video_date).getTime()
        : 0;
      return dateB - dateA;
    });
  }
  return data.sort((a, b) => a.display_order - b.display_order);
}

export function getDirectingData(directing: any[], sortOrder: SortOrder) {
  const data = directing.map(item => ({
    id: item.id,
    title: item.title || '',
    directing_date: item.directing_date || null,
    display_order: item.display_order,
  }));

  return sortPortfolioData(data, sortOrder, sortDirectingByDate);
}

export function getPerformancesData(performances: any[], sortOrder: SortOrder) {
  const data = performances.map(item => ({
    id: item.id,
    title: item.title || '',
    performance_date: item.performance_date || null,
    display_order: item.display_order,
  }));

  return sortPortfolioData(data, sortOrder, sortPerformancesByDate);
}

export function getWorkshopsData(workshops: any[], sortOrder: SortOrder) {
  const data = workshops.map(item => ({
    id: item.id,
    title: item.title || '',
    workshop_date: item.workshop_date || null,
    display_order: item.display_order,
  }));

  return sortPortfolioData(data, sortOrder, sortWorkshopsByDate);
}
