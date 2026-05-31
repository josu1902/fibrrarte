import { Instagram } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP  = process.env.NEXT_PUBLIC_WHATSAPP  || '5493875717430';
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/fibrarte.stores/';

export default function ContactSection() {
  return (
    <section id="contacto" style={{ backgroundColor: '#1a0c05' }} className="py-10 border-t border-gold/10">
      <div className="max-w-2xl mx-auto px-6 text-center">


        {/* Sobre nosotros */}
        <div id="nosotros" className="mb-7 px-2">
          <p className="text-gold/50 text-xs uppercase tracking-widest font-medium mb-2">Sobre nosotros</p>
          <p className="text-cream/55 text-sm leading-relaxed max-w-lg mx-auto">
            Fibrarte es un emprendimiento especializado en souvenirs personalizados, productos en MDF y grabado láser.
            Diseñamos piezas originales y funcionales para eventos, regalos y ocasiones especiales.
          </p>
        </div>

        <div className="h-px mb-7" style={{ background: 'linear-gradient(to right, transparent, rgba(212,160,84,0.4), transparent)' }} />

        <h2 className="font-heading text-2xl font-bold text-cream mb-1">¿Tenés una idea?</h2>
        <p className="text-cream/50 text-sm mb-6">La hacemos realidad. Consultanos sin compromiso.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_16px_rgba(212,160,84,0.35)] text-dark-bg"
            style={{ background: 'linear-gradient(135deg, #D4A054, #C8906A)' }}
          >
            <FaWhatsapp size={16} />
            Consultar por WhatsApp
          </a>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gold/40 bg-white/5 hover:bg-gold/10 hover:border-gold/60 text-gold font-semibold text-sm transition-all duration-300"
          >
            <Instagram size={14} />
            Seguinos en Instagram
          </a>
        </div>

      </div>
    </section>
  );
}
