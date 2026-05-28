'use client';

import { useState, useEffect } from 'react';
import { Instagram, Menu, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP  = process.env.NEXT_PUBLIC_WHATSAPP  || '5493875717430';
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/fibrarte.stores/';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 bg-dark-bg/90 backdrop-blur-md border-b border-gold/10 ${
      scrolled ? 'shadow-[0_2px_24px_rgba(0,0,0,0.4)]' : ''
    }`}>
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <button onClick={() => scrollTo('#inicio')} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo/logo.png"
              alt="Fibrarte"
              className="object-contain h-8 w-auto"
            />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollTo('#inicio')}
              className="px-4 py-2 text-sm font-medium text-cream/70 hover:text-cream transition-colors rounded-lg hover:bg-white/5"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollTo('#productos')}
              className="px-4 py-2 text-sm font-medium text-cream/70 hover:text-cream transition-colors rounded-lg hover:bg-white/5"
            >
              Catálogo
            </button>
            <button
              onClick={() => scrollTo('#nosotros')}
              className="px-4 py-2 text-sm font-medium text-cream/70 hover:text-cream transition-colors rounded-lg hover:bg-white/5"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollTo('#contacto')}
              className="px-4 py-2 text-sm font-medium text-cream/70 hover:text-cream transition-colors rounded-lg hover:bg-white/5"
            >
              Contacto
            </button>

            <div className="w-px h-5 bg-white/10 mx-2" />

            {/* Instagram */}
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cream/70 hover:text-cream transition-colors rounded-lg hover:bg-white/5"
            >
              <Instagram size={15} />
              Instagram
            </a>

            {/* WhatsApp — botón destacado */}
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 ml-2 px-5 py-2 bg-gold/90 hover:bg-gold text-dark-bg text-sm font-semibold rounded-full transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,160,84,0.4)]"
            >
              <FaWhatsapp size={16} />
              WhatsApp
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-cream/70 hover:text-cream transition-colors"
            aria-label="Menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-bg/98 border-t border-gold/10 backdrop-blur-md">
          <div className="px-5 py-5 flex flex-col gap-1">
            <button
              onClick={() => scrollTo('#inicio')}
              className="w-full text-left px-4 py-3 text-sm font-medium text-cream/80 hover:text-cream hover:bg-white/5 rounded-xl transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollTo('#productos')}
              className="w-full text-left px-4 py-3 text-sm font-medium text-cream/80 hover:text-cream hover:bg-white/5 rounded-xl transition-colors"
            >
              Catálogo
            </button>
            <button
              onClick={() => scrollTo('#nosotros')}
              className="w-full text-left px-4 py-3 text-sm font-medium text-cream/80 hover:text-cream hover:bg-white/5 rounded-xl transition-colors"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollTo('#contacto')}
              className="w-full text-left px-4 py-3 text-sm font-medium text-cream/80 hover:text-cream hover:bg-white/5 rounded-xl transition-colors"
            >
              Contacto
            </button>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-cream/80 hover:text-cream hover:bg-white/5 rounded-xl transition-colors"
            >
              <Instagram size={16} />
              Instagram
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 mt-2 px-4 py-3 bg-gold/90 text-dark-bg text-sm font-semibold rounded-xl transition-colors"
            >
              <FaWhatsapp size={18} />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
