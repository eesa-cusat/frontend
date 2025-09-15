'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  // Custom lazy loading options
  rootMargin?: string;
  threshold?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/placeholder-image.jpg',
  onLoad,
  onError,
  style,
  loading = 'lazy',
  rootMargin = '50px',
  threshold = 0.1,
  objectFit = 'cover'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager' || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority, loading, rootMargin, threshold, isInView]);

  const handleLoad = useCallback(() => {
    setImageLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    console.error(`Failed to load image: ${imageSrc}`);
    setImageError(true);
    setImageLoading(false);
    setImageSrc(fallbackSrc);
    onError?.();
  }, [imageSrc, fallbackSrc, onError]);

  // Default blur data URL for placeholder
  const defaultBlurDataURL = blurDataURL || 
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  // Loading placeholder component
  const LoadingPlaceholder = () => (
    <div 
      className={cn(
        "bg-gray-200 animate-pulse flex items-center justify-center",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={{
        width: !fill ? width : undefined,
        height: !fill ? height : undefined,
        ...style
      }}
    >
      <div className="flex flex-col items-center justify-center text-gray-400">
        <svg
          className="w-8 h-8 mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs">Loading...</span>
      </div>
    </div>
  );

  // Error placeholder component
  const ErrorPlaceholder = () => (
    <div 
      className={cn(
        "bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={{
        width: !fill ? width : undefined,
        height: !fill ? height : undefined,
        ...style
      }}
    >
      <div className="flex flex-col items-center justify-center text-gray-500">
        <svg
          className="w-8 h-8 mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs">Image not available</span>
      </div>
    </div>
  );

  return (
    <div 
      ref={imgRef} 
      className={cn("relative overflow-hidden", !fill && "inline-block")}
      style={!fill ? { width, height } : undefined}
    >
      {!isInView ? (
        <LoadingPlaceholder />
      ) : imageError && imageSrc === fallbackSrc ? (
        <ErrorPlaceholder />
      ) : (
        <>
          {imageLoading && <LoadingPlaceholder />}
          <Image
            src={imageSrc}
            alt={alt}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            fill={fill}
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={defaultBlurDataURL}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              imageLoading ? "opacity-0" : "opacity-100",
              className
            )}
            style={{
              objectFit,
              ...style
            }}
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;
