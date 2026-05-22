import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

function auth(req: NextRequest) {
  const token = req.cookies.get('fibrarte-token')?.value;
  return token && verifyToken(token);
}

async function getOrderWithItems(id: number) {
  const [orders] = await pool.execute<RowDataPacket[]>('SELECT * FROM `Order` WHERE id = ?', [id]);
  if (!orders[0]) return null;
  const [items] = await pool.execute<RowDataPacket[]>('SELECT * FROM OrderItem WHERE orderId = ?', [id]);
  return { ...orders[0], items };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const order = await getOrderWithItems(parseInt(params.id));
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const conn = await pool.getConnection();
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { clientName, clientPhone, clientEmail, items, discount, deposit, deliveryDate, notes, status } = body;

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
    const discountAmt = parseFloat(discount) || 0;
    const depositAmt = parseFloat(deposit) || 0;
    const total = subtotal - discountAmt;
    const balance = total - depositAmt;

    await conn.beginTransaction();
    await conn.execute('DELETE FROM OrderItem WHERE orderId = ?', [id]);
    await conn.execute(
      'UPDATE `Order` SET clientName=?, clientPhone=?, clientEmail=?, subtotal=?, discount=?, total=?, deposit=?, balance=?, status=?, deliveryDate=?, notes=?, updatedAt=NOW() WHERE id=?',
      [clientName, clientPhone || null, clientEmail || null, subtotal, discountAmt, total, depositAmt, balance, status, deliveryDate ? new Date(deliveryDate) : null, notes || null, id]
    );
    for (const i of items) {
      await conn.execute(
        'INSERT INTO OrderItem (orderId, productId, name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [id, i.productId || null, i.name, i.price, i.quantity, i.price * i.quantity]
      );
    }
    await conn.commit();
    const order = await getOrderWithItems(id);
    return NextResponse.json(order);
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await pool.execute('DELETE FROM `Order` WHERE id = ?', [parseInt(params.id)]);
  return NextResponse.json({ message: 'Pedido eliminado' });
}
