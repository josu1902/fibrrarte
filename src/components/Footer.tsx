'use client';

import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP  = process.env.NEXT_PUBLIC_WHATSAPP  || '5493875717430';
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/fibrarte.stores/';

const scrollTo = (id: string) =>
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a0c05' }} className="border-t border-gold/10">

      {/* Fila principal */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center sm:items-start gap-1.5">
          <Image
            src="/img/logo/logo.png"
            alt="Fibrarte"
            width={120}
            height={30}
            className="object-contain h-7 w-auto opacity-80"
          />
          <p className="text-cream/35 text-xs">Souvenirs personalizados en MDF</p>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-1 text-xs text-cream/40">
          {[
            { label: 'Inicio',    id: '#inicio' },
            { label: 'Catálogo', id: '#productos' },
            { label: 'Nosotros', id: '#nosotros' },
            { label: 'Contacto', id: '#contacto' },
          ].map((link, i, arr) => (
            <span key={link.id} className="flex items-center gap-1">
              <button
                onClick={() => scrollTo(link.id)}
                className="hover:text-cream/80 transition-colors"
              >
                {link.label}
              </button>
              {i < arr.length - 1 && <span className="text-cream/20">·</span>}
            </span>
          ))}
        </nav>

        {/* Redes */}
        <div className="flex items-center gap-4">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cream/40 hover:text-cream/80 text-xs transition-colors"
          >
            <Instagram size={13} />
            Instagram
          </a>
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cream/40 hover:text-cream/80 text-xs transition-colors"
          >
            <FaWhatsapp size={13} />
            WhatsApp
          </a>
        </div>

      </div>

      {/* Línea secundaria */}
      <div className="border-t border-gold/[0.07] py-3 text-center">
        <p className="text-cream/20 text-xs">
          © {new Date().getFullYear()} Fibrarte · Todos los derechos reservados
        </p>
      </div>

    </footer>
  );
}
