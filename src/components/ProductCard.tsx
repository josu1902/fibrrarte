'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Ruler, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number | { toString(): string };
  measures: string | null;
  whatsappMsg: string | null;
  categoryId: number;
  category: Category;
  images: ProductImage[];
}

function formatPrice(price: string | number | { toString(): string }): string {
  const num = parseFloat(price.toString());
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5493875717430';
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const waText = product.whatsappMsg || `Hola! Me interesa el producto: ${product.name}`;
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`;

  const truncate = (text: string, max = 60) =>
    text.length <= max ? text : text.slice(0, max).trim() + '…';

  return (
    <div className="bg-cream rounded-2xl overflow-hidden border border-beige hover:border-brown-light/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">

      {/* Imagen — clickeable → detalle */}
      <Link href={`/productos/${product.id}`} className="block overflow-hidden">
        <div className="relative h-52 bg-beige">
          {primaryImage && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center text-brown-light/40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs mt-2">Sin imagen</span>
            </div>
          )}

          {/* Badge categoría */}
          <span className="absolute top-3 left-3 z-10 bg-brown-dark/75 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
            {product.category.name}
          </span>

          {/* Badge "Ver más" hover */}
          <div className="absolute inset-0 z-10 bg-brown-dark/0 group-hover:bg-brown-dark/20 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-brown-dark text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-1">
              Ver detalle <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/productos/${product.id}`} className="hover:text-brown-medium transition-colors">
          <h3 className="font-heading text-lg font-semibold text-brown-dark mb-1 leading-tight">
            {product.name}
          </h3>
        </Link>

        <p className="text-xl font-bold text-brown-medium mb-2">
          {formatPrice(product.price)}
        </p>

        {product.measures && (
          <div className="flex items-center gap-1.5 text-xs text-earth mb-3">
            <Ruler size={12} />
            <span>{product.measures}</span>
          </div>
        )}

        <p className="text-sm text-brown-medium/70 leading-relaxed flex-1 mb-4">
          {truncate(product.description)}
        </p>

        {/* Botones */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: '#25D366' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1ebe5d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
        >
          <FaWhatsapp size={20} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
