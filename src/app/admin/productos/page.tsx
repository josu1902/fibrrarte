import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Pencil } from 'lucide-react';
import DeleteProductButton from './DeleteProductButton';

function formatPrice(price: { toString: () => string }) {
  const num = parseFloat(price.toString());
  const hasCents = num % 1 !== 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
}

async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
  });
}

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brown-dark mb-1">Productos</h1>
          <p className="text-brown-medium text-sm">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-cream px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Agregar Producto
        </Link>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-brown-light" />
          </div>
          <p className="font-heading text-lg font-semibold text-brown-dark mb-2">
            No hay productos aún
          </p>
          <p className="text-brown-medium text-sm mb-6">
            Comenzá agregando tu primer producto al catálogo
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-cream px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Agregar Producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-beige overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-beige/50 border-b border-beige">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-brown-medium uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-beige/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-brown-dark text-sm">{product.name}</p>
                      {product.measures && (
                        <p className="text-xs text-brown-medium/60 mt-0.5">{product.measures}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-beige text-brown-medium text-xs font-medium px-2.5 py-1 rounded-full">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-brown-dark">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                          product.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            product.active ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="flex items-center gap-1.5 text-xs font-medium text-earth hover:text-brown-dark bg-beige hover:bg-beige/80 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil size={12} />
                          Editar
                        </Link>
                        <DeleteProductButton id={product.id} name={product.name} />
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
