'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { galleryItems } from '@/data/gallery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TrabajosPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-beige pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-earth font-medium uppercase tracking-widest text-sm mb-3">
              Portfolio
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brown-dark mb-6">
              Nuestros Trabajos
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-brown-light" />
              <div className="w-1.5 h-1.5 rounded-full bg-brown-light" />
              <div className="h-px w-12 bg-brown-light" />
            </div>
            <p className="text-brown-medium max-w-xl mx-auto text-sm leading-relaxed">
              Algunos de los productos personalizados que realizamos. Cada trabajo es único y hecho con dedicación.
            </p>
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-20 text-brown-medium/60">
              <p>Próximamente publicaremos fotos de nuestros trabajos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {galleryItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(item.url)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-beige hover:border-brown-light shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-brown-dark/0 group-hover:bg-brown-dark/30 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cream text-xs font-medium bg-brown-dark/70 px-3 py-1.5 rounded-full">
                      Ver
                    </span>
                  </div>
                  {item.category && (
                    <span className="absolute top-2 left-2 bg-brown-dark/70 text-cream text-xs px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl max-h-[90vh] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected}
              alt="Trabajo realizado"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
