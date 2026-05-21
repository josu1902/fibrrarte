import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function auth(req: NextRequest) {
  const token = req.cookies.get('fibrarte-token')?.value;
  return token && verifyToken(token);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: parseInt(params.id) },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { clientName, clientPhone, clientEmail, items, discount, deposit, deliveryDate, notes, status } = body;

    const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const discountAmt = parseFloat(discount) || 0;
    const depositAmt = parseFloat(deposit) || 0;
    const total = subtotal - discountAmt;
    const balance = total - depositAmt;

    await prisma.orderItem.deleteMany({ where: { orderId: id } });

    const order = await prisma.order.update({
      where: { id },
      data: {
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        subtotal,
        discount: discountAmt,
        total,
        deposit: depositAmt,
        balance,
        status,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
        items: {
          create: items.map((i: { name: string; price: number; quantity: number; productId?: number }) => ({
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

    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.order.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ message: 'Pedido eliminado' });
}
