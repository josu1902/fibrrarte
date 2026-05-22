import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function authCheck(request: NextRequest) {
  const token = request.cookies.get('fibrarte-token')?.value;
  return token && verifyToken(token);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!authCheck(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const productId = parseInt(params.id);
    if (isNaN(productId)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });

    const { url, alt, isPrimary } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    if (isPrimary) {
      await pool.execute('UPDATE ProductImage SET isPrimary = 0 WHERE productId = ?', [productId]);
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO ProductImage (url, alt, isPrimary, `order`, productId, createdAt) VALUES (?, ?, ?, 0, ?, NOW())',
      [url, alt || null, isPrimary ? 1 : 0, productId]
    );
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM ProductImage WHERE id = ?', [result.insertId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json({ error: 'Error creating image' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!authCheck(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const productId = parseInt(params.id);
    if (isNaN(productId)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });

    const { updates } = await request.json() as { updates: { id: number; isPrimary: boolean; order: number }[] };
    await pool.execute('UPDATE ProductImage SET isPrimary = 0 WHERE productId = ?', [productId]);
    for (const u of updates) {
      await pool.execute('UPDATE ProductImage SET isPrimary = ?, `order` = ? WHERE id = ? AND productId = ?', [u.isPrimary ? 1 : 0, u.order, u.id, productId]);
    }
    return NextResponse.json({ message: 'Images updated' });
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json({ error: 'Error updating images' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!authCheck(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const productId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const imageId = parseInt(searchParams.get('imageId') || '');
    if (isNaN(imageId)) return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });

    await pool.execute('DELETE FROM ProductImage WHERE id = ? AND productId = ?', [imageId, productId]);
    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 });
  }
}
