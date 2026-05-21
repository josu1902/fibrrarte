'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

type Category = {
  id: number;
  name: string;
  slug: string;
  order: number;
  _count: { products: number };
};

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), order: categories.length }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error al crear'); return; }
      setCategories(prev => [...prev, { ...data, _count: { products: 0 } }]);
      setNewName('');
      toast.success('Categoría creada');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  async function handleEdit(id: number) {
    if (!editName.trim()) return;
    try {
      const cat = categories.find(c => c.id === id)!;
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), order: cat.order }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error al actualizar'); return; }
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: data.name, slug: data.slug } : c));
      setEditingId(null);
      toast.success('Categoría actualizada');
    } catch {
      toast.error('Error al actualizar');
    }
  }

  async function handleDelete(id: number) {
    const cat = categories.find(c => c.id === id)!;
    if (cat._count.products > 0) {
      toast.error(`No se puede eliminar: tiene ${cat._count.products} producto(s)`);
      return;
    }
    if (!confirm(`¿Eliminar "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error al eliminar'); return; }
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Categoría eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  }

  return (
    <div className="space-y-6">
      {/* Crear nueva */}
      <div className="bg-white rounded-2xl border border-beige p-5">
        <h2 className="font-semibold text-brown-dark text-sm mb-4 flex items-center gap-2">
          <Plus size={15} className="text-earth" /> Nueva categoría
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Ej: Imanes, Portarretratos…"
            className="flex-1 border border-beige rounded-xl px-4 py-2.5 text-sm text-brown-dark placeholder-brown-medium/40 focus:outline-none focus:ring-2 focus:ring-brown-light/40"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="bg-brown-dark hover:bg-brown-medium text-cream px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {creating ? 'Creando…' : 'Crear'}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-beige overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-brown-medium/60 text-sm">
            No hay categorías todavía. Creá la primera arriba.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-beige/50 border-b border-beige">
              <tr>
                <th className="w-8 px-4 py-3" />
                <th className="text-left px-4 py-3 text-brown-dark font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 text-brown-dark font-semibold hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-brown-dark font-semibold">Productos</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-beige/20 transition-colors">
                  <td className="px-4 py-4 text-brown-medium/40">
                    <GripVertical size={14} />
                  </td>
                  <td className="px-4 py-4">
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEdit(cat.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="border border-brown-light/40 rounded-lg px-3 py-1.5 text-sm text-brown-dark focus:outline-none focus:ring-2 focus:ring-brown-light/40 w-full max-w-xs"
                      />
                    ) : (
                      <span className="font-medium text-brown-dark">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-brown-medium/60 font-mono text-xs hidden sm:table-cell">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      cat._count.products > 0
                        ? 'bg-beige text-brown-medium'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {cat._count.products} producto{cat._count.products !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(cat.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Guardar"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-brown-medium hover:bg-beige rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-brown-medium hover:text-brown-dark hover:bg-beige rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              cat._count.products > 0
                                ? 'text-brown-medium/30 cursor-not-allowed'
                                : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={cat._count.products > 0 ? 'Tiene productos asociados' : 'Eliminar'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
