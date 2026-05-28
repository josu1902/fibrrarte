'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function requireAuth() {
  const token = cookies().get('fibrarte-token')?.value;
  if (!token || !verifyToken(token)) {
    throw new Error('No autorizado');
  }
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  measures: string | null;
  whatsappMsg: string | null;
  categoryId: number;
  active: boolean;
  order: number;
}): Promise<{ id: number }> {
  requireAuth();
  const product = await prisma.product.create({ data });
  revalidatePath('/');
  return { id: product.id };
}

export async function updateProduct(
  id: number,
  data: {
    name?: string;
    description?: string;
    price?: number;
    measures?: string | null;
    whatsappMsg?: string | null;
    categoryId?: number;
    active?: boolean;
    order?: number;
  }
): Promise<void> {
  requireAuth();
  await prisma.product.update({ where: { id }, data });
  revalidatePath('/');
}

export async function addProductImage(
  productId: number,
  image: { url: string; alt?: string | null; isPrimary: boolean }
): Promise<void> {
  requireAuth();
  if (image.isPrimary) {
    await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
  }
  await prisma.productImage.create({
    data: { url: image.url, alt: image.alt || null, isPrimary: image.isPrimary, productId },
  });
}

export async function removeProductImage(productId: number, imageId: number): Promise<void> {
  requireAuth();
  await prisma.productImage.delete({ where: { id: imageId, productId } });
}

export async function updateProductImages(
  productId: number,
  updates: { id: number; isPrimary: boolean; order: number }[]
): Promise<void> {
  requireAuth();
  await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
  for (const u of updates) {
    await prisma.productImage.update({
      where: { id: u.id, productId },
      data: { isPrimary: u.isPrimary, order: u.order },
    });
  }
}

export async function deleteProduct(id: number): Promise<void> {
  requireAuth();
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/productos');
  revalidatePath('/');
}
