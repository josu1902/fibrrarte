'use client';

import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './ProductCard';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
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

interface ProductsSectionProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ProductsSection({ initialProducts, initialCategories }: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Cerrar lightbox con Escape
  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxUrl(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxUrl]);

  const filteredProducts =
    selectedCategory === 'all'
      ? initialProducts
      : initialProducts.filter((p) => p.category.slug === selectedCategory);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()));
      case 'price-desc':
        return arr.sort((a, b) => parseFloat(b.price.toString()) - parseFloat(a.price.toString()));
      case 'name-asc':
        return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  return (
    <section id="productos" className="bg-beige pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Título */}
        <div className="text-center mb-8">
          <p className="text-earth font-medium uppercase tracking-widest text-sm mb-3">
            Catálogo
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-brown-dark mb-6">
            Nuestros Productos
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-brown-light" />
            <div className="w-1.5 h-1.5 rounded-full bg-brown-light" />
            <div className="h-px w-12 bg-brown-light" />
          </div>
          <p className="text-brown-medium max-w-2xl mx-auto leading-relaxed">
            Todos nuestros productos pueden ser personalizados. Consultanos por WhatsApp para
            diseños a medida.
          </p>
        </div>

        {/* Filtros: categoría + orden */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">

          {/* Chips de categoría */}
          {initialCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-brown-dark text-cream border-brown-dark shadow-sm'
                    : 'bg-transparent text-brown-medium border-brown-light/40 hover:border-brown-light hover:text-brown-dark'
                }`}
              >
                Todos
              </button>
              {initialCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    selectedCategory === cat.slug
                      ? 'bg-brown-dark text-cream border-brown-dark shadow-sm'
                      : 'bg-transparent text-brown-medium border-brown-light/40 hover:border-brown-light hover:text-brown-dark'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Selector de orden */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={14} className="text-brown-medium/60" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm text-brown-dark bg-transparent border border-brown-light/40 rounded-xl px-3 py-2 focus:outline-none focus:border-brown-medium cursor-pointer hover:border-brown-light transition-colors"
            >
              <option value="default">Destacados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A – Z</option>
            </select>
          </div>
        </div>

        {/* Grid de productos */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brown-medium font-medium mb-2">No hay productos en esta categoría</p>
            <p className="text-brown-medium/60 text-sm">Pronto agregaremos más productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={setLightboxUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxUrl}
            alt="Producto"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
