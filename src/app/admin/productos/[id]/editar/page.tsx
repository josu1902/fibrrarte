import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

interface PageProps {
  params: { id: string };
}

export default async function EditarProductoPage({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  if (!product) notFound();

  const serializedProduct = { ...product, price: product.price.toString() };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-brown-medium hover:text-brown-dark transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver a Productos
        </Link>
        <h1 className="font-heading text-3xl font-bold text-brown-dark">Editar Producto</h1>
        <p className="text-brown-medium text-sm mt-1">{product.name}</p>
      </div>

      <ProductForm mode="edit" product={serializedProduct} initialCategories={categories} />
    </div>
  );
}
