'use client';

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING:       { label: 'Pendiente',      color: 'bg-yellow-100 text-yellow-800' },
  IN_PRODUCTION: { label: 'En producción',  color: 'bg-blue-100 text-blue-800' },
  READY:         { label: 'Listo',          color: 'bg-green-100 text-green-800' },
  DELIVERED:     { label: 'Entregado',      color: 'bg-gray-100 text-gray-600' },
  CANCELLED:     { label: 'Cancelado',      color: 'bg-red-100 text-red-700' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
