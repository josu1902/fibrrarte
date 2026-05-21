import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrderForm from '../OrderForm';

export default function NuevoPedidoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm text-brown-medium hover:text-brown-dark transition-colors mb-4">
          <ArrowLeft size={16} /> Volver a Pedidos
        </Link>
        <h1 className="font-heading text-3xl font-bold text-brown-dark">Nuevo Pedido</h1>
      </div>
      <OrderForm mode="create" />
    </div>
  );
}
