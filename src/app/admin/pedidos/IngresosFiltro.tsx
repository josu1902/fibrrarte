'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const PERIODOS = [
  { value: 'hoy',    label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes',    label: 'Este mes' },
  { value: 'anio',   label: 'Este año' },
  { value: 'todo',   label: 'Todo' },
];

export default function IngresosFiltro() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get('periodo') || 'mes';

  const set = (v: string) => {
    const next = new URLSearchParams(params.toString());
    next.set('periodo', v);
    router.push(`/admin/pedidos?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PERIODOS.map(p => (
        <button
          key={p.value}
          onClick={() => set(p.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            current === p.value
              ? 'bg-brown-dark text-cream shadow-sm'
              : 'bg-beige text-brown-medium hover:border-brown-light border border-brown-light/30'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
