'use client';

import { useState, useEffect } from 'react';
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
  price: string | number;
  measures: string | null;
  whatsappMsg: string | null;
  categoryId: number;
  category: Category;
  images: ProductImage[];
}

function ProductSkeleton() {
  return (
    <div className="bg-cream rounded-2xl overflow-hidden border border-beige animate-pulse">
      <div className="h-56 bg-beige" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-beige rounded w-3/4" />
        <div className="h-7 bg-beige rounded w-1/3" />
        <div className="h-4 bg-beige rounded w-full" />
        <div className="h-4 bg-beige rounded w-4/5" />
        <div className="h-10 bg-beige rounded-xl mt-4" />
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        if (!productsRes.ok) throw new Error('Error loading products');
        if (!categoriesRes.ok) throw new Error('Error loading categories');

        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category.slug === selectedCategory);

  return (
    <section id="productos" className="bg-beige pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Category Filters */}
        {!loading && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
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
            {categories.map((cat) => (
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

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <p className="text-brown-medium/70">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-brown-light"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p className="text-brown-medium font-medium mb-2">No hay productos en esta categoría</p>
                <p className="text-brown-medium/60 text-sm">Pronto agregaremos más productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
