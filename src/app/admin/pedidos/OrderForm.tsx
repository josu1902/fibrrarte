'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product { id: number; name: string; price: string; }
interface Item { productId?: number; name: string; price: string; quantity: number; }

const STATUSES = [
  { value: 'PENDING',       label: 'Pendiente' },
  { value: 'IN_PRODUCTION', label: 'En producción' },
  { value: 'READY',         label: 'Listo' },
  { value: 'DELIVERED',     label: 'Entregado' },
  { value: 'CANCELLED',     label: 'Cancelado' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

interface OrderFormProps {
  mode: 'create' | 'edit';
  orderId?: number;
  initial?: {
    clientName: string; clientPhone: string; clientEmail: string;
    status: string; deliveryDate: string; notes: string;
    discount: string; deposit: string;
    items: Item[];
  };
}

export default function OrderForm({ mode, orderId, initial }: OrderFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const [clientName,   setClientName]   = useState(initial?.clientName   || '');
  const [clientPhone,  setClientPhone]  = useState(initial?.clientPhone  || '');
  const [clientEmail,  setClientEmail]  = useState(initial?.clientEmail  || '');
  const [status,       setStatus]       = useState(initial?.status       || 'PENDING');
  const [deliveryDate, setDeliveryDate] = useState(initial?.deliveryDate || '');
  const [notes,        setNotes]        = useState(initial?.notes        || '');
  const [discount,     setDiscount]     = useState(initial?.discount     || '0');
  const [deposit,      setDeposit]      = useState(initial?.deposit      || '0');
  const [items,        setItems]        = useState<Item[]>(initial?.items || [{ name: '', price: '', quantity: 1 }]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.price) || 0) * i.quantity, 0);
  const discountAmt = parseFloat(discount) || 0;
  const total = subtotal - discountAmt;
  const depositAmt = parseFloat(deposit) || 0;
  const balance = total - depositAmt;

  const addItem = () => setItems([...items, { name: '', price: '', quantity: 1 }]);

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    const updated = [...items];
    if (field === 'productId') {
      const p = products.find(p => p.id === Number(value));
      if (p) { updated[i] = { ...updated[i], productId: p.id, name: p.name, price: p.price }; }
    } else {
      (updated[i] as Record<string, unknown>)[field] = value;
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return toast.error('El nombre del cliente es requerido');
    if (items.some(i => !i.name || !i.price)) return toast.error('Completá todos los productos');
    setSaving(true);
    try {
      const url = mode === 'create' ? '/api/admin/orders' : `/api/admin/orders/${orderId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, clientPhone, clientEmail, status, deliveryDate, notes, discount, deposit, items }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(mode === 'create' ? 'Pedido creado' : 'Pedido actualizado');
      router.push(`/admin/pedidos/${data.id}`);
      router.refresh();
    } catch {
      toast.error('Error al guardar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium text-brown-dark text-sm transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Cliente */}
      <div className="bg-white rounded-2xl border border-beige p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-brown-dark border-b border-beige pb-3">Datos del Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-brown-dark mb-1">Nombre *</label>
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre completo" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-brown-dark mb-1">Teléfono</label>
            <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="387 000-0000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-brown-dark mb-1">Email</label>
            <input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="correo@ejemplo.com" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-2xl border border-beige p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-brown-dark border-b border-beige pb-3">Productos del Pedido</h2>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2">
                <div>
                  {i === 0 && <label className="block text-xs font-medium text-brown-dark mb-1">Producto</label>}
                  <select
                    value={item.productId || ''}
                    onChange={e => e.target.value ? updateItem(i, 'productId', e.target.value) : updateItem(i, 'name', '')}
                    className={inputCls}
                  >
                    <option value="">— Personalizado —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {!item.productId && (
                    <input
                      value={item.name}
                      onChange={e => updateItem(i, 'name', e.target.value)}
                      placeholder="Descripción del producto"
                      className={`${inputCls} mt-1`}
                    />
                  )}
                </div>
                <div>
                  {i === 0 && <label className="block text-xs font-medium text-brown-dark mb-1">Precio unit. ($)</label>}
                  <input
                    type="number" min="0" step="0.01"
                    value={item.price}
                    onChange={e => updateItem(i, 'price', e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  {i === 0 && <label className="block text-xs font-medium text-brown-dark mb-1">Cantidad</label>}
                  <input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className={i === 0 ? 'mt-5' : ''}>
                <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem}
          className="flex items-center gap-2 text-earth hover:text-brown-dark text-sm font-medium transition-colors">
          <Plus size={15} /> Agregar producto
        </button>

        {/* Totales */}
        <div className="border-t border-beige pt-4 space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm text-brown-medium">
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-brown-medium gap-4">
            <span>Descuento ($)</span>
            <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
              className="w-32 px-3 py-1.5 rounded-lg border border-beige bg-cream text-brown-dark text-sm text-right focus:outline-none focus:border-brown-medium" />
          </div>
          <div className="flex justify-between text-base font-bold text-brown-dark border-t border-beige pt-2">
            <span>Total</span><span>{fmt(total)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-brown-medium gap-4">
            <span>Seña ($)</span>
            <input type="number" min="0" value={deposit} onChange={e => setDeposit(e.target.value)}
              className="w-32 px-3 py-1.5 rounded-lg border border-beige bg-cream text-brown-dark text-sm text-right focus:outline-none focus:border-brown-medium" />
          </div>
          <div className={`flex justify-between text-sm font-semibold pt-1 ${balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
            <span>Saldo pendiente</span><span>{fmt(balance)}</span>
          </div>
        </div>
      </div>

      {/* Estado y entrega */}
      <div className="bg-white rounded-2xl border border-beige p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-brown-dark border-b border-beige pb-3">Estado y Entrega</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brown-dark mb-1">Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-brown-dark mb-1">Fecha de entrega</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-brown-dark mb-1">Notas</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Detalles del pedido, observaciones, diseño..."
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex-1 bg-brown-dark hover:bg-brown-medium text-cream py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear Pedido' : 'Guardar Cambios'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-beige text-brown-medium hover:bg-beige transition-colors font-medium text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
