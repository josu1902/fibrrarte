import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [products] = await pool.execute<RowDataPacket[]>(`
      SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.\`order\` as cat_order
      FROM Product p
      JOIN Category c ON c.id = p.categoryId
      WHERE p.active = 1
      ORDER BY c.\`order\` ASC, p.\`order\` ASC, p.createdAt DESC
    `);
    if (products.length === 0) return NextResponse.json([]);

    const productIds = products.map(p => p.id);
    const [images] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM ProductImage WHERE productId IN (${productIds.map(() => '?').join(',')}) ORDER BY isPrimary DESC, \`order\` ASC`,
      productIds
    );

    const result = products.map(p => ({
      id: p.id, name: p.name, description: p.description, price: p.price,
      measures: p.measures, whatsappMsg: p.whatsappMsg, active: p.active,
      order: p.order, categoryId: p.categoryId, createdAt: p.createdAt, updatedAt: p.updatedAt,
      category: { id: p.cat_id, name: p.cat_name, slug: p.cat_slug, order: p.cat_order },
      images: images.filter(i => i.productId === p.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('fibrarte-token')?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, price, measures, whatsappMsg, categoryId, active, order } = await request.json();
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO Product (name, description, price, measures, whatsappMsg, categoryId, active, `order`, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, description, price, measures || null, whatsappMsg || null, parseInt(categoryId), active !== false ? 1 : 0, order || 0]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug FROM Product p JOIN Category c ON c.id = p.categoryId WHERE p.id = ?',
      [result.insertId]
    );
    const p = rows[0];
    return NextResponse.json({
      ...p, category: { id: p.cat_id, name: p.cat_name, slug: p.cat_slug }, images: [],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
