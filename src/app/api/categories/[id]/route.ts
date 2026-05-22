import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

function auth(req: NextRequest) {
  const token = req.cookies.get('fibrarte-token')?.value;
  return token && verifyToken(token);
}

function toSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  try {
    const { name, order } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });

    const slug = toSlug(name.trim());
    await pool.execute('UPDATE Category SET name = ?, slug = ?, `order` = ? WHERE id = ?', [name.trim(), slug, order ?? 0, id]);
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM Category WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const [rows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM Product WHERE categoryId = ?', [id]);
  const count = Number((rows[0] as RowDataPacket).count);
  if (count > 0) {
    return NextResponse.json({ error: `No se puede eliminar: tiene ${count} producto(s) asociado(s)` }, { status: 409 });
  }

  await pool.execute('DELETE FROM Category WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
