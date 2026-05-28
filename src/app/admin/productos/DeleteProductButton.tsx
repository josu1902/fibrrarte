'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/actions/products';

interface DeleteProductButtonProps {
  id: number;
  name: string;
}

export default function DeleteProductButton({ id, name }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado');
      router.refresh();
    } catch {
      toast.error('Error al eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 size={12} />
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  );
}
