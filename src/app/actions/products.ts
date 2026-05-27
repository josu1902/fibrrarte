'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('fibrarte-token')?.value;
  if (!token || !verifyToken(token)) throw new Error('No autorizado');
}

export async function createProductAction(data: {
  name: string;
  description: string;
  price: number;
  measures: string | null;
  whatsappMsg: string | null;
  categoryId: number;
  active: boolean;
  order: number;
}) {
  checkAuth();
  const product = await prisma.product.create({
    data,
    include: { category: true, images: true },
  });
  revalidatePath('/admin/productos');
  return { id: product.id };
}

export async function updateProductAction(
  id: number,
  data: {
    name: string;
    description: string;
    price: number;
    measures: string | null;
    whatsappMsg: string | null;
    categoryId: number;
    active: boolean;
    order: number;
  }
) {
  checkAuth();
  await prisma.product.update({ where: { id }, data });
  revalidatePath('/admin/productos');
}

export async function saveImageAction(
  productId: number,
  url: string,
  alt: string | null,
  isPrimary: boolean
) {
  checkAuth();
  if (isPrimary) {
    await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
  }
  await prisma.productImage.create({ data: { url, alt, isPrimary, productId } });
}

export async function deleteImageAction(imageId: number, productId: number) {
  checkAuth();
  await prisma.productImage.delete({ where: { id: imageId, productId } });
}

export async function updateImagesAction(
  productId: number,
  updates: { id: number; isPrimary: boolean; order: number }[]
) {
  checkAuth();
  await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
  for (const u of updates) {
    await prisma.productImage.update({
      where: { id: u.id, productId },
      data: { isPrimary: u.isPrimary, order: u.order },
    });
  }
}
