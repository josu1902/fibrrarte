import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [orders] = await pool.execute<RowDataPacket[]>('SELECT * FROM `Order` ORDER BY createdAt DESC');
  if ((orders as RowDataPacket[]).length === 0) return NextResponse.json([]);
  const orderIds = (orders as RowDataPacket[]).map(o => o.id);
  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM OrderItem WHERE orderId IN (${orderIds.map(() => '?').join(',')})`,
    orderIds
  );
  const result = (orders as RowDataPacket[]).map(o => ({ ...o, items: (items as RowDataPacket[]).filter(i => i.orderId === o.id) }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const { clientName, clientPhone, clientEmail, items, discount, deposit, deliveryDate, notes, status } = body;

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
    const discountAmt = parseFloat(discount) || 0;
    const depositAmt = parseFloat(deposit) || 0;
    const total = subtotal - discountAmt;
    const balance = total - depositAmt;

    await conn.beginTransaction();

    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO `Order` (clientName, clientPhone, clientEmail, subtotal, discount, total, deposit, balance, status, deliveryDate, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [clientName, clientPhone || null, clientEmail || null, subtotal, discountAmt, total, depositAmt, balance, status || 'PENDING', deliveryDate ? new Date(deliveryDate) : null, notes || null]
    );
    const orderId = result.insertId;

    for (const i of items) {
      await conn.execute(
        'INSERT INTO OrderItem (orderId, productId, name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, i.productId || null, i.name, i.price, i.quantity, i.price * i.quantity]
      );
    }

    await conn.commit();
    const order = await getOrderWithItems(orderId);
    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  } finally {
    conn.release();
  }
}
