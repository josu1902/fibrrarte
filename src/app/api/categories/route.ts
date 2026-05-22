import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function auth(req: NextRequest) {
  const token = req.cookies.get('fibrarte-token')?.value;
  return token && verifyToken(token);
}

function toSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT c.id, c.name, c.slug, c.\`order\`, c.createdAt,
             COUNT(p.id) as productCount
      FROM Category c
      LEFT JOIN Product p ON p.categoryId = c.id
      GROUP BY c.id
      ORDER BY c.\`order\` ASC
    `);
    const categories = rows.map(r => ({
      ...r,
      _count: { products: Number(r.productCount) },
    }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name, order } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });

    const slug = toSlug(name.trim());
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO Category (name, slug, `order`, createdAt) VALUES (?, ?, ?, NOW())',
      [name.trim(), slug, order ?? 0]
    );
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM Category WHERE id = ?', [result.insertId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}
