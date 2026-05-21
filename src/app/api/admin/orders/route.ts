import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function auth(req: NextRequest) {
  const token = req.cookies.get('fibrarte-token')?.value;
  return token && verifyToken(token);
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { clientName, clientPhone, clientEmail, items, discount, deposit, deliveryDate, notes, status } = body;

    const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const discountAmt = parseFloat(discount) || 0;
    const depositAmt = parseFloat(deposit) || 0;
    const total = subtotal - discountAmt;
    const balance = total - depositAmt;

    const order = await prisma.order.create({
      data: {
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        subtotal,
        discount: discountAmt,
        total,
        deposit: depositAmt,
        balance,
        status: status || 'PENDING',
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
        items: {
          create: items.map((i: { name: string; price: number; quantity: number }) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            subtotal: i.price * i.quantity,
            productId: i.productId || null,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  }
}
