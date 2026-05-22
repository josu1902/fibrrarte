import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Tag } from 'lucide-react';
import CategoryManager from './CategoryManager';

export default async function CategoriasPage() {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT c.id, c.name, c.slug, c.\`order\`, c.createdAt, COUNT(p.id) as productCount
    FROM Category c LEFT JOIN Product p ON p.categoryId = c.id
    GROUP BY c.id ORDER BY c.\`order\` ASC
  `);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = rows.map((r: any) => ({ id: r.id, name: r.name, slug: r.slug, order: r.order, createdAt: r.createdAt, _count: { products: Number(r.productCount) } }));

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
