'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export type PosReceiptLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  /** Extensión con IVA de línea (lineSub + lineTax − dto línea). */
  lineTotal: number;
  lineSubtotal?: number;
  lineTax?: number;
  taxRate?: number;
};

export type PosReceiptData = {
  businessLabel: string;
  /** Número comercial confirmado (COM-…) o LOCAL-… */
  commercialNumber: string;
  soldAt: string;
  lines: PosReceiptLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  cashReceived?: number | null;
  change?: number | null;
  /** true = aún no confirmada por servidor */
  provisional?: boolean;
  localSaleId?: string | null;
  /** Aviso si el total servidor difiere del provisional cobrado */
  totalsAdjusted?: boolean;
  provisionalTotal?: number | null;
};

function money(n: number) {
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PosReceipt({
  data,
  onClose,
  onNewSale,
}: {
  data: PosReceiptData;
  onClose: () => void;
  onNewSale: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [paperMm, setPaperMm] = useState<'80' | '58'>('80');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center print:static print:inset-auto print:bg-transparent print:p-0"
      data-testid="pos-receipt"
      data-paper-mm={paperMm}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border bg-white p-5 shadow-lg print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 print:hidden">
          <span className="text-[11px] text-muted-foreground">Vista previa papel</span>
          <Button
            type="button"
            size="sm"
            variant={paperMm === '80' ? 'default' : 'outline'}
            className={paperMm === '80' ? 'bg-[#1e1e1e] hover:bg-[#2e2e2e]' : ''}
            onClick={() => setPaperMm('80')}
          >
            80 mm
          </Button>
          <Button
            type="button"
            size="sm"
            variant={paperMm === '58' ? 'default' : 'outline'}
            className={paperMm === '58' ? 'bg-[#1e1e1e] hover:bg-[#2e2e2e]' : ''}
            onClick={() => setPaperMm('58')}
          >
            58 mm
          </Button>
        </div>
        <div
          ref={printRef}
          className={`pos-ticket mx-auto ${paperMm === '58' ? 'max-w-[54mm]' : 'max-w-[72mm]'}`}
          data-ticket-width={paperMm}
        >
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800 print:text-black">
            COMPROBANTE NO FISCAL
          </p>
          {data.provisional ? (
            <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-center text-xs font-medium text-amber-900 print:border print:border-dashed print:bg-transparent">
              PENDIENTE DE SINCRONIZACIÓN
            </p>
          ) : (
            <p className="mt-2 text-center text-[11px] font-medium text-emerald-800 print:text-black">
              Confirmado por servidor
            </p>
          )}

          <h2 className="mt-2 text-center text-lg font-semibold text-[#1e1e1e]">{data.businessLabel}</h2>
          <p className="mt-1 text-center text-sm tabular-nums text-muted-foreground print:text-black">
            {data.commercialNumber}
          </p>
          {data.localSaleId ? (
            <p className="text-center text-[11px] text-muted-foreground print:text-black">
              Ref. local: {data.localSaleId.slice(0, 8).toUpperCase()}
            </p>
          ) : null}
          <p className="text-center text-xs text-muted-foreground print:text-black">
            {new Date(data.soldAt).toLocaleString('es-BO')}
          </p>

          {data.totalsAdjusted && data.provisionalTotal != null ? (
            <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-950 print:border-dashed">
              Importe definitivo del servidor (Bs {money(data.totalAmount)}) difiere del provisional
              cobrado (Bs {money(data.provisionalTotal)}). Se muestra el total confirmado; el
              provisional no se reescribe.
            </p>
          ) : null}

          <ul className="mt-4 space-y-2 border-y py-3">
            {data.lines.map((l, i) => (
              <li key={`${l.name}-${i}`} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-[#1e1e1e]">{l.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground print:text-black">
                    {l.quantity} × Bs {money(l.unitPrice)}
                    {l.taxRate != null ? ` · IVA ${l.taxRate}%` : ''}
                  </span>
                </span>
                <span className="tabular-nums">Bs {money(l.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground print:text-black">
              <span>Subtotal</span>
              <span className="tabular-nums">Bs {money(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground print:text-black">
              <span>Impuestos (IVA)</span>
              <span className="tabular-nums">Bs {money(data.taxAmount)}</span>
            </div>
            {data.discountAmount != null && data.discountAmount > 0 ? (
              <div className="flex justify-between text-muted-foreground print:text-black">
                <span>Descuento</span>
                <span className="tabular-nums">− Bs {money(data.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-semibold text-[#1e1e1e]">
              <span>Total</span>
              <span className="tabular-nums">Bs {money(data.totalAmount)}</span>
            </div>
            {data.cashReceived != null ? (
              <div className="flex justify-between text-muted-foreground print:text-black">
                <span>Efectivo recibido</span>
                <span className="tabular-nums">Bs {money(data.cashReceived)}</span>
              </div>
            ) : null}
            {data.change != null ? (
              <div className="flex justify-between text-muted-foreground print:text-black">
                <span>Cambio</span>
                <span className="tabular-nums">Bs {money(data.change)}</span>
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground print:text-black">
            Documento comercial interno. No constituye factura fiscal ni documento tributario SIAT.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" className="flex-1 gap-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="flex-1 bg-[#1e1e1e] hover:bg-[#2e2e2e]" onClick={onNewSale}>
            Nueva venta
          </Button>
        </div>
      </div>
    </div>
  );
}
