'use client';

import { useRef, useState, useEffect } from 'react';
import { Printer, Share2, Check, ImageDown } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

type Item = { id: number; name: string; quantity: number; price: number; subtotal: number };
type Order = {
  id: number; clientName: string; clientPhone: string | null; clientEmail: string | null;
  deliveryDate: string | null; notes: string | null;
  subtotal: number; discount: number; total: number; deposit: number; balance: number;
  createdAt: string; items: Item[];
};

export default function ComprobanteView({ order, autoImg }: { order: Order; autoImg?: boolean }) {
  const docRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fecha = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (autoImg) {
      const t = setTimeout(() => handleDescargarImagen(), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoImg]);

  async function handleDescargarImagen() {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(docRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `comprobante-fibrarte-${order.clientName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  async function handleCompartir() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `Comprobante Fibrarte — ${order.clientName}`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const btnCls = "flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border";

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4" style={{ background: '#f5f0e8' }}>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 w-full max-w-[640px] mb-5">
        <button
          onClick={handleDescargarImagen}
          disabled={downloading}
          className={`${btnCls} bg-brown-dark text-cream border-brown-dark hover:opacity-90 disabled:opacity-60`}
          style={{ background: '#4a2c14', color: '#fff', borderColor: '#4a2c14' }}
        >
          <ImageDown size={16} />
          {downloading ? 'Generando...' : 'Descargar imagen'}
        </button>
        <button
          onClick={() => window.print()}
          className={`${btnCls} bg-white border-brown-light/50 text-brown-dark hover:bg-beige`}
          style={{ background: '#fff', borderColor: '#c8906a', color: '#4a2c14' }}
        >
          <Printer size={16} /> Imprimir
        </button>
        <button
          onClick={handleCompartir}
          className={`${btnCls} bg-white border-brown-light/50 text-brown-dark hover:bg-beige`}
          style={{ background: '#fff', borderColor: '#c8906a', color: '#4a2c14' }}
        >
          {copied ? <><Check size={16} style={{ color: '#16a34a' }} /> Copiado</> : <><Share2 size={16} /> Compartir</>}
        </button>
      </div>

      {/* Document */}
      <div
        ref={docRef}
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: '640px',
          borderRadius: '12px',
          overflow: 'hidden',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          color: '#2d1a0a',
        }}
      >
        {/* Invalid strip */}
        <div style={{
          background: '#fef9e7',
          borderBottom: '2px dashed #f0c040',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.08em',
          color: '#7a5a00',
          textTransform: 'uppercase',
        }}>
          ⚠ COMPROBANTE INTERNO — NO VÁLIDO COMO FACTURA ⚠
        </div>

        {/* Header */}
        <div style={{
          background: '#4a2c14',
          color: '#fff',
          padding: '22px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-.02em' }}>FIBRARTE</div>
            <div style={{ fontSize: '11px', color: '#c8906a', marginTop: '3px' }}>Souvenirs personalizados en MDF</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>Salta Capital, Argentina</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#c8906a', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Comprobante de pedido
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)', marginTop: '4px' }}>{fecha}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Client block */}
          <div style={{
            background: '#fdfaf5', border: '1px solid #f2e8d0', borderRadius: '8px',
            padding: '14px 18px', marginBottom: '22px', display: 'flex', flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#a67c52', marginBottom: '3px' }}>Cliente</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{order.clientName}</div>
            </div>
            {order.clientPhone && (
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#a67c52', marginBottom: '3px' }}>Teléfono</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{order.clientPhone}</div>
              </div>
            )}
            {order.clientEmail && (
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#a67c52', marginBottom: '3px' }}>Email</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{order.clientEmail}</div>
              </div>
            )}
            {order.deliveryDate && (
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#a67c52', marginBottom: '3px' }}>Fecha de entrega</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {new Date(order.deliveryDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Items table */}
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#a67c52', marginBottom: '10px' }}>
            Detalle del pedido
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Producto / Descripción', 'Cant.', 'Precio unit.', 'Subtotal'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '8px 10px',
                    background: '#f9f4ec',
                    color: '#4a2c14',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    fontWeight: 700,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.id}>
                  {[item.name, item.quantity, fmt(item.price), fmt(item.subtotal)].map((val, i) => (
                    <td key={i} style={{
                      padding: '10px 10px',
                      borderBottom: idx < order.items.length - 1 ? '1px solid #f2e8d0' : 'none',
                      textAlign: i === 0 ? 'left' : 'right',
                      verticalAlign: 'middle',
                    }}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginTop: '18px', borderTop: '2px solid #f2e8d0', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#8b5e3c' }}>
              <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#8b5e3c' }}>
                <span>Descuento</span><span>− {fmt(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 5px', fontSize: '17px', fontWeight: 800, color: '#2d1a0a', borderTop: '2px solid #c8906a', marginTop: '8px' }}>
              <span>TOTAL</span><span>{fmt(order.total)}</span>
            </div>
            {order.deposit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', fontWeight: 600, color: '#1a7a3c' }}>
                <span>✓ Seña abonada</span><span>{fmt(order.deposit)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: order.balance <= 0 ? '13px' : '15px', fontWeight: 700, color: order.balance <= 0 ? '#1a7a3c' : '#c0392b' }}>
              <span>{order.balance <= 0 ? '✓ Saldo' : 'Saldo pendiente'}</span>
              <span>{order.balance <= 0 ? 'Pagado' : fmt(order.balance)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div style={{ marginTop: '20px', background: '#fdfaf5', border: '1px solid #f2e8d0', borderRadius: '8px', padding: '14px 18px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#a67c52', marginBottom: '8px' }}>Notas / Detalles</div>
              <div style={{ fontSize: '13px', color: '#8b5e3c', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{order.notes}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid #f2e8d0', background: '#fdfaf5', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#a67c52', lineHeight: 1.7 }}>
            Fibrarte · Souvenirs personalizados en MDF · Salta Capital, Argentina
          </div>
          <div style={{
            display: 'inline-block', marginTop: '8px', fontSize: '10px', fontWeight: 800,
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#7a5a00',
            background: '#fef9e7', border: '1.5px dashed #f0c040', padding: '4px 14px', borderRadius: '20px',
          }}>
            COMPROBANTE INTERNO — NO VÁLIDO COMO FACTURA
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
