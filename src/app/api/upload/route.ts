import { NextResponse } from 'next/server';

// Las imágenes se suben directo a Cloudinary desde el navegador.
// Este endpoint ya no se usa pero se mantiene para compatibilidad.
export async function POST() {
  return NextResponse.json({ error: 'Use direct Cloudinary upload' }, { status: 410 });
}
