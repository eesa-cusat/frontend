"use client";

import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface AutoScrollCarouselProps {
  children: React.ReactNode[];
  slidesPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  spaceBetween?: number;
  autoplayDelay?: number;
  showPagination?: boolean;
  loop?: boolean;
  className?: string;
}

const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({
  children,
  slidesPerView = {
    mobile: 1.2,
    tablet: 2.2,
    desktop: 3,
    large: 3.5,
  },
  spaceBetween = 20,
  autoplayDelay = 3000,
  showPagination = true,
  loop = true,
  className = "",
}) => {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      slidesPerView={slidesPerView.mobile}
      spaceBetween={spaceBetween}
      loop={loop}
      autoplay={{ 
        delay: autoplayDelay, 
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={showPagination ? { clickable: true } : false}
      breakpoints={{
        640: { slidesPerView: slidesPerView.tablet },
        768: { slidesPerView: slidesPerView.tablet },
        1024: { slidesPerView: slidesPerView.desktop },
        1280: { slidesPerView: slidesPerView.large },
      }}
      className={`py-4 ${showPagination ? 'pb-12' : ''} ${className}`}
    >
      {children.map((child, index) => (
        <SwiperSlide key={index} className="flex justify-center">
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default AutoScrollCarousel;
