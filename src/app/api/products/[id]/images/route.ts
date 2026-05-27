import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const token = request.cookies.get('fibrarte-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    const { url, alt, isPrimary } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // If this is the primary image, unset all others
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        url,
        alt: alt || null,
        isPrimary: isPrimary || false,
        productId,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json({ error: 'Error creating image' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const token = request.cookies.get('fibrarte-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    const { updates } = body as { updates: { id: number; isPrimary: boolean; order: number }[] };

    // Reset all isPrimary first, then apply new values
    await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });

    for (const u of updates) {
      await prisma.productImage.update({
        where: { id: u.id, productId },
        data: { isPrimary: u.isPrimary, order: u.order },
      });
    }

    return NextResponse.json({ message: 'Images updated' });
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json({ error: 'Error updating images' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const token = request.cookies.get('fibrarte-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const imageId = parseInt(searchParams.get('imageId') || '');

    if (isNaN(imageId)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    const image = await prisma.productImage.findUnique({ where: { id: imageId } });

    await prisma.productImage.delete({
      where: { id: imageId, productId },
    });

    if (image?.url) {
      await deleteFromCloudinary(image.url).catch(() => undefined);
    }

    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 });
  }
}
