import { prisma } from '@/lib/prisma';
import { Tag } from 'lucide-react';
import CategoryManager from './CategoryManager';

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center">
          <Tag size={18} className="text-earth" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-brown-dark">Categorías</h1>
          <p className="text-brown-medium text-sm mt-0.5">{categories.length} categoría(s) en total</p>
        </div>
      </div>

      <CategoryManager initial={categories} />
    </div>
  );
}
