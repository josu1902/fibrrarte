import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Package, Layers, Plus, ArrowRight } from 'lucide-react';

async function getDashboardData() {
  const [productCount, categoryCount, productsByCategory, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { order: 'asc' },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  ]);

  return { productCount, categoryCount, productsByCategory, recentProducts };
}

export default async function DashboardPage() {
  const { productCount, categoryCount, productsByCategory, recentProducts } =
    await getDashboardData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-brown-dark mb-1">Dashboard</h1>
        <p className="text-brown-medium text-sm">Panel de administración de Fibrarte</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        <div className="bg-white rounded-2xl border border-beige p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-brown-dark/10 flex items-center justify-center">
            <Package size={22} className="text-brown-dark" />
          </div>
          <div>
            <p className="text-3xl font-bold text-brown-dark">{productCount}</p>
            <p className="text-sm text-brown-medium">Productos totales</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-beige p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-earth/10 flex items-center justify-center">
            <Layers size={22} className="text-earth" />
          </div>
          <div>
            <p className="text-3xl font-bold text-brown-dark">{categoryCount}</p>
            <p className="text-sm text-brown-medium">Categorías</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by category */}
        <div className="bg-white rounded-2xl border border-beige p-6">
          <h2 className="font-heading text-lg font-semibold text-brown-dark mb-5">
            Productos por Categoría
          </h2>
          <div className="space-y-3">
            {productsByCategory.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-2 border-b border-beige last:border-0">
                <span className="text-sm text-brown-medium font-medium">{cat.name}</span>
                <span className="text-sm font-bold text-brown-dark bg-beige px-3 py-1 rounded-full">
                  {cat._count.products}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + Recent products */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-beige p-6">
            <h2 className="font-heading text-lg font-semibold text-brown-dark mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/productos/nuevo"
                className="flex items-center justify-between p-3 rounded-xl bg-brown-dark hover:bg-brown-medium text-cream transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Plus size={18} />
                  <span className="text-sm font-medium">Agregar Producto</span>
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/productos"
                className="flex items-center justify-between p-3 rounded-xl bg-beige hover:bg-brown-light/20 text-brown-dark transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-brown-medium" />
                  <span className="text-sm font-medium text-brown-medium">Ver todos los productos</span>
                </div>
                <ArrowRight size={16} className="text-brown-medium group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent products */}
          {recentProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-beige p-6">
              <h2 className="font-heading text-lg font-semibold text-brown-dark mb-4">
                Productos Recientes
              </h2>
              <div className="space-y-2">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-beige last:border-0">
                    <div>
                      <p className="text-sm font-medium text-brown-dark">{product.name}</p>
                      <p className="text-xs text-brown-medium/60">{product.category.name}</p>
                    </div>
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="text-xs text-earth hover:text-brown-medium transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
