import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import ComprobanteView from './ComprobanteView';

export default async function ComprobantePage({ params, searchParams }: { params: { id: string }; searchParams: { img?: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [orders] = await pool.execute<RowDataPacket[]>('SELECT * FROM `Order` WHERE id = ?', [id]);
  if (!orders[0]) notFound();
  const order = orders[0];

  const [items] = await pool.execute<RowDataPacket[]>('SELECT * FROM OrderItem WHERE orderId = ?', [id]);

  return (
    <ComprobanteView
      autoImg={searchParams.img === '1'}
      order={{
        id: order.id,
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        clientEmail: order.clientEmail,
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString() : null,
        notes: order.notes,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        deposit: Number(order.deposit),
        balance: Number(order.balance),
        createdAt: new Date(order.createdAt).toISOString(),
        items: items.map(i => ({
          id: i.id, name: i.name, quantity: i.quantity, price: Number(i.price), subtotal: Number(i.subtotal),
        })),
      }}
    />
  );
}
