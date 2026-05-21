'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Img {
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export default function ImageGallery({ images }: { images: Img[] }) {
  const [active, setActive] = useState(0);

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

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen principal */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-beige shadow-md">
        <Image
          src={images[active].url}
          alt={images[active].alt || 'Producto'}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Flechas si hay más de 1 imagen */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all hover:scale-110"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="text-brown-dark" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all hover:scale-110"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} className="text-brown-dark" />
            </button>
          </>
        )}

        {/* Contador */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-brown-dark/70 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

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
  );
}
