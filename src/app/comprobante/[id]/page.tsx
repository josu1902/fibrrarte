import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ComprobanteView from './ComprobanteView';

export default async function ComprobantePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { img?: string };
}) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <ComprobanteView
      autoImg={searchParams.img === '1'}
      order={{
        id: order.id,
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        clientEmail: order.clientEmail,
        deliveryDate: order.deliveryDate?.toISOString() ?? null,
        notes: order.notes,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        deposit: Number(order.deposit),
        balance: Number(order.balance),
        createdAt: order.createdAt.toISOString(),
        items: order.items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
          subtotal: Number(i.subtotal),
        })),
      }}
    />
  );
}
