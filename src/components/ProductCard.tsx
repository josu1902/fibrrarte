'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Ruler, ZoomIn } from 'lucide-react';
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

export default function ProductCard({
  product,
  onImageClick,
}: {
  product: Product;
  onImageClick?: (url: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5493875717430';
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const waText = product.whatsappMsg || `Hola! Me interesa el producto: ${product.name}`;
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`;

  const truncate = (text: string, max = 60) =>
    text.length <= max ? text : text.slice(0, max).trim() + '…';

  const imageContent = (
    <div className="relative aspect-square bg-beige overflow-hidden">
      {primaryImage && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={primaryImage.url}
          alt={primaryImage.alt || product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center text-brown-light/40">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs mt-2">Sin imagen</span>
        </div>
      )}

      {/* Badge categoría */}
      <span className="absolute top-2 left-2 z-10 bg-brown-dark/75 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full leading-tight">
        {product.category.name}
      </span>

      {/* Hover overlay */}
      <div className="absolute inset-0 z-10 bg-brown-dark/0 group-hover:bg-brown-dark/25 transition-all duration-300 flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-brown-dark text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <ZoomIn size={13} /> Ver foto
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-cream rounded-2xl overflow-hidden border border-beige hover:border-brown-light/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 flex flex-col group">

      {/* Imagen: lightbox si hay callback, detalle si no */}
      {onImageClick && primaryImage && !imgError ? (
        <button
          type="button"
          onClick={() => onImageClick(primaryImage.url)}
          className="block w-full text-left focus:outline-none"
        >
          {imageContent}
        </button>
      ) : (
        <Link href={`/productos/${product.id}`} className="block">
          {imageContent}
        </Link>
      )}

      {/* Contenido */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <Link href={`/productos/${product.id}`} className="hover:text-brown-medium transition-colors">
          <h3 className="font-heading text-sm sm:text-lg font-semibold text-brown-dark mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-base sm:text-xl font-bold text-brown-medium mb-1 sm:mb-2">
          {formatPrice(product.price)}
        </p>

        {product.measures && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-earth mb-3">
            <Ruler size={12} />
            <span>{product.measures}</span>
          </div>
        )}

        <p className="hidden sm:block text-sm text-brown-medium/70 leading-relaxed flex-1 mb-4">
          {truncate(product.description)}
        </p>

        {/* Botón WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 sm:gap-2 w-full text-white text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors mt-auto"
          style={{ backgroundColor: '#25D366' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1ebe5d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
        >
          <FaWhatsapp size={16} />
          <span className="hidden sm:inline">Consultar por WhatsApp</span>
          <span className="sm:hidden">Consultar</span>
        </a>
      </div>
    </div>
  );
}
