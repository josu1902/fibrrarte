'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Credenciales incorrectas');
        return;
      }

      toast.success('Bienvenido al panel de administración');
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-beige overflow-hidden">
          {/* Header */}
          <div className="bg-brown-dark px-8 py-10 text-center">
            <p className="font-heading text-3xl font-bold text-cream mb-1">Fibrarte</p>
            <p className="text-cream/60 text-sm">Panel de Administración</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h1 className="font-heading text-xl font-semibold text-brown-dark mb-6 text-center">
              Iniciar Sesión
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-brown-dark mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User size={16} className="text-brown-light" />
                  </div>
                  <input
                    {...register('username')}
                    type="text"
                    autoComplete="username"
                    placeholder="Ingresá tu usuario"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/50 transition-colors"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-brown-dark mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-brown-light" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Ingresá tu contraseña"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-brown-light hover:text-brown-medium transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brown-dark hover:bg-brown-medium text-cream py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-brown-medium/50 mt-6">
          &copy; {new Date().getFullYear()} Fibrarte
        </p>
      </div>
    </div>
  );
}
