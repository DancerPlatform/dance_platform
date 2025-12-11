import { ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { chunkArray } from '@/lib/portfolioUtils';

interface VideoCarouselProps<T> {
  items: T[];
  itemsPerSlide?: number;
  renderItem: (item: T, index: number) => ReactNode;
  containerClassName?: string;
  gridClassName?: string;
}

export function VideoCarousel<T>({
  items,
  itemsPerSlide = 4,
  renderItem,
  containerClassName = 'space-y-4',
  gridClassName,
}: VideoCarouselProps<T>) {
  const chunks = chunkArray(items, itemsPerSlide);

  return (
    <Swiper
      modules={[Pagination]}
      spaceBetween={16}
      slidesPerView={1}
      pagination={{ clickable: true }}
      className="pb-12!"
    >
      {chunks.map((chunk, slideIndex) => (
        <SwiperSlide key={slideIndex}>
          <div className={gridClassName || containerClassName}>
            {chunk.map((item, index) => {
              const globalIndex = slideIndex * itemsPerSlide + index;
              return <div key={globalIndex}>{renderItem(item, globalIndex)}</div>;
            })}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
