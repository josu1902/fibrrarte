import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Ruler, Tag } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ImageGallery from './ImageGallery';

interface PageProps {
  params: { id: string };
}

function formatPrice(price: { toString(): string }) {
  const num = parseFloat(price.toString());
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

async function getProduct(id: number) {
  return prisma.product.findUnique({
    where: { id, active: true },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
    },
  });
}

export default async function ProductoPage({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const product = await getProduct(id);
  if (!product) notFound();

  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5493875717430';
  const msg = product.whatsappMsg || `Hola! Me interesa el producto: ${product.name}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  return (
    <main className="min-h-screen bg-cream">
      {/* Barra superior */}
      <div className="bg-beige border-b border-brown-light/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/#productos"
            className="inline-flex items-center gap-2 text-sm font-medium text-brown-medium hover:text-brown-dark transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Galería ── */}
          <div>
            <ImageGallery images={product.images} />
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">
            {/* Categoría */}
            <div className="flex items-center gap-2 mb-4">
              <Tag size={14} className="text-earth" />
              <span className="text-sm font-semibold tracking-widest uppercase text-earth">
                {product.category.name}
              </span>
            </div>

            {/* Nombre */}
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brown-dark mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-brown-medium">
                {formatPrice(product.price)}
              </span>
              <span className="text-brown-medium/60 text-sm ml-2">por unidad</span>
            </div>

            {/* Separador */}
            <div className="h-px bg-beige mb-6" />

            {/* Descripción */}
            <div className="mb-6">
              <h2 className="text-xs font-bold tracking-widest uppercase text-brown-light mb-2">
                Descripción
              </h2>
              <p className="text-brown-medium leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Medidas */}
            {product.measures && (
              <div className="flex items-center gap-2 bg-beige rounded-xl px-4 py-3 mb-6 w-fit">
                <Ruler size={15} className="text-earth flex-shrink-0" />
                <span className="text-sm font-medium text-brown-dark">{product.measures}</span>
              </div>
            )}

            {/* Nota personalización */}
            <div className="bg-brown-light/10 border border-brown-light/30 rounded-xl px-5 py-4 mb-8">
              <p className="text-sm text-brown-medium leading-relaxed">
                <strong className="text-brown-dark">¿Querés personalizarlo?</strong>{' '}
                Todos nuestros productos se adaptan a tus gustos. Consultanos por WhatsApp
                y te asesoramos sin cargo.
              </p>
            </div>

            {/* CTA WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full"
            >
              <MessageCircle size={22} />
              Consultar por WhatsApp
            </a>

            <p className="text-center text-xs text-brown-medium/50 mt-3">
              Respondemos de lunes a sábados
            </p>
          </div>
        </div>

        {/* Más info abajo */}
        <div className="mt-16 pt-10 border-t border-beige text-center">
          <p className="text-brown-medium/60 text-sm mb-4">¿Querés ver más productos?</p>
          <Link
            href="/#productos"
            className="inline-flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-white font-medium px-7 py-3 rounded-full transition-all duration-300 text-sm"
          >
            <ArrowLeft size={15} />
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
