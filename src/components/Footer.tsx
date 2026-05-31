'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP  = process.env.NEXT_PUBLIC_WHATSAPP  || '5493875717430';
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/fibrarte.stores/';

const linkClass = "text-cream/45 hover:text-gold transition-colors text-sm cursor-pointer block py-0.5";
const titleClass = "text-gold/80 text-xs font-semibold uppercase tracking-widest mb-4";
const divider = { background: 'linear-gradient(to right, transparent, rgba(212,160,84,0.25), transparent)' };

function FooterNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const scrollTo = (id: string) => {
    if (isHome) {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/' + id;
    }
  };

  return (
    <>
      {/* Col 2 — Navegación */}
      <div>
        <p className={titleClass}>Navegación</p>
        <nav className="flex flex-col">
          <button onClick={() => scrollTo('#inicio')} className={linkClass + " text-left"}>Inicio</button>
          <button onClick={() => scrollTo('#productos')} className={linkClass + " text-left"}>Catálogo</button>
          <Link href="/trabajos" className={linkClass}>Nuestros Trabajos</Link>
          <button onClick={() => scrollTo('#nosotros')} className={linkClass + " text-left"}>Nosotros</button>
          <button onClick={() => scrollTo('#contacto')} className={linkClass + " text-left"}>Contacto</button>
        </nav>
      </div>

      {/* Col 3 — Productos */}
      <div>
        <p className={titleClass}>Productos</p>
        <nav className="flex flex-col">
          <button onClick={() => scrollTo('#productos')} className={linkClass + " text-left"}>Imanes</button>
          <button onClick={() => scrollTo('#productos')} className={linkClass + " text-left"}>Portacelulares</button>
          <button onClick={() => scrollTo('#productos')} className={linkClass + " text-left"}>Centros de Mesa</button>
        </nav>
      </div>
    </>
  );
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a0c05' }} className="border-t border-gold/10">

      {/* Columnas principales */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Col 1 — Marca */}
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo/logo.png" alt="Fibrarte" className="h-8 w-auto object-contain opacity-90" />
          <p className="text-cream/70 text-sm font-medium">Souvenirs personalizados en MDF</p>
          <p className="text-cream/35 text-xs leading-relaxed">
            Creamos piezas únicas para eventos, regalos y ocasiones especiales. Cada trabajo hecho con dedicación desde Salta, Argentina.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/50 transition-all"
            >
              <Instagram size={16} />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/50 transition-all"
            >
              <FaWhatsapp size={16} />
            </a>
          </div>
        </div>

        <FooterNav />

        {/* Col 4 — Contacto */}
        <div>
          <p className={titleClass}>Contacto</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <svg className="text-gold/50 mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="text-cream/45 text-sm">Salta Capital, Argentina</span>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 group"
            >
              <FaWhatsapp size={14} className="text-gold/50 mt-0.5 shrink-0 group-hover:text-gold transition-colors" />
              <span className="text-cream/45 text-sm group-hover:text-gold transition-colors">+54 9 387 571-7430</span>
            </a>
          </div>
        </div>

      </div>

      {/* Línea divisoria */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="h-px" style={divider} />
      </div>

      {/* Copyright */}
      <div className="py-4 text-center">
        <p className="text-cream/30 text-xs">
          © {new Date().getFullYear()} Fibrarte · Todos los derechos reservados
        </p>
      </div>

    </footer>
  );
}
