'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ConfiguracionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const toggle = (field: keyof typeof show) =>
    setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.next.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (form.next !== form.confirm) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Error al cambiar la contraseña');
        return;
      }

      toast.success('Contraseña actualizada. Iniciá sesión de nuevo.');
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark transition-colors pr-12";

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brown-dark/10 flex items-center justify-center">
          <KeyRound size={18} className="text-brown-dark" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-dark">Configuración</h1>
          <p className="text-brown-medium text-sm">Cambiar contraseña de acceso</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-beige p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {[
            { id: 'current', label: 'Contraseña actual', key: 'current' as const },
            { id: 'next',    label: 'Nueva contraseña',  key: 'next'    as const },
            { id: 'confirm', label: 'Confirmar nueva contraseña', key: 'confirm' as const },
          ].map(({ id, label, key }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                {label}
              </label>
              <div className="relative">
                <input
                  type={show[key] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown-medium transition-colors"
                >
                  {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          <p className="text-xs text-brown-medium/60">
            Mínimo 8 caracteres. Al guardar, se cerrará la sesión automáticamente.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brown-dark hover:bg-brown-medium text-cream py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
