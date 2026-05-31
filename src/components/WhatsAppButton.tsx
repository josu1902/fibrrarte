'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5493875717430';
const MESSAGE = encodeURIComponent('Hola! Me gustaría hacer una consulta sobre sus productos 😊');

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-xl transition-all duration-500 hover:scale-110 active:scale-95 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
      style={{ backgroundColor: '#25D366', width: '52px', height: '52px' }}
    >
      <FaWhatsapp size={26} color="white" />
    </a>
  );
}
