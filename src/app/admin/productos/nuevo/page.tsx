import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

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
        <h1 className="font-heading text-3xl font-bold text-brown-dark">Agregar Producto</h1>
      </div>

      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
