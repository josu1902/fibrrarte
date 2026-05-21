import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function fmt(n: unknown) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Number(n));
}

export default async function ImprimirPedidoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { accion?: string };
}) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const autoPrint = searchParams.accion === 'descargar' || searchParams.accion === 'imprimir';
  const fecha = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Comprobante — {order.clientName} — Fibrarte</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #2d1a0a;
            background: #f5f0e8;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px;
          }

          .actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            width: 100%;
            max-width: 640px;
            flex-wrap: wrap;
          }
          .btn {
            flex: 1;
            min-width: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 11px 16px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: opacity .15s;
            font-family: inherit;
            text-decoration: none;
          }
          .btn:hover { opacity: .82; }
          .btn-print  { background: #4a2c14; color: #fff; }
          .btn-dl     { background: #fff; color: #4a2c14; border: 1.5px solid #c8906a; }
          .btn-share  { background: #fff; color: #4a2c14; border: 1.5px solid #c8906a; }

          .doc {
            background: #fff;
            width: 100%;
            max-width: 640px;
            border-radius: 12px;
            box-shadow: 0 2px 16px rgba(74,44,20,.10);
            overflow: hidden;
          }

          .invalid-strip {
            background: #fef9e7;
            border-bottom: 2px dashed #f0c040;
            text-align: center;
            padding: 8px 16px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            color: #7a5a00;
            text-transform: uppercase;
          }

          .doc-header {
            background: #4a2c14;
            color: #fff;
            padding: 22px 28px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
          }
          .brand { font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
          .brand-sub { font-size: 11px; color: #c8906a; margin-top: 3px; }
          .doc-meta { text-align: right; }
          .doc-type { font-size: 13px; font-weight: 700; color: #c8906a; text-transform: uppercase; letter-spacing: .06em; }
          .doc-date { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 4px; }

          .doc-body { padding: 24px 28px; }

          .client-block {
            background: #fdfaf5;
            border: 1px solid #f2e8d0;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 22px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
          }
          .client-field { flex: 1; min-width: 140px; }
          .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #a67c52; margin-bottom: 3px; }
          .field-val { font-size: 14px; color: #2d1a0a; font-weight: 500; }

          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #a67c52; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 8px 10px; background: #f9f4ec; color: #4a2c14; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
          th:not(:first-child) { text-align: right; }
          td { padding: 10px 10px; border-bottom: 1px solid #f2e8d0; color: #2d1a0a; vertical-align: middle; }
          td:not(:first-child) { text-align: right; }
          tr:last-child td { border-bottom: none; }

          .totals { margin-top: 18px; border-top: 2px solid #f2e8d0; padding-top: 14px; }
          .totals-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 13px; color: #8b5e3c; }
          .totals-row.grand { font-size: 17px; font-weight: 800; color: #2d1a0a; border-top: 2px solid #c8906a; margin-top: 8px; padding-top: 10px; }
          .totals-row.deposit { color: #1a7a3c; font-weight: 600; }
          .totals-row.balance { color: #c0392b; font-weight: 700; font-size: 15px; }
          .totals-row.paid { color: #1a7a3c; font-weight: 700; font-size: 14px; }

          .notes-block { margin-top: 20px; background: #fdfaf5; border: 1px solid #f2e8d0; border-radius: 8px; padding: 14px 18px; }
          .notes-text { font-size: 13px; color: #8b5e3c; line-height: 1.6; white-space: pre-wrap; }

          .doc-footer { margin-top: 28px; padding: 14px 28px; border-top: 1px solid #f2e8d0; background: #fdfaf5; text-align: center; }
          .footer-text { font-size: 11px; color: #a67c52; line-height: 1.7; }
          .invalid-footer { display: inline-block; margin-top: 8px; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #7a5a00; background: #fef9e7; border: 1.5px dashed #f0c040; padding: 4px 14px; border-radius: 20px; }

          @media print {
            body { background: #fff; padding: 0; }
            .actions { display: none; }
            .doc { box-shadow: none; border-radius: 0; max-width: 100%; }
          }
        `}</style>
      </head>
      <body>

        <div className="actions">
          <button id="btnDescargar" className="btn btn-dl">⬇ Descargar PDF</button>
          <button id="btnImprimir" className="btn btn-print">🖨 Imprimir</button>
          <button id="btnCompartir" className="btn btn-share">🔗 Compartir</button>
        </div>

        <div className="doc">

          <div className="invalid-strip">
            ⚠️ &nbsp; COMPROBANTE INTERNO — NO VÁLIDO COMO FACTURA &nbsp; ⚠️
          </div>

          <div className="doc-header">
            <div>
              <div className="brand">FIBRARTE</div>
              <div className="brand-sub">Souvenirs personalizados en MDF</div>
              <div className="brand-sub" style={{ marginTop: '2px', color: 'rgba(255,255,255,.4)' }}>Salta Capital, Argentina</div>
            </div>
            <div className="doc-meta">
              <div className="doc-type">Comprobante de pedido</div>
              <div className="doc-date">{fecha}</div>
            </div>
          </div>

          <div className="doc-body">

            <div className="client-block">
              <div className="client-field">
                <div className="field-label">Cliente</div>
                <div className="field-val">{order.clientName}</div>
              </div>
              {order.clientPhone && (
                <div className="client-field">
                  <div className="field-label">Teléfono</div>
                  <div className="field-val">{order.clientPhone}</div>
                </div>
              )}
              {order.clientEmail && (
                <div className="client-field">
                  <div className="field-label">Email</div>
                  <div className="field-val">{order.clientEmail}</div>
                </div>
              )}
              {order.deliveryDate && (
                <div className="client-field">
                  <div className="field-label">Fecha de entrega</div>
                  <div className="field-val">
                    {new Date(order.deliveryDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            <div className="section-title">Detalle del pedido</div>
            <table>
              <thead>
                <tr>
                  <th>Producto / Descripción</th>
                  <th>Cant.</th>
                  <th>Precio unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{fmt(item.price)}</td>
                    <td>{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="totals-row">
                  <span>Descuento</span>
                  <span>− {fmt(order.discount)}</span>
                </div>
              )}
              <div className="totals-row grand">
                <span>TOTAL</span>
                <span>{fmt(order.total)}</span>
              </div>
              {Number(order.deposit) > 0 && (
                <div className="totals-row deposit">
                  <span>✓ Seña abonada</span>
                  <span>{fmt(order.deposit)}</span>
                </div>
              )}
              <div className={`totals-row ${Number(order.balance) <= 0 ? 'paid' : 'balance'}`}>
                <span>{Number(order.balance) <= 0 ? '✓ Saldo' : 'Saldo pendiente'}</span>
                <span>{Number(order.balance) <= 0 ? 'Pagado' : fmt(order.balance)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="notes-block">
                <div className="section-title" style={{ marginBottom: '8px' }}>Notas / Detalles</div>
                <div className="notes-text">{order.notes}</div>
              </div>
            )}
          </div>

          <div className="doc-footer">
            <div className="footer-text">
              Fibrarte · Souvenirs personalizados en MDF · Salta Capital, Argentina
            </div>
            <div className="invalid-footer">COMPROBANTE INTERNO — NO VÁLIDO COMO FACTURA</div>
          </div>

        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          var autoPrint = ${autoPrint};
          var clientName = ${JSON.stringify(order.clientName)};

          document.getElementById('btnDescargar').addEventListener('click', function() {
            window.print();
          });
          document.getElementById('btnImprimir').addEventListener('click', function() {
            window.print();
          });
          document.getElementById('btnCompartir').addEventListener('click', async function() {
            var url = window.location.origin + '/admin/pedidos/${order.id}/imprimir';
            if (navigator.share) {
              try { await navigator.share({ title: 'Comprobante Fibrarte — ' + clientName, url: url }); } catch(e) {}
            } else {
              await navigator.clipboard.writeText(url);
              var btn = document.getElementById('btnCompartir');
              btn.textContent = '✓ Enlace copiado';
              setTimeout(function() { btn.textContent = '🔗 Compartir'; }, 2000);
            }
          });

          if (autoPrint) {
            window.addEventListener('load', function() {
              setTimeout(function() { window.print(); }, 400);
            });
          }
        `}} />
      </body>
    </html>
  );
}
