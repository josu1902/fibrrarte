import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const info = {
    databaseUrl: process.env.DATABASE_URL ? 'configurado' : 'NO CONFIGURADO',
    jwtSecret: process.env.JWT_SECRET ? 'configurado' : 'NO CONFIGURADO',
    nodeEnv: process.env.NODE_ENV,
    dbStatus: 'sin probar',
    dbError: null as string | null,
  };

  try {
    await pool.execute('SELECT 1');
    info.dbStatus = 'CONECTADO OK';
  } catch (e) {
    info.dbStatus = 'ERROR';
    info.dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(info);
}
