import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [products] = await pool.execute<RowDataPacket[]>(
    'SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug FROM Product p JOIN Category c ON c.id = p.categoryId WHERE p.id = ?',
    [id]
  );
  if (!products[0]) notFound();

  const [images] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ProductImage WHERE productId = ? ORDER BY isPrimary DESC, `order` ASC',
    [id]
  );

  const p = products[0];
  const product = {
    id: p.id, name: p.name, description: p.description, price: String(p.price),
    measures: p.measures, whatsappMsg: p.whatsappMsg, active: Boolean(p.active),
    order: p.order, categoryId: p.categoryId,
    category: { id: p.cat_id, name: p.cat_name, slug: p.cat_slug },
    images: images.map(i => ({ id: i.id, url: i.url, alt: i.alt, isPrimary: Boolean(i.isPrimary), order: i.order })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm text-brown-medium hover:text-brown-dark transition-colors mb-4">
          <ArrowLeft size={16} /> Volver a Productos
        </Link>
        <h1 className="font-heading text-3xl font-bold text-brown-dark">Editar Producto</h1>
        <p className="text-brown-medium text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
