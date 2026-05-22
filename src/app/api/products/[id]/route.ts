import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function getProduct(id: number) {
  const [products] = await pool.execute<RowDataPacket[]>(
    'SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug FROM Product p JOIN Category c ON c.id = p.categoryId WHERE p.id = ?',
    [id]
  );
  if (!products[0]) return null;
  const p = products[0];
  const [images] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ProductImage WHERE productId = ? ORDER BY isPrimary DESC, `order` ASC',
    [id]
  );
  return { ...p, category: { id: p.cat_id, name: p.cat_name, slug: p.cat_slug }, images };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    const product = await getProduct(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('fibrarte-token')?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });

    const body = await request.json();
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.name !== undefined)        { fields.push('name = ?');        values.push(body.name); }
    if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description); }
    if (body.price !== undefined)       { fields.push('price = ?');       values.push(body.price); }
    if (body.measures !== undefined)    { fields.push('measures = ?');    values.push(body.measures); }
    if (body.whatsappMsg !== undefined) { fields.push('whatsappMsg = ?'); values.push(body.whatsappMsg); }
    if (body.categoryId !== undefined)  { fields.push('categoryId = ?');  values.push(parseInt(body.categoryId)); }
    if (body.active !== undefined)      { fields.push('active = ?');      values.push(body.active ? 1 : 0); }
    if (body.order !== undefined)       { fields.push('`order` = ?');     values.push(body.order); }
    fields.push('updatedAt = NOW()');
    values.push(id);

    await pool.execute(`UPDATE Product SET ${fields.join(', ')} WHERE id = ?`, values);
    const product = await getProduct(id);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('fibrarte-token')?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    await pool.execute('DELETE FROM Product WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 });
  }
}
