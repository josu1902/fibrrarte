'use client';

import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="inicio"
      className="relative flex flex-col items-center justify-center overflow-hidden bg-dark-bg"
      style={{ minHeight: '88vh' }}
    >
      {/* Glow cálido centrado */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(212,160,84,0.12) 0%, rgba(200,144,106,0.06) 45%, transparent 72%)',
        }}
      />
      {/* Textura sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.6) 40px, rgba(255,255,255,0.6) 41px)',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center pt-20 pb-10">

        {/* Nombre */}
        <h1
          className="font-heading font-bold text-cream leading-none mb-5"
          style={{ fontSize: 'clamp(3.2rem, 9vw, 6rem)', letterSpacing: '-0.02em' }}
        >
          FIBRARTE
        </h1>

        {/* Separador — solo líneas, sin punto */}
        <div className="flex items-center gap-3 mb-7 w-full max-w-[200px]">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Tagline */}
        <p
          className="text-cream/95 text-lg sm:text-xl font-light leading-snug mb-3 max-w-lg"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Souvenirs y piezas en MDF con grabado láser, hechos a pedido.
        </p>

        {/* Descripción — mejor contraste */}
        <p className="text-cream/70 text-sm sm:text-base leading-relaxed mb-9 max-w-md">
          Creamos recuerdos únicos para cumpleaños, eventos y ocasiones especiales.
        </p>

        {/* CTA único */}
        <button
          onClick={() => scrollTo('#productos')}
          className="group relative inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-semibold text-dark-bg text-sm transition-all duration-300 overflow-hidden hover:shadow-[0_0_20px_rgba(212,160,84,0.35)]"
          style={{ background: 'linear-gradient(135deg, #D4A054, #C8906A)' }}
        >
          <span className="relative z-10">Ver Catálogo</span>
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #E8C080, #D4A054)' }}
          />
        </button>

      </div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollTo('#productos')}
        aria-label="Ver productos"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-cream/25 hover:text-cream/50 transition-colors animate-bounce"
      >
        <ChevronDown size={18} />
      </button>
    </section>
  );
}
