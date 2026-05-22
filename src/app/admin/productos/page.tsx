import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Plus, Pencil } from 'lucide-react';
import DeleteProductButton from './DeleteProductButton';

function formatPrice(price: string | number) {
  const num = parseFloat(String(price));
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: num % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 }).format(num);
}

export default async function ProductosPage() {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT p.id, p.name, p.price, p.measures, p.active, p.\`order\`,
           c.name as catName,
           (SELECT url FROM ProductImage WHERE productId = p.id AND isPrimary = 1 LIMIT 1) as primaryImage
    FROM Product p JOIN Category c ON c.id = p.categoryId
    ORDER BY c.\`order\` ASC, p.\`order\` ASC
  `);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brown-dark mb-1">Productos</h1>
          <p className="text-brown-medium text-sm">{rows.length} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className="flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-cream px-5 py-2.5 rounded-xl font-medium text-sm transition-colors">
          <Plus size={16} /> Agregar Producto
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige p-16 text-center">
          <p className="font-heading text-lg font-semibold text-brown-dark mb-2">No hay productos aún</p>
          <Link href="/admin/productos/nuevo" className="inline-flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-cream px-6 py-3 rounded-xl font-medium text-sm transition-colors mt-4">
            <Plus size={16} /> Agregar Producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-beige overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-beige/50 border-b border-beige">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">Producto</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">Precio</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-beige/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-brown-dark text-sm">{p.name}</p>
                      {p.measures && <p className="text-xs text-brown-medium/60 mt-0.5">{p.measures}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-beige text-brown-medium text-xs font-medium px-2.5 py-1 rounded-full">{p.catName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-brown-dark">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${p.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/productos/${p.id}/editar`} className="flex items-center gap-1.5 text-xs font-medium text-earth hover:text-brown-dark bg-beige hover:bg-beige/80 px-3 py-1.5 rounded-lg transition-colors">
                          <Pencil size={12} /> Editar
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
