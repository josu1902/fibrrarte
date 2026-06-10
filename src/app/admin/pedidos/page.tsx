import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import IngresosFiltro from './IngresosFiltro';
import PedidosClient, { type SerializedOrder } from './PedidosClient';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

function getDateRange(periodo: string): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  switch (periodo) {
    case 'hoy': {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'semana': {
      const from = new Date(now);
      from.setDate(now.getDate() - now.getDay());
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'anio': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from, to };
    }
    case 'todo': {
      return { from: new Date(2000, 0, 1), to };
    }
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
  }
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { periodo?: string; buscar?: string; estado?: string; saldo?: string };
}) {
  const periodo = searchParams.periodo || 'mes';
  const { from, to } = getDateRange(periodo);

  const [allOrders, filteredOrders] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to }, status: { not: 'CANCELLED' } },
      include: { items: true },
    }),
  ]);

  const ingresos     = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const seniasTotal  = filteredOrders.reduce((s, o) => s + Number(o.deposit), 0);
  const saldoPend    = filteredOrders.reduce((s, o) => s + Number(o.balance), 0);
  const pendientes   = allOrders.filter(o => o.status === 'PENDING').length;
  const enProduccion = allOrders.filter(o => o.status === 'IN_PRODUCTION').length;

  const serialized: SerializedOrder[] = allOrders.map(o => ({
    id: o.id,
    clientName: o.clientName,
    clientPhone: o.clientPhone,
    status: o.status,
    total: Number(o.total),
    deposit: Number(o.deposit),
    balance: Number(o.balance),
    deliveryDate: o.deliveryDate?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brown-dark">Pedidos</h1>
          <p className="text-brown-medium text-sm mt-1">{allOrders.length} pedido(s) en total</p>
        </div>
        <Link
          href="/admin/pedidos/nuevo"
          className="inline-flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-cream px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Nuevo Pedido
        </Link>
      </div>

      {/* Panel de ingresos */}
      <div className="bg-white rounded-2xl border border-beige p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-brown-dark font-semibold text-sm">
            <TrendingUp size={16} className="text-earth" />
            Resumen de ingresos
          </div>
          <Suspense fallback={null}>
            <IngresosFiltro />
          </Suspense>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-beige/50 rounded-xl p-4">
            <p className="text-xs text-brown-medium/60 mb-1">Total facturado</p>
            <p className="text-xl font-bold text-brown-dark">{fmt(ingresos)}</p>
          </div>
          <div className="bg-beige/50 rounded-xl p-4">
            <p className="text-xs text-brown-medium/60 mb-1">Señas cobradas</p>
            <p className="text-xl font-bold text-green-600">{fmt(seniasTotal)}</p>
          </div>
          <div className="bg-beige/50 rounded-xl p-4">
            <p className="text-xs text-brown-medium/60 mb-1">Saldo pendiente</p>
            <p className="text-xl font-bold text-red-500">{fmt(saldoPend)}</p>
          </div>
          <div className="bg-beige/50 rounded-xl p-4">
            <p className="text-xs text-brown-medium/60 mb-1">Pedidos en período</p>
            <p className="text-xl font-bold text-brown-dark">{filteredOrders.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          {pendientes > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-full">
              <Clock size={12} /> {pendientes} pendiente(s) sin iniciar
            </div>
          )}
          {enProduccion > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
              <AlertCircle size={12} /> {enProduccion} en producción
            </div>
          )}
          {pendientes === 0 && enProduccion === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle size={12} /> Todo al día
            </div>
          )}
        </div>
      </div>

      {/* Lista interactiva */}
      <Suspense fallback={<div className="h-32 bg-white rounded-2xl border border-beige animate-pulse" />}>
        <PedidosClient initialOrders={serialized} />
      </Suspense>
    </div>
  );
}
