"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination, EffectCoverflow } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-coverflow"

import { Card, CardContent } from "@/components/ui/card"

export interface BannerItem {
  id: string | number
  image: string
  title?: string
  description?: string
  link?: string
}

export interface SlidingBannerProps {
  items: BannerItem[]
  autoplay?: boolean
  autoplayDelay?: number
  showControls?: boolean
  showPagination?: boolean
  className?: string
  aspectRatio?: "square" | "video" | "wide" | "banner"
  effect?: "slide" | "fade" | "coverflow"
  spaceBetween?: number
  slidesPerView?: number | "auto"
  centeredSlides?: boolean
  loop?: boolean
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  banner: "aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]",
}

export function SlidingBanner({
  items,
  autoplay = true,
  autoplayDelay = 3000,
  showControls = true,
  showPagination = true,
  className = "",
  aspectRatio = "banner",
  effect = "slide",
  loop = true,
}: SlidingBannerProps) {
  const modules = [
    ...(autoplay ? [Autoplay] : []),
    ...(showControls ? [Navigation] : []),
    ...(showPagination ? [Pagination] : []),
    ...(effect === "coverflow" ? [EffectCoverflow] : []),
  ]

  const swiperOptions = {
    modules,
    spaceBetween: 0,
    slidesPerView: 1,
    centeredSlides: false,
    loop: loop && items.length > 1,
    speed: 600,
    autoplay: autoplay
      ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }
      : false,
    navigation: showControls,
    pagination: showPagination
      ? {
          clickable: true,
          dynamicBullets: items.length > 5,
        }
      : false,
    effect: effect as any,
    ...(effect === "coverflow" && {
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
    }),
  }

  return (
    <div className={`w-full relative ${className}`}>
      <Swiper {...swiperOptions} className="pb-8 md:pb-12!">
        {items.map((item) => (
          <SwiperSlide key={item.id} className="w-full!">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0 relative overflow-hidden rounded-lg md:rounded-xl">
                {item.link ? (
                  <a
                    href={item.link}
                    className={`block w-full ${aspectRatioClasses[aspectRatio]}`}
                  >
                    <img
                      src={item.image}
                      alt={item.title || `Banner ${item.id}`}
                      className="w-full h-full object-cover"
                    />
                    {(item.title || item.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 md:p-6">
                        {item.title && (
                          <h3 className="text-white text-lg md:text-2xl font-bold mb-1 md:mb-2">
                            {item.title}
                          </h3>
                        )}
                        {item.description && (
                          <p className="text-white/90 text-xs md:text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </a>
                ) : (
                  <div className={`w-full ${aspectRatioClasses[aspectRatio]}`}>
                    <img
                      src={item.image}
                      alt={item.title || `Banner ${item.id}`}
                      className="w-full h-full object-cover"
                    />
                    {(item.title || item.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 md:p-6">
                        {item.title && (
                          <h3 className="text-white text-lg md:text-2xl font-bold mb-1 md:mb-2">
                            {item.title}
                          </h3>
                        )}
                        {item.description && (
                          <p className="text-white/90 text-xs md:text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 40px;
            height: 40px;
          }
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: scale(1.1);
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 14px;
        }
        @media (min-width: 768px) {
          .swiper-button-next::after,
          .swiper-button-prev::after {
            font-size: 16px;
          }
        }
        .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 6px;
          height: 6px;
        }
        @media (min-width: 768px) {
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: white;
        }
      `}</style>
    </div>
  )
}
