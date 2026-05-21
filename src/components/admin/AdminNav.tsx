'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { LayoutDashboard, Package, ClipboardList, Tag, ExternalLink, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',   href: '/admin/dashboard',   icon: LayoutDashboard },
  { label: 'Productos',   href: '/admin/productos',    icon: Package },
  { label: 'Categorías',  href: '/admin/categorias',   icon: Tag },
  { label: 'Pedidos',     href: '/admin/pedidos',      icon: ClipboardList },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Sesión cerrada');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brown-dark border-b border-brown-medium/30 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/admin/dashboard" className="font-heading text-xl font-bold text-cream">
          Fibrarte <span className="text-brown-light text-sm font-normal">Admin</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brown-medium text-cream'
                    : 'text-cream/70 hover:text-cream hover:bg-brown-medium/50'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <div className="h-5 w-px bg-brown-medium/50 mx-2" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-cream/70 hover:text-cream hover:bg-brown-medium/50 transition-colors"
          >
            <ExternalLink size={16} />
            Ver sitio
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors ml-1"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-cream/70 hover:text-cream transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brown-dark border-t border-brown-medium/30">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brown-medium text-cream'
                      : 'text-cream/70 hover:text-cream hover:bg-brown-medium/50'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-cream/70 hover:text-cream hover:bg-brown-medium/50 transition-colors"
            >
              <ExternalLink size={16} />
              Ver sitio
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
