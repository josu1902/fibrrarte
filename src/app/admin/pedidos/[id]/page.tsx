import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import OrderForm from '../OrderForm';
import OrderStatusBadge from '../OrderStatusBadge';
import PrintActions from './PrintActions';

function fmt(n: unknown) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Number(n));
}

export default async function PedidoPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const initial = {
    clientName:   order.clientName,
    clientPhone:  order.clientPhone  || '',
    clientEmail:  order.clientEmail  || '',
    status:       order.status,
    deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : '',
    notes:        order.notes || '',
    discount:     order.discount.toString(),
    deposit:      order.deposit.toString(),
    items: order.items.map(i => ({
      productId: i.productId || undefined,
      name:      i.name,
      price:     i.price.toString(),
      quantity:  i.quantity,
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm text-brown-medium hover:text-brown-dark transition-colors mb-4">
          <ArrowLeft size={16} /> Volver a Pedidos
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold text-brown-dark">Pedido #{order.id}</h1>
            <div className="flex items-center gap-3 mt-1">
              <OrderStatusBadge status={order.status} />
              <span className="text-brown-medium/60 text-sm">{order.clientName}</span>
            </div>
          </div>
          <PrintActions orderId={order.id} clientName={order.clientName} />
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: fmt(order.total), color: 'text-brown-dark' },
          { label: 'Seña',  value: fmt(order.deposit), color: 'text-green-600' },
          { label: 'Saldo', value: fmt(order.balance), color: Number(order.balance) > 0 ? 'text-red-500' : 'text-green-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-beige p-4 text-center">
            <p className="text-xs text-brown-medium/60 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <OrderForm mode="edit" orderId={order.id} initial={initial} />
    </div>
  );
}
