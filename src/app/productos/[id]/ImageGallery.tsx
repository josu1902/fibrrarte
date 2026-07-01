'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface Img {
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export default function ImageGallery({ images }: { images: Img[] }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-beige flex items-center justify-center">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
          stroke="#C8906A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Imagen principal — clic abre lightbox */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square rounded-2xl overflow-hidden bg-beige shadow-md group w-full focus:outline-none"
          aria-label="Ver foto en pantalla completa"
        >
          <Image
            src={images[active].url}
            alt={images[active].alt || 'Producto'}
            fill
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Ícono zoom en hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
              <ZoomIn size={22} className="text-brown-dark" />
            </div>
          </div>

          {/* Flechas si hay más de 1 imagen */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all hover:scale-110 z-10"
                aria-label="Anterior"
              >
                <ChevronLeft size={20} className="text-brown-dark" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all hover:scale-110 z-10"
                aria-label="Siguiente"
              >
                <ChevronRight size={20} className="text-brown-dark" />
              </button>
            </>
          )}

          {/* Contador */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-brown-dark/70 text-white text-xs px-2.5 py-1 rounded-full font-medium z-10">
              {active + 1} / {images.length}
            </div>
          )}
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === active
                    ? 'border-brown-medium shadow-md scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Foto ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors z-10"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>

          {/* Imagen */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active].url}
            alt={images[active].alt || 'Producto'}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Flechas en lightbox */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight size={24} className="text-white" />
              </button>

              {/* Contador en lightbox */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/15 text-white text-sm px-4 py-1.5 rounded-full">
                {active + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
