'use client';

import { useState } from 'react';
import { ImageDown, Printer, Share2, Check } from 'lucide-react';

export default function PrintActions({ orderId, clientName }: { orderId: number; clientName: string }) {
  const [copied, setCopied] = useState(false);
  const base = `/comprobante/${orderId}`;

  async function handleShare() {
    const url = window.location.origin + base;
    if (navigator.share) {
      try { await navigator.share({ title: `Comprobante Fibrarte — ${clientName}`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const btnCls = "inline-flex items-center gap-2 border border-brown-light/40 text-brown-medium hover:bg-beige px-4 py-2 rounded-xl text-sm font-medium transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`${base}?img=1`} target="_blank" rel="noopener noreferrer" className={btnCls}>
        <ImageDown size={15} /> Descargar imagen
      </a>
      <a href={base} target="_blank" rel="noopener noreferrer" className={btnCls}>
        <Printer size={15} /> Imprimir
      </a>
      <button onClick={handleShare} className={btnCls}>
        {copied ? <><Check size={15} className="text-green-600" /> Copiado</> : <><Share2 size={15} /> Compartir</>}
      </button>
    </div>
  );
}
