import Link from 'next/link';
import { Suspense } from 'react';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Plus, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import DeleteOrderButton from './DeleteOrderButton';
import IngresosFiltro from './IngresosFiltro';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

function getDateRange(periodo: string) {
  const now = new Date();
  const to = new Date(now); to.setHours(23, 59, 59, 999);
  switch (periodo) {
    case 'hoy':   { const from = new Date(now); from.setHours(0,0,0,0); return { from, to }; }
    case 'semana':{ const from = new Date(now); from.setDate(now.getDate()-now.getDay()); from.setHours(0,0,0,0); return { from, to }; }
    case 'anio':  { return { from: new Date(now.getFullYear(), 0, 1), to }; }
    case 'todo':  { return { from: new Date(2000, 0, 1), to }; }
    default:      { return { from: new Date(now.getFullYear(), now.getMonth(), 1), to }; }
  }
}

export default async function PedidosPage({ searchParams }: { searchParams: { periodo?: string } }) {
  const periodo = searchParams.periodo || 'mes';
  const { from, to } = getDateRange(periodo);

  const [allOrders] = await pool.execute<RowDataPacket[]>('SELECT * FROM `Order` ORDER BY createdAt DESC');
  const [filteredOrders] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM `Order` WHERE createdAt >= ? AND createdAt <= ? AND status != 'CANCELLED'",
    [from, to]
  );

  const ingresos    = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const seniasTotal = filteredOrders.reduce((s, o) => s + Number(o.deposit), 0);
  const saldoPend   = filteredOrders.reduce((s, o) => s + Number(o.balance), 0);
  const pendientes  = allOrders.filter(o => o.status === 'PENDING').length;
  const enProd      = allOrders.filter(o => o.status === 'IN_PRODUCTION').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brown-dark">Pedidos</h1>
          <p className="text-brown-medium text-sm mt-1">{allOrders.length} pedido(s) en total</p>
        </div>
        <Link href="/admin/pedidos/nuevo" className="inline-flex items-center gap-2 bg-brown-dark hover:bg-brown-medium text-cream px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus size={16} /> Nuevo Pedido
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-beige p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-brown-dark font-semibold text-sm">
            <TrendingUp size={16} className="text-earth" /> Resumen de ingresos
          </div>
          <Suspense fallback={null}><IngresosFiltro /></Suspense>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total facturado', value: fmt(ingresos), cls: 'text-brown-dark' },
            { label: 'Señas cobradas', value: fmt(seniasTotal), cls: 'text-green-600' },
            { label: 'Saldo pendiente', value: fmt(saldoPend), cls: 'text-red-500' },
            { label: 'Pedidos en período', value: String(filteredOrders.length), cls: 'text-brown-dark' },
          ].map(s => (
            <div key={s.label} className="bg-beige/50 rounded-xl p-4">
              <p className="text-xs text-brown-medium/60 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          {pendientes > 0 && <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-full"><Clock size={12}/> {pendientes} pendiente(s)</div>}
          {enProd > 0 && <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full"><AlertCircle size={12}/> {enProd} en producción</div>}
          {pendientes === 0 && enProd === 0 && <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full"><CheckCircle size={12}/> Todo al día</div>}
        </div>
      </div>

      {allOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige p-16 text-center">
          <p className="text-brown-medium/60">No hay pedidos todavía.</p>
          <Link href="/admin/pedidos/nuevo" className="mt-4 inline-flex items-center gap-2 text-earth hover:text-brown-dark text-sm font-medium transition-colors"><Plus size={14}/> Crear primer pedido</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-beige overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 border-b border-beige">
              <tr>
                <th className="text-left px-5 py-3 text-brown-dark font-semibold">#</th>
                <th className="text-left px-5 py-3 text-brown-dark font-semibold">Cliente</th>
                <th className="text-left px-5 py-3 text-brown-dark font-semibold hidden sm:table-cell">Entrega</th>
                <th className="text-left px-5 py-3 text-brown-dark font-semibold hidden md:table-cell">Total</th>
                <th className="text-left px-5 py-3 text-brown-dark font-semibold hidden md:table-cell">Saldo</th>
                <th className="text-left px-5 py-3 text-brown-dark font-semibold">Estado</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {allOrders.map((order) => (
                <tr key={order.id} className="hover:bg-beige/20 transition-colors">
                  <td className="px-5 py-4 text-brown-medium font-mono text-xs">#{order.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-brown-dark">{order.clientName}</p>
                    {order.clientPhone && <p className="text-brown-medium/60 text-xs">{order.clientPhone}</p>}
                  </td>
                  <td className="px-5 py-4 text-brown-medium hidden sm:table-cell">
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="px-5 py-4 text-brown-dark font-semibold hidden md:table-cell">{fmt(Number(order.total))}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={Number(order.balance) > 0 ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>{fmt(Number(order.balance))}</span>
                  </td>
                  <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/pedidos/${order.id}`} className="p-1.5 text-brown-medium hover:text-brown-dark hover:bg-beige rounded-lg transition-colors"><FileText size={15}/></Link>
                      <DeleteOrderButton id={order.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
