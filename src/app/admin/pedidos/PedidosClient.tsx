'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, FileText, ChevronDown, DollarSign, AlertCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DeleteOrderButton from './DeleteOrderButton';

export type SerializedOrder = {
  id: number;
  clientName: string;
  clientPhone: string | null;
  status: string;
  total: number;
  deposit: number;
  balance: number;
  deliveryDate: string | null;
  createdAt: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:       { label: 'Pendiente',     cls: 'bg-yellow-100 text-yellow-800' },
  IN_PRODUCTION: { label: 'En producción', cls: 'bg-blue-100 text-blue-800' },
  READY:         { label: 'Listo',         cls: 'bg-green-100 text-green-800' },
  DELIVERED:     { label: 'Entregado',     cls: 'bg-gray-100 text-gray-600' },
  CANCELLED:     { label: 'Cancelado',     cls: 'bg-red-100 text-red-700' },
};

const STATUS_OPTIONS = [
  { value: 'PENDING',       label: 'Pendiente' },
  { value: 'IN_PRODUCTION', label: 'En producción' },
  { value: 'READY',         label: 'Listo' },
  { value: 'DELIVERED',     label: 'Entregado' },
  { value: 'CANCELLED',     label: 'Cancelado' },
];

const CHIPS = [
  { key: 'todos',      label: 'Todos',         statuses: null },
  { key: 'pendientes', label: 'Pendientes',    statuses: ['PENDING'] },
  { key: 'produccion', label: 'En producción', statuses: ['IN_PRODUCTION'] },
  { key: 'entregados', label: 'Entregados',    statuses: ['READY', 'DELIVERED'] },
];

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getUrgency(order: SerializedOrder): { label: string; level: 'red' | 'yellow' | 'none' } {
  if (!order.deliveryDate) return { label: '—', level: 'none' };
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return { label: new Date(order.deliveryDate).toLocaleDateString('es-AR'), level: 'none' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(order.deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  const diff = Math.round((delivery.getTime() - today.getTime()) / 86_400_000);

  if (diff < 0)  return { label: `Vencido hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? 's' : ''}`, level: 'red' };
  if (diff === 0) return { label: 'Hoy',     level: 'red' };
  if (diff === 1) return { label: 'Mañana',  level: 'red' };
  if (diff <= 4)  return { label: `En ${diff} días`, level: 'yellow' };
  return { label: delivery.toLocaleDateString('es-AR'), level: 'none' };
}

function sortOrders(orders: SerializedOrder[]) {
  const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const done   = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  active.sort((a, b) => {
    if (!a.deliveryDate && !b.deliveryDate) return 0;
    if (!a.deliveryDate) return 1;
    if (!b.deliveryDate) return -1;
    return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
  });

  done.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return [...active, ...done];
}

function buildWhatsAppUrl(order: SerializedOrder): string | null {
  if (!order.clientPhone) return null;
  const phone = order.clientPhone.replace(/\D/g, '');

  let msg: string;
  if (order.status === 'IN_PRODUCTION') {
    msg = `¡Hola ${order.clientName}! Tu pedido #${order.id} está en producción 🧶`;
  } else if (order.status === 'READY' || order.status === 'DELIVERED') {
    msg = `¡Hola ${order.clientName}! Tu pedido #${order.id} está listo para retirar 🎉`;
  } else {
    msg = `¡Hola ${order.clientName}! Te contactamos por tu pedido #${order.id} de Fibrarte.`;
  }

  if (order.balance > 0) {
    msg += ` Saldo pendiente: ${fmt(order.balance)}.`;
  }

  return `https://wa.me/54${phone}?text=${encodeURIComponent(msg)}`;
}

export default function PedidosClient({ initialOrders }: { initialOrders: SerializedOrder[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [orders, setOrders] = useState(initialOrders);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  useEffect(() => { setOrders(initialOrders); }, [initialOrders]);

  const search      = params.get('buscar') ?? '';
  const estadoFilter = params.get('estado') ?? 'todos';
  const onlyBalance  = params.get('saldo') === '1';

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key); else next.set(key, value);
    router.push(`/admin/pedidos?${next.toString()}`, { scroll: false });
  };

  const handleStatusChange = async (orderId: number, newStatus: string, balance: number) => {
    if (newStatus === 'DELIVERED' && balance > 0) {
      if (!window.confirm(`Este pedido tiene saldo pendiente de ${fmt(balance)}. ¿Confirmar entrega?`)) return;
    }
    setChangingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setChangingStatus(null);
    }
  };

  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: orders.length };
    CHIPS.slice(1).forEach(c => {
      counts[c.key] = orders.filter(o => c.statuses!.includes(o.status)).length;
    });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders;

    const chip = CHIPS.find(c => c.key === estadoFilter);
    if (chip?.statuses) result = result.filter(o => chip.statuses!.includes(o.status));

    if (search.trim()) {
      const q = normalize(search.trim());
      result = result.filter(o =>
        normalize(o.clientName).includes(q) ||
        (o.clientPhone && normalize(o.clientPhone).includes(q)) ||
        String(o.id).includes(q)
      );
    }

    if (onlyBalance) result = result.filter(o => o.balance > 0);

    return sortOrders(result);
  }, [orders, search, estadoFilter, onlyBalance]);

  const totalACobrar = useMemo(
    () => onlyBalance ? filtered.reduce((s, o) => s + o.balance, 0) : 0,
    [filtered, onlyBalance]
  );

  const clearFilters = () => {
    const next = new URLSearchParams(params.toString());
    next.delete('buscar'); next.delete('estado'); next.delete('saldo');
    router.push(`/admin/pedidos?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">

      {/* Buscador + toggle saldo */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={15} className="text-brown-medium/50" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setParam('buscar', e.target.value || null)}
            placeholder="Buscar por cliente, teléfono o N° de pedido…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-beige bg-white text-sm text-brown-dark placeholder-brown-medium/40 focus:outline-none focus:border-brown-medium transition-colors"
          />
          {search && (
            <button
              onClick={() => setParam('buscar', null)}
              className="absolute inset-y-0 right-3 flex items-center text-brown-medium/50 hover:text-brown-dark transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setParam('saldo', onlyBalance ? null : '1')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
            onlyBalance
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-white border-beige text-brown-medium hover:border-brown-light'
          }`}
        >
          <DollarSign size={14} />
          Solo con saldo
        </button>
      </div>

      {/* Chips de estado */}
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(chip => (
          <button
            key={chip.key}
            onClick={() => setParam('estado', chip.key === 'todos' ? null : chip.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              estadoFilter === chip.key
                ? 'bg-brown-dark text-cream shadow-sm'
                : 'bg-white border border-beige text-brown-medium hover:border-brown-light'
            }`}
          >
            {chip.label}
            <span className={`ml-1.5 ${estadoFilter === chip.key ? 'text-cream/70' : 'text-brown-medium/50'}`}>
              · {chipCounts[chip.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Total a cobrar */}
      {onlyBalance && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-2.5 rounded-xl">
          <AlertCircle size={15} />
          Total a cobrar: <span className="font-bold ml-1">{fmt(totalACobrar)}</span>
        </div>
      )}

      {/* Tabla / estado vacío */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-beige p-12 text-center">
          <p className="text-brown-medium/60 text-sm">No se encontraron pedidos con estos filtros.</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-earth hover:text-brown-dark text-sm font-medium transition-colors"
          >
            Limpiar filtros
          </button>
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
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {filtered.map(order => {
                const urgency  = getUrgency(order);
                const waUrl    = buildWhatsAppUrl(order);
                const statusInfo = STATUS[order.status] ?? { label: order.status, cls: 'bg-gray-100 text-gray-600' };
                const borderCls =
                  urgency.level === 'red'    ? 'border-l-4 border-l-red-400' :
                  urgency.level === 'yellow' ? 'border-l-4 border-l-yellow-400' :
                                               'border-l-4 border-l-transparent';

                return (
                  <tr key={order.id} className={`hover:bg-beige/20 transition-colors ${borderCls}`}>
                    <td className="px-4 py-4 text-brown-medium font-mono text-xs">#{order.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-brown-dark">{order.clientName}</p>
                      {order.clientPhone && <p className="text-brown-medium/60 text-xs">{order.clientPhone}</p>}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${
                        urgency.level === 'red'    ? 'text-red-600' :
                        urgency.level === 'yellow' ? 'text-yellow-700' : 'text-brown-medium'
                      }`}>
                        {urgency.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-brown-dark font-semibold hidden md:table-cell">{fmt(order.total)}</td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={order.balance > 0 ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                        {fmt(order.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value, order.balance)}
                          disabled={changingStatus === order.id}
                          className={`appearance-none pl-2.5 pr-6 py-0.5 rounded-full text-xs font-medium cursor-pointer border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${statusInfo.cls}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#25D366] hover:bg-green-50 rounded-lg transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <FaWhatsapp size={15} />
                          </a>
                        )}
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="p-1.5 text-brown-medium hover:text-brown-dark hover:bg-beige rounded-lg transition-colors"
                          title="Ver / Editar"
                        >
                          <FileText size={15} />
                        </Link>
                        <DeleteOrderButton id={order.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
